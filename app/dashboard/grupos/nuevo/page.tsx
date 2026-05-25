'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'

export default function NuevoGrupoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profesores, setProfesores] = useState<any[]>([])

  useEffect(() => {
    supabase.from('profiles').select('id, nombre').eq('role', 'profesor').then(({ data }) => {
      setProfesores(data || [])
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const profesorId = fd.get('profesor_id') as string
    const profesor = profesores.find(p => p.id === profesorId)

    const { data: grupo, error } = await supabase.from('grupos').insert({
      nombre: fd.get('nombre'),
      horario: fd.get('horario'),
      dias: fd.get('dias'),
      profesor_id: profesorId,
      profesor_nombre: profesor?.nombre || '',
      max_alumnos: 4,
    }).select().single()

    if (!error && grupo) {
      // Create 3 sessions + cierre
      await supabase.from('sesiones').insert([
        { grupo_id: grupo.id, numero: 1, realizada: false, no_realizada: false, correo_enviado: false, foto_adjunta: false, feedback: '' },
        { grupo_id: grupo.id, numero: 2, realizada: false, no_realizada: false, correo_enviado: false, foto_adjunta: false, feedback: '' },
        { grupo_id: grupo.id, numero: 3, realizada: false, no_realizada: false, correo_enviado: false, foto_adjunta: false, feedback: '' },
      ])
      await supabase.from('cierre').insert({
        grupo_id: grupo.id, nps_enviado: false, certificado_enviado: false, pago_confirmado: false
      })
      setSaved(true)
      setTimeout(() => router.push('/dashboard/grupos'), 800)
    }
    setLoading(false)
  }

  return (
    <>
      <PageHeader title="Nuevo grupo" backHref="/dashboard/grupos" />
      <div className="page-content">
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-header"><span className="card-title">Datos del grupo</span></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid form-grid-2" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label>Nombre del grupo</label>
                  <input name="nombre" placeholder="Ej: Grupo 4 — Lun/Mié AM" required />
                </div>
                <div className="form-group">
                  <label>Profesor</label>
                  <select name="profesor_id" required>
                    <option value="">— Seleccionar —</option>
                    {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label>Días</label>
                  <select name="dias">
                    <option>Lun/Mié</option>
                    <option>Mar/Jue</option>
                    <option>Mié/Vie</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Horario</label>
                  <select name="horario">
                    <option>11:00–12:30</option>
                    <option>18:00–19:30</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={`form-submit${saved ? ' success' : ''}`} disabled={loading || saved}>
                {saved ? '✓ Creado' : loading ? 'Creando…' : 'Crear grupo'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
