import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import CobrosClient from './CobrosClient'

export default async function CobrosPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: leads } = await supabase
    .from('leads')
    .select('*, grupos(nombre)')
    .eq('estado', 'closed')
    .order('created_at', { ascending: false })

  return (
    <>
      <PageHeader title="Cobros y pagos" actions={<button className="btn btn-ghost">Exportar</button>} />
      <div className="page-content">
        <CobrosClient initialLeads={leads || []} />
      </div>
    </>
  )
}
