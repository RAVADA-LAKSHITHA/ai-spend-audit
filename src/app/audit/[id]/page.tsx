import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import AuditResultsClient from './AuditResultsClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const { data } = await supabase
    .from('audits')
    .select('total_monthly_savings, total_annual_savings, use_case')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Audit Not Found' }

  const savings = data.total_monthly_savings ?? 0
  const title = savings > 0
    ? `I found $${savings.toFixed(0)}/mo in AI overspend — SpendSmart AI`
    : 'My AI stack is already optimized — SpendSmart AI'

  const description = `Free AI spend audit. ${savings > 0
    ? `Potential annual savings: $${(data.total_annual_savings ?? 0).toFixed(0)}`
    : 'Spending looks well-optimized.'} Run your own free audit.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: 'SpendSmart AI' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function AuditPage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (error || !data) notFound()

  return <AuditResultsClient audit={data} />
}