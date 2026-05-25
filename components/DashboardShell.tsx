'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { UserProfile } from '@/lib/types'

const NAV: Record<string, any[]> = {
  admin: [
    { sep: 'Comercial' },
    { id: 'crm', href: '/dashboard/crm', label: 'Prospectos' },
    { id: 'cobros', href: '/dashboard/cobros', label: 'Cobros' },
    { sep: 'Operación' },
    { id: 'grupos', href: '/dashboard/grupos', label: 'Grupos' },
    { id: 'material', href: '/dashboard/material', label: 'Material' },
    { sep: 'Análisis' },
    { id: 'nps', href: '/dashboard/nps', label: 'NPS' },
  ],
  profesor: [
    { sep: 'Clases' },
    { id: 'grupos', href: '/dashboard/grupos', label: 'Mis grupos' },
    { sep: 'Recursos' },
    { id: 'material', href: '/dashboard/material', label: 'Material' },
  ],
  alumno: [
    { sep: 'Mi curso' },
    { id: 'progreso', href: '/dashboard/progreso', label: 'Mi progreso' },
    { id: 'material', href: '/dashboard/material', label: 'Material' },
  ],
}

const ICONS: Record<string, React.ReactNode> = {
  crm: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="5" r="2.5"/><circle cx="11" cy="5" r="2"/><path d="M1 14c0-2.5 2-4 5-4s5 1.5 5 4"/><path d="M11 9c2 0 4 1 4 3.5"/></svg>,
  cobros: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 7h14M5 11h2M9 11h2"/></svg>,
  grupos: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
  material: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 1h7l3 3v10a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z"/><path d="M10 1v3h3M5 8h6M5 11h4"/></svg>,
  nps: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 13V7l3-5h6l3 5v6H2z"/><path d="M8 6v4M8 12v.5"/></svg>,
  progreso: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v3.5l2.5 1.5"/></svg>,
}

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', profesor: 'Profesor', alumno: 'Alumno' }

function getInitials(nombre: string) {
  return nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function DashboardShell({ profile, children }: { profile: UserProfile; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const nav = NAV[profile.role] || NAV.alumno

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-brand-row"><div className="sb-dot" /><span className="sb-name">SILVER100</span></div>
          <div className="sb-role-label">{profile.role}</div>
        </div>
        <nav className="sb-nav">
          {nav.map((item: any, i: number) => {
            if (item.sep) return <div key={i} className="sb-section">{item.sep}</div>
            const active = pathname.startsWith(item.href)
            return (
              <button key={item.id} className={`sb-item${active ? ' active' : ''}`} onClick={() => router.push(item.href)}>
                {ICONS[item.id]}
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="sb-footer">
          <div className="sb-avatar">{getInitials(profile.nombre)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-uname" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.nombre}</div>
            <button className="sb-urole" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      <div className="main-area">{children}</div>
    </div>
  )
}
