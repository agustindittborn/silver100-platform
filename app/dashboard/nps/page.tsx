import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'

export default async function NPSPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: nps = [] } = await supabase
    .from('nps')
    .select('*')
    .order('created_at', { ascending: false })

  const scores = (nps as any[]).map(n => n.score)
  const promotores = scores.filter(s => s >= 9).length
  const pasivos = scores.filter(s => s >= 7 && s < 9).length
  const detractores = scores.filter(s => s < 7).length
  const total = scores.length
  const npsScore = total > 0
    ? Math.round(((promotores - detractores) / total) * 100)
    : 0

  return (
    <>
      <PageHeader
        title="NPS & satisfacción"
        actions={<button className="btn btn-ghost">Enviar encuesta</button>}
      />
      <div className="page-content">
        <div className="two-col">
          <div className="card">
            <div className="card-header"><span className="card-title">NPS general</span></div>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="nps-score">{total > 0 ? npsScore : '—'}</div>
              <div className="nps-label">{total} respuestas</div>
              {total > 0 && (
                <>
                  <div className="nps-dist">
                    <div className="nps-segment" style={{ width: `${Math.round(detractores/total*100)}%`, background: 'var(--red)' }} />
                    <div className="nps-segment" style={{ width: `${Math.round(pasivos/total*100)}%`, background: 'var(--amber)' }} />
                    <div className="nps-segment" style={{ flex: 1, background: 'var(--green)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--dim)', marginTop: 3 }}>
                    <span>Det. {Math.round(detractores/total*100)}%</span>
                    <span>Pasivos {Math.round(pasivos/total*100)}%</span>
                    <span>Promotores {Math.round(promotores/total*100)}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Últimas respuestas</span></div>
            <table>
              <thead>
                <tr><th>Alumno</th><th>Nota</th><th>Comentario</th></tr>
              </thead>
              <tbody>
                {(nps as any[]).slice(0, 5).map((n: any) => (
                  <tr key={n.id}>
                    <td className="bold">{n.nombre}</td>
                    <td style={{ color: n.score >= 9 ? 'var(--green)' : n.score >= 7 ? 'var(--amber)' : 'var(--red)' }}>
                      {n.score}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--dim)' }}>{n.comentario || '—'}</td>
                  </tr>
                ))}
                {(nps as any[]).length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--dim)', padding: 20 }}>Sin respuestas aún</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
