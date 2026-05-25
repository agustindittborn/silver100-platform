import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) redirect('/onboarding')
  if (!profile.aprobado) redirect('/pendiente')

  return <DashboardShell profile={profile}>{children}</DashboardShell>
}
