'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function signInWithGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <span className="login-logo-dot" />
          <span className="login-logo-name">SILVER100</span>
        </div>
        <div className="login-card">
          <div className="login-title">Bienvenido</div>
          <div className="login-subtitle">
            Plataforma interna para profesores, alumnos y administradores.
          </div>
          <button className="btn-google" onClick={signInWithGoogle} disabled={loading}>
            <svg viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? 'Redirigiendo…' : 'Continuar con Google'}
          </button>
          <div style={{ marginTop: 20, fontSize: 11, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.6 }}>
            Al ingresar, si es tu primera vez<br />te pediremos que indiques tu rol.
          </div>
        </div>
      </div>
    </div>
  )
}
