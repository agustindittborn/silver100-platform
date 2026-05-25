'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'

const SESIONES = [
  { n: 1, label: 'Material Sesión 1 — Conceptos clave + Claude' },
  { n: 2, label: 'Material Sesión 2 — Trabajando en Claude I' },
  { n: 3, label: 'Material Sesión 3 — Claude avanzado + proyectos' },
]

export default function MaterialPage() {
  const supabase = createClient()
  const [role, setRole] = useState<string>('')
  const [items, setItems] = useState<any[]>([])
  const [uploading, setUploading] = useState<number | null>(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    setRole(prof?.role || '')
    const { data: mat } = await supabase.from('material').select('*').order('sesion_numero').order('created_at')
    setItems(mat || [])
  }

  useEffect(() => { load() }, [])

  async function handleUpload(sesionNum: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(sesionNum)
    const path = `material/s${sesionNum}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('silver100').upload(path, file)
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('silver100').getPublicUrl(path)
      await supabase.from('material').insert({
        sesion_numero: sesionNum,
        nombre: file.name,
        url: publicUrl,
      })
      await load()
    }
    setUploading(null)
    e.target.value = ''
  }

  async function removeFile(id: number) {
    await supabase.from('material').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const isAdmin = role === 'admin'

  return (
    <>
      <PageHeader title={isAdmin ? 'Material del curso' : 'Material'} />
      <div className="page-content">
        {SESIONES.map(({ n, label }) => {
          const files = items.filter(i => i.sesion_numero === n)
          return (
            <div key={n} className="mat-session">
              <div className="mat-session-header">
                <span className="mat-session-title">{label}</span>
                <span className={`pill ${files.length > 0 ? 'pill-ok' : 'pill-pend'}`}>
                  {files.length > 0 ? `${files.length} archivo${files.length > 1 ? 's' : ''}` : 'Sin archivos'}
                </span>
              </div>
              <div className="mat-session-body">
                {files.map(f => (
                  <div key={f.id} className="file-item">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--gold)" strokeWidth="1.4">
                      <path d="M2 1h6l3 3v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z"/>
                    </svg>
                    <span className="file-item-name">{f.nombre}</span>
                    <a href={f.url} target="_blank" rel="noreferrer" className="btn btn-sm">Abrir</a>
                    {isAdmin && (
                      <button className="file-item-rm" onClick={() => removeFile(f.id)}>Eliminar</button>
                    )}
                  </div>
                ))}

                {isAdmin && (
                  <label className={`upload-zone${uploading === n ? ' has-file' : ''}`} style={{ display: 'block', cursor: 'pointer' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--dim)" strokeWidth="1.4">
                      <path d="M9 12V3M5 7l4-4 4 4M3 15h12"/>
                    </svg>
                    <div className="upload-zone-text">
                      {uploading === n ? 'Subiendo…' : 'Subir archivo (PDF, PPT)'}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={e => handleUpload(n, e)}
                      disabled={uploading !== null}
                    />
                  </label>
                )}

                {!isAdmin && files.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>Disponible próximamente</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
