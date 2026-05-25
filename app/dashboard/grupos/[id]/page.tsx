'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import type { Grupo, Sesion, Cierre, Lead } from '@/lib/types'

function CheckItem({ id, label, checked, onChange }: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className={`check-item${checked ? ' checked' : ''}`} htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function FotoZone({ uploaded, onUpload }: { uploaded: boolean; onUpload: () => void }) {
  return (
    <div className={`foto-zone${uploaded ? ' uploaded' : ''}`} onClick={onUpload}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={uploaded ? 'var(--green)' : 'var(--dim)'} strokeWidth="1.4">
        <rect x="1" y="4" width="18" height="13" rx="2"/>
        <circle cx="10" cy="11" r="3"/>
        <path d="M7 4l1.5-2.5h3L13 4"/>
      </svg>
      <div className="foto-zone-text">
        {uploaded ? '✓ foto_grupal.jpg · adjunta' : 'Adjuntar foto grupal'}
      </div>
    </div>
  )
}

export default function GrupoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const gid = Number(params.id)

  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [cierre, setCierre] = useState<Cierre | null>(null)
  const [alumnos, setAlumnos] = useState<Lead[]>([])
  const [profile, setProfile] = useState<any>(null)

  async function load() {
    const [{ data: { user } }] = [await supabase.auth.getUser()]
    const [{ data: prof }, { data: g }, { data: ss }, { data: c }, { data: al }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user!.id).single(),
      supabase.from('grupos').select('*').eq('id', gid).single(),
      supabase.from('sesiones').select('*').eq('grupo_id', gid).order('numero'),
      supabase.from('cierre').select('*').eq('grupo_id', gid).single(),
      supabase.from('leads').select('*').eq('grupo_id', gid).eq('estado', 'closed'),
    ])
    setProfile(prof)
    setGrupo(g)
    setSesiones(ss || [])
    setCierre(c)
    setAlumnos(al || [])
  }

  useEffect(() => { load() }, [gid])

  async function updateSesion(id: number, updates: Partial<Sesion>) {
    await supabase.from('sesiones').update(updates).eq('id', id)
    setSesiones(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  async function updateCierre(updates: Partial<Cierre>) {
    if (!cierre) return
    await supabase.from('cierre').update(updates).eq('id', cierre.id)
    setCierre({ ...cierre, ...updates })
  }

  if (!grupo) return (
    <>
      <PageHeader title="Grupo" backHref="/dashboard/grupos" />
      <div className="page-content" style={{ color: 'var(--dim)', fontSize: 13 }}>Cargando…</div>
    </>
  )

  const isAdmin = profile?.role === 'admin'

  const sesionStatus = (s: Sesion) => {
    if (s.no_realizada) return { cls: 'pill-no', txt: 'No realizada' }
    if (!s.realizada) return { cls: 'pill-pend', txt: 'Pendiente' }
    const checks = [s.realizada, s.correo_enviado, s.numero === 3 ? s.foto_adjunta : true].filter(Boolean).length
    const total = s.numero === 3 ? 3 : 2
    if (checks >= total) return { cls: 'pill-ok', txt: 'Completa' }
    return { cls: 'pill-pend', txt: `${checks}/${total}` }
  }

  const cierreOk = cierre?.nps_enviado && cierre?.certificado_enviado && cierre?.pago_confirmado

  return (
    <>
      <PageHeader title={grupo.nombre} backHref="/dashboard/grupos" />
      <div className="page-content">
        {/* Info strip */}
        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 12 }}>
          <span style={{ color: 'var(--cream)' }}>{grupo.profesor_nombre}</span>
          {' · '}{grupo.dias} {grupo.horario}
          {' · '}{alumnos.length}/{grupo.max_alumnos} alumnos
          {' · '}
          {alumnos.map(a => <span key={a.id} style={{ color: 'var(--cream)', marginRight: 8 }}>{a.nombre}</span>)}
        </div>

        {/* CRM columns */}
        <div className="grupo-crm">
          {sesiones.map((s, idx) => {
            const st = sesionStatus(s)
            const prevDone = idx === 0 || sesiones[idx - 1].realizada || sesiones[idx - 1].no_realizada
            const isBlocked = !prevDone && !s.realizada && !s.no_realizada
            const isActive = prevDone && !s.realizada && !s.no_realizada

            return (
              <div key={s.id} className="grupo-crm-col">
                <div className="grupo-crm-header">
                  <div className="grupo-crm-header-title">Sesión {s.numero}</div>
                  <span className={`pill ${st.cls}`}>{st.txt}</span>
                </div>
                <div className="grupo-crm-body">
                  <div className={`session-card${isActive ? ' active' : s.realizada || s.no_realizada ? ' done' : isBlocked ? ' blocked' : ''}`}>
                    {s.no_realizada ? (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>Clase no realizada</div>
                        <button className="btn btn-sm" onClick={() => updateSesion(s.id, { no_realizada: false })}>Deshacer</button>
                      </div>
                    ) : (
                      <>
                        <div className="check-list">
                          <CheckItem
                            id={`cr-${s.id}`}
                            label="Clase realizada"
                            checked={s.realizada}
                            onChange={v => updateSesion(s.id, { realizada: v })}
                          />
                          <CheckItem
                            id={`ce-${s.id}`}
                            label="Correo enviado"
                            checked={s.correo_enviado}
                            onChange={v => updateSesion(s.id, { correo_enviado: v })}
                          />
                          {s.numero === 3 && (
                            <CheckItem
                              id={`cf-${s.id}`}
                              label="Foto grupal"
                              checked={s.foto_adjunta}
                              onChange={v => updateSesion(s.id, { foto_adjunta: v })}
                            />
                          )}
                        </div>

                        {s.numero === 3 && (
                          <FotoZone
                            uploaded={s.foto_adjunta}
                            onUpload={() => updateSesion(s.id, { foto_adjunta: true })}
                          />
                        )}

                        <div className="session-feedback" style={{ marginTop: 8 }}>
                          <textarea
                            rows={2}
                            placeholder="Feedback de la clase…"
                            defaultValue={s.feedback}
                            disabled={!s.realizada}
                            onBlur={e => updateSesion(s.id, { feedback: e.target.value })}
                            style={{ fontSize: 11 }}
                          />
                        </div>

                        {!s.realizada && !s.no_realizada && (
                          <div className="session-actions">
                            <button className="btn-no-realizada" onClick={() => updateSesion(s.id, { no_realizada: true })}>
                              ✗ No se realizó
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Cierre column */}
          <div className="grupo-crm-col">
            <div className="grupo-crm-header">
              <div className="grupo-crm-header-title">Cierre</div>
              <span className={`pill ${cierreOk ? 'pill-ok' : 'pill-pend'}`}>{cierreOk ? 'Completo' : 'Pendiente'}</span>
            </div>
            <div className="grupo-crm-body">
              {cierre && (
                <div className={`session-card${cierreOk ? ' done' : ''}`}>
                  <div className="check-list">
                    <CheckItem id="c-nps" label="NPS enviado" checked={cierre.nps_enviado} onChange={v => updateCierre({ nps_enviado: v })} />
                    <CheckItem id="c-cert" label="Certificado enviado" checked={cierre.certificado_enviado} onChange={v => updateCierre({ certificado_enviado: v })} />
                    <CheckItem id="c-pago" label="Pago confirmado" checked={cierre.pago_confirmado} onChange={v => updateCierre({ pago_confirmado: v })} />
                  </div>
                  {cierreOk && <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 8 }}>✓ Grupo cerrado</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alumnos — solo admin */}
        {isAdmin && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Alumnos</span>
              <button className="card-action" onClick={() => router.push('/dashboard/crm')}>
                + Vincular desde Prospectos
              </button>
            </div>
            <div className="card-body">
              {alumnos.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>Sin alumnos. Vincula leads desde Prospectos.</div>
              ) : alumnos.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--bdr)' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--cream)' }}>{a.nombre}</div>
                    <div style={{ fontSize: 10, color: 'var(--dim)' }}>{a.celular}</div>
                  </div>
                  <span className="pill pill-closed">Inscrito</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
