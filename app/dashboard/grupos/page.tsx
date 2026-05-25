import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'

export default async function GruposPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  let query = supabase.from('grupos').select('*, sesiones(*), cierre(*)')
  if (profile?.role === 'profesor') {
    query = query.eq('profesor_id', user.id)
  }
  const { data: grupos = [] } = await query.order('nombre')

  const { data: leads = [] } = await supabase.from('leads').select('id, grupo_id').eq('estado', 'closed')

  const alumnosPorGrupo = (gid: number) => leads.filter((l: any) => l.grupo_id === gid).length

  function sesionStatus(s: any) {
    if (!s) return 'todo'
    if (s.no_realizada) return 'no'
    if (s.realizada) return 'done'
    return 'todo'
  }

  function PillStatus({ status }: { status: string }) {
    if (status === 'done') return <span className="pill pill-ok">✓</span>
    if (status === 'no') return <span className="pill pill-no">✗</span>
    return <span className="pill pill-pend">—</span>
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Grupos' : 'Mis grupos'}
        actions={isAdmin ? (
          <Link href="/dashboard/grupos/nuevo" className="btn btn-gold">+ Nuevo grupo</Link>
        ) : undefined}
      />
      <div className="page-content">
        <div className="metrics metrics-4">
          <div className="metric-card"><div className="metric-value">{grupos.length}</div><div className="metric-label">Grupos activos</div></div>
          <div className="metric-card"><div className="metric-value green">{leads.length}</div><div className="metric-label">Alumnos totales</div></div>
          <div className="metric-card"><div className="metric-value">{new Set(grupos.map((g: any) => g.profesor_id)).size}</div><div className="metric-label">Profesores</div></div>
          <div className="metric-card"><div className="metric-value gold">${(leads.length * 120000).toLocaleString('es-CL')}</div><div className="metric-label">Facturado</div></div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Grupos</span></div>
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Profesor</th>
                <th>Horario</th>
                <th>Alumnos</th>
                <th>S1</th><th>S2</th><th>S3</th>
                <th>Cierre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(grupos as any[]).map(g => {
                const ss = (g.sesiones || []).sort((a: any, b: any) => a.numero - b.numero)
                const cierre = g.cierre?.[0]
                const cierreOk = cierre?.nps_enviado && cierre?.certificado_enviado && cierre?.pago_confirmado
                return (
                  <tr key={g.id}>
                    <td className="bold link" onClick={() => {}}>
                      <Link href={`/dashboard/grupos/${g.id}`} style={{ color: 'var(--gold)' }}>{g.nombre}</Link>
                    </td>
                    <td>{g.profesor_nombre}</td>
                    <td>{g.horario}</td>
                    <td>{alumnosPorGrupo(g.id)}/{g.max_alumnos}</td>
                    <td><PillStatus status={sesionStatus(ss[0])} /></td>
                    <td><PillStatus status={sesionStatus(ss[1])} /></td>
                    <td><PillStatus status={sesionStatus(ss[2])} /></td>
                    <td>{cierreOk ? <span className="pill pill-ok">✓</span> : <span className="pill pill-pend">—</span>}</td>
                    <td><Link href={`/dashboard/grupos/${g.id}`} className="btn btn-sm">Ver →</Link></td>
                  </tr>
                )
              })}
              {grupos.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--dim)', padding: 24 }}>Sin grupos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
