'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import type { Lead, Grupo } from '@/lib/types'

const ESTADO_LABEL: Record<string, string> = {
  new: 'Nuevo', contact: 'Contactado', interest: 'Por cerrar', closed: 'Inscrito'
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [lead, setLead] = useState<Lead | null>(null)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [selectedGrupo, setSelectedGrupo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: l }, { data: g }] = await Promise.all([
        supabase.from('leads').select('*').eq('id', params.id).single(),
        supabase.from('grupos').select('*').order('nombre'),
      ])
      setLead(l)
      setGrupos(g || [])
    }
    load()
  }, [params.id])

  async function changeEstado(estado: string) {
    if (!lead) return
    setSaving(true)
    await supabase.from('leads').update({ estado }).eq('id', lead.id)
    setLead({ ...lead, estado: estado as Lead['estado'] })
    setSaving(false)
  }

  async function vincularGrupo() {
    if (!lead || !selectedGrupo) return
    setSaving(true)
    await supabase.from('leads').update({ grupo_id: parseInt(selectedGrupo), estado: 'closed' }).eq('id', lead.id)
    setLead({ ...lead, grupo_id: parseInt(selectedGrupo), estado: 'closed' })
    setSaving(false)
  }

  async function desvincularGrupo() {
    if (!lead) return
    setSaving(true)
    await supabase.from('leads').update({ grupo_id: null }).eq('id', lead.id)
    setLead({ ...lead, grupo_id: null })
    setSaving(false)
  }

  if (!lead) return (
    <>
      <PageHeader title="Prospecto" backHref="/dashboard/crm" />
      <div className="page-content" style={{ color: 'var(--dim)', fontSize: 13 }}>Cargando…</div>
    </>
  )

  const grupoActual = grupos.find(g => g.id === lead.grupo_id)

  return (
    <>
      <PageHeader title={lead.nombre} backHref="/dashboard/crm" />
      <div className="page-content">
        <div className="two-col">
          {/* Info */}
          <div className="card">
            <div className="card-header"><span className="card-title">Información</span></div>
            <div className="card-body">
              {[
                ['Celular', lead.celular],
                ['Correo', lead.correo],
                ['Fuente', lead.fuente],
                ['Tiene grupo', lead.tiene_grupo ? 'Sí' : 'No'],
                ['Notas', lead.nota],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={String(k)} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--dim)', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 12, color: 'var(--cream)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado + grupo */}
          <div className="card">
            <div className="card-header"><span className="card-title">Estado y grupo</span></div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--dim)', marginBottom: 8 }}>Estado</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['new', 'contact', 'interest', 'closed'] as const).map(est => (
                    <button
                      key={est}
                      className={`btn btn-sm ${lead.estado === est ? 'btn-gold' : ''}`}
                      onClick={() => changeEstado(est)}
                      disabled={saving}
                    >
                      {ESTADO_LABEL[est]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--dim)', marginBottom: 8 }}>Grupo asignado</div>
                {grupoActual ? (
                  <div>
                    <span className="pill pill-closed">✓ {grupoActual.nombre}</span>
                    <br />
                    <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={desvincularGrupo}>Desvincular</button>
                  </div>
                ) : (
                  <div>
                    <select
                      value={selectedGrupo}
                      onChange={e => setSelectedGrupo(e.target.value)}
                      style={{ marginBottom: 8 }}
                    >
                      <option value="">— Seleccionar grupo —</option>
                      {grupos.map(g => (
                        <option key={g.id} value={g.id}>{g.nombre}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-gold"
                      style={{ width: '100%', padding: '8px' }}
                      onClick={vincularGrupo}
                      disabled={!selectedGrupo || saving}
                    >
                      Vincular al grupo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
