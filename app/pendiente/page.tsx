import Link from 'next/link'

export default function PendientePage() {
  return (
    <div className="pending-page">
      <div className="pending-box">
        <div className="pending-icon">⏳</div>
        <div className="pending-title">Cuenta en revisión</div>
        <p className="pending-text">
          Tu solicitud de acceso como profesor fue recibida.<br /><br />
          Agustín revisará tu cuenta y te avisará por correo cuando esté aprobada.
          Normalmente toma menos de 24 horas.
        </p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: 24, fontSize: 12, color: 'var(--gold)' }}>
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
