'use client'
import { useRouter } from 'next/navigation'

export default function PageHeader({ title, backHref, actions }: {
  title: string; backHref?: string; actions?: React.ReactNode
}) {
  const router = useRouter()
  return (
    <div className="topbar">
      {backHref && (
        <button className="btn-back" onClick={() => router.push(backHref)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2L4 6l4 4"/>
          </svg>
          Volver
        </button>
      )}
      <div className="topbar-title">{title}</div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </div>
  )
}
