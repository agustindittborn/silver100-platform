'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'

export default function NuevoLeadPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.from('leads').insert({
      nombre: fd.get('nombre'),
      celular: fd.get('celular'),
      correo: fd.get('correo'),
      fuente: fd.get('fuente'),
      tiene_grupo: fd.get('tiene_grupo') === 'si',
      nota: fd.get('nota'),
      estado: 'new',
      pago_confirmado: false,
    })
    if (!error) {
      setSaved(true)
      setTimeout(() => router.push('/dashboard/crm'), 800)
    }
    setLoading(false)
  }

  return (
    <>
      <PageHeader title="Nuevo prospecto" backHref="/dashboard/crm" />
      <div className="page-content">
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-header"><span className="card-title">Datos del prospecto</span></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Nombre y apellido</label>
                  <input name="nombre" placeholder="Nombre completo" required />
                </div>
                <div className="form-group">
                  <label>Celular</label>
                  <input name="celular" type="tel" placeholder="+56 9 XXXX XXXX" required />
                </div>
              </div>
              <div className="form-grid form-grid-2" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label>Correo</label>
                  <input name="correo" type="email" placeholder="correo@email.com" />
                </div>
                <div className="form-group">
                  <label>Fuente</label>
                  <select name="fuente">
                    <option>WhatsApp</option>
                    <option>Landing</option>
                    <option>Referido</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>
              <div className="form-grid" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label>¿Tiene grupo formado?</label>
                  <select name="tiene_grupo">
                    <option value="no">No, busca grupo</option>
                    <option value="si">Sí, tiene grupo listo</option>
                  </select>
                </div>
              </div>
              <div className="form-grid" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label>Notas</label>
                  <textarea name="nota" rows={3} placeholder="Horario preferido, observaciones..." />
                </div>
              </div>
              <button
                type="submit"
                className={`form-submit${saved ? ' success' : ''}`}
                disabled={loading || saved}
              >
                {saved ? '✓ Guardado' : loading ? 'Guardando…' : 'Guardar prospecto'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
