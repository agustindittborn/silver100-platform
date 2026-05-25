'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ROLES = [
  { id: 'alumno', icon: '📖', title: 'Soy alumno', desc: 'Quiero ver mi progreso y el material del curso' },
  { id: 'profesor', icon: '🎓', title: 'Soy profesor', desc: 'Quiero gestionar mis grupos y registrar clases' },
]

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string>('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    if (!selected || !nombre.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const aprobado = selected === 'alumno' // alumnos entran directo, profesores esperan aprobación
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      nombre: nombre.trim(),
      role: selected,
      aprobado,
    })

    if (aprobado) {
      router.push('/dashboard')
    } else {
      router.push('/pendiente')
    }
  }

  return (
    <div className="login-page">
      <div className="login-box" style={{ maxWidth: 460 }}>
        <div className="login-logo">
          <span className="login-logo-dot" />
          <span className="login-logo-name">SILVER100</span>
        </div>
        <div className="login-card">
          <div className="login-title">¡Bienvenido!</div>
          <div className="login-subtitle">Cuéntanos quién eres para mostrarte lo que necesitas.</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--dim)', marginBottom: 6 }}>
              Tu nombre completo
            </label>
            <input
              type="text"
              placeholder="Nombre y apellido"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>

          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--dim)', marginBottom: 8 }}>
            ¿Cuál es tu rol?
          </div>
          <div className="role-grid">
            {ROLES.map(r => (
              <div
                key={r.id}
                className={`role-card${selected === r.id ? ' selected' : ''}`}
                onClick={() => setSelected(r.id)}
              >
                <div className="role-card-icon">{r.icon}</div>
                <div className="role-card-title">{r.title}</div>
                <div className="role-card-desc">{r.desc}</div>
              </div>
            ))}
          </div>

          {selected === 'profesor' && (
            <div className="login-info">
              Tu acceso será revisado por el administrador antes de poder ingresar.
            </div>
          )}

          <button
            className="form-submit"
            onClick={handleSubmit}
            disabled={!selected || !nombre.trim() || loading}
          >
            {loading ? 'Guardando…' : 'Ingresar a Silver100'}
          </button>
        </div>
      </div>
    </div>
  )
}
