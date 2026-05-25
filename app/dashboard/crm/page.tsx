import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'
import type { Lead } from '@/lib/types'

const ESTADO_LABEL: Record<string, string> = {
  new: 'Nuevo', contact: 'Contactado', interest: 'Por cerrar', closed: 'Inscrito'
}
const COLS = ['new', 'contact', 'interest', 'closed'] as const

function Pill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'pill pill-new', contact: 'pill pill-contact',
    interest: 'pill pill-interest', closed: 'pill pill-closed',
  }
  return <span className={map[status] || 'pill'}>{ESTADO_LABEL[status] || status}</span>
}

export default async function CRMPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'alumno') redirect('/dashboard/progreso')

  const { data: leads = [] } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const all = leads as Lead[]
  const byEstado = (est: string) => all.filter(l => l.estado === est)
  const inscritos = byEstado('closed')
  const facturado = inscritos.length * 120000

  return (
    <>
      <PageHeader
        title="Prospectos"
        actions={
          <Link href="/dashboard/crm/nuevo" className="btn btn-gold">
            + Nuevo lead
          </Link>
        }
      />
      <div className="page-content">
        {/* Metrics */}
        <div className="metrics metrics-4">
          <div className="metric-card">
            <div className="metric-value red">{byEstado('new').length}</div>
            <div className="metric-label">Sin contactar</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{byEstado('contact').length}</div>
            <div className="metric-label">En conversación</div>
          </div>
          <div className="metric-card">
            <div className="metric-value green">{inscritos.length}</div>
            <div className="metric-label">Inscritos</div>
          </div>
          <div className="metric-card">
            <div className="metric-value gold">${facturado.toLocaleString('es-CL')}</div>
            <div className="metric-label">Facturado</div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="pipeline">
          {COLS.map(col => {
            const items = byEstado(col)
            return (
              <div key={col} className="pipe-col">
                <div className="pipe-header">
                  <span className="pipe-label">{ESTADO_LABEL[col]}</span>
                  <span className="pipe-count">{items.length}</span>
                </div>
                {items.map(lead => (
                  <Link key={lead.id} href={`/dashboard/crm/${lead.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className={`pipe-card ${col === 'new' ? 'highlight' : ''}`}>
                      <div className="pipe-card-name">{lead.nombre}</div>
                      <div className="pipe-card-meta">{lead.fuente} · {new Date(lead.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}</div>
                      {col === 'new' && (
                        <div className="pipe-card-tag" style={{ color: 'var(--red)' }}>⚠ Sin contactar</div>
                      )}
                      {lead.grupo_id && (
                        <div className="pipe-card-tag" style={{ color: 'var(--green)' }}>✓ En grupo</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )
          })}
        </div>

        {/* Full table */}
        <div className="card">
          <div className="card-header"><span className="card-title">Todos los leads</span></div>
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Celular</th><th>Fuente</th><th>Estado</th><th>Fecha</th><th></th>
              </tr>
            </thead>
            <tbody>
              {all.map(lead => (
                <tr key={lead.id}>
                  <td className="bold">{lead.nombre}</td>
                  <td>{lead.celular}</td>
                  <td>{lead.fuente}</td>
                  <td><Pill status={lead.estado} /></td>
                  <td>{new Date(lead.created_at).toLocaleDateString('es-CL')}</td>
                  <td>
                    <Link href={`/dashboard/crm/${lead.id}`} className="btn btn-sm">Ver →</Link>
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--dim)', padding: '24px' }}>Sin leads aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
