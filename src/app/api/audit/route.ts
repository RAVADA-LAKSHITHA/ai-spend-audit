import { NextRequest, NextResponse } from 'next/server'
import { runAudit, type ToolInput } from '@/lib/auditEngine'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tools, teamSize, useCase } = body

    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return NextResponse.json({ error: 'No tools provided' }, { status: 400 })
    }

    const inputs: ToolInput[] = tools
    const auditResult = runAudit(inputs, teamSize, useCase)

    // Store audit in Supabase
    const { data, error } = await supabase
      .from('audits')
      .insert({
        tools: inputs,
        team_size: teamSize,
        use_case: useCase,
        total_monthly_savings: auditResult.totalMonthlySavings,
        total_annual_savings: auditResult.totalAnnualSavings,
        is_public: true,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 })
    }

    return NextResponse.json({
      auditId: data.id,
      ...auditResult,
    })
  } catch (err) {
    console.error('Audit API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}