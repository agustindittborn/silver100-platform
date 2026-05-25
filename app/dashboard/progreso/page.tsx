import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'

export default async function ProgresoPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: lead } = await supabase.from('leads').select('*, grupos(*, sesiones(*))').eq('correo', profile?.email).single()

  const grupo = (lead as any)?.grupos
  const sesiones = grupo?.sesiones?.sort((a: any, b: any) => a.numero - b.numero) || []
  const realizadas = sesiones.filter((s: any) => s.realizada).length
  const progreso = sesiones.length > 0 ? Math.round((realizadas / sesiones.length) * 100) : 0

  return (
    <>
      <PageHeader title="Mi progreso" />
      <div className="page-content">
        <div className="metrics metrics-3">
          <div className="metric-card">
            <div className="metric-value green">{realizadas} de {sesiones.length}</div>
            <div className="metric-label">Sesiones completadas</div>
          </div>
          <div className="metric-card">
            <div className="metric-value gold">{progreso}%</div>
            <div className="metric-label">Progreso</div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{grupo?.horario || '—'}</div>
            <div className="metric-label">Horario</div>
          </div>
        </div>

        {grupo ? (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Mis sesiones — {grupo.nombre}</span>
            </div>
            <div className="card-body">
              <div className="sched-list">
                {sesiones.map((s: any, i: number) => {
                  const labels = [
                    'Conceptos clave + inicio Claude',
                    'Trabajando en Claude — parte 1',
                    'Trabajando en Claude — parte 2',
                  ]
                  const isNext = !s.realizada && sesiones.slice(0, i).every((prev: any) => prev.realizada)
                  return (
                    <div key={s.id} className={`sched-item${isNext ? ' today' : ''}`}>
                      <div className="sched-time" style={{ color: s.realizada ? 'var(--green)' : 'var(--gold)' }}>
                        {s.realizada ? '✓ Hecha' : isNext ? 'Próxima' : `S${s.numero}`}
                      </div>
                      <div className="sched-info">
                        <div className="sched-name">Sesión {s.numero} — {labels[i]}</div>
                        <div className="sched-meta">
                          {s.realizada ? `Completada` : isNext ? `${grupo.dias} · ${grupo.horario}` : 'Pendiente'}
                        </div>
                      </div>
                      {isNext && <span className="pill pill-pend">Próxima</span>}
                      {s.realizada && <span className="pill pill-ok">Completada</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body" style={{ color: 'var(--dim)', fontSize: 13 }}>
              Aún no estás asignado a un grupo. Te contactaremos pronto para coordinar.
            </div>
          </div>
        )}
      </div>
    </>
  )
}
