import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Simple in-memory rate limit (max 3 requests per IP per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  if (entry.count >= 3) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { email, companyName, role, teamSize, auditId, honeypot } = body

    // Honeypot — bots fill this hidden field, humans don't
    if (honeypot) {
      return NextResponse.json({ success: true }) // silently reject
    }

    if (!email || !auditId) {
      return NextResponse.json({ error: 'Email and auditId required' }, { status: 400 })
    }

    // Get audit data for the email
    const { data: audit } = await supabase
      .from('audits')
      .select('total_monthly_savings, total_annual_savings, results')
      .eq('id', auditId)
      .single()

    const monthlySavings = audit?.total_monthly_savings ?? 0
    const annualSavings = audit?.total_annual_savings ?? 0
    const isHighSavings = monthlySavings > 500

    // Store lead in Supabase
    await supabase.from('leads').insert({
      audit_id: auditId,
      email,
      company_name: companyName || null,
      role: role || null,
      team_size: teamSize || null,
    })

    // Send confirmation email via Resend
    await resend.emails.send({
      from: 'SpendSmart AI <onboarding@resend.dev>',
      to: email,
      subject: monthlySavings > 0
        ? `Your AI Spend Audit — $${monthlySavings.toFixed(0)}/mo in savings identified`
        : 'Your AI Spend Audit — You are spending well!',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #0f172a;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 32px;">
            <span style="font-weight: 700; font-size: 18px; color: #059669;">SpendSmart AI</span>
          </div>

          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
            ${monthlySavings > 0
              ? `We found $${monthlySavings.toFixed(0)}/mo in AI overspend`
              : 'Your AI stack looks optimized!'}
          </h1>

          <p style="color: #64748b; margin-bottom: 24px;">
            ${monthlySavings > 0
              ? `Your audit identified <strong>$${annualSavings.toFixed(0)} in annual savings</strong> across your AI tools. Here is a summary of what we found:`
              : 'Based on your audit, your team is spending efficiently on AI tools. Keep it up!'}
          </p>

          ${monthlySavings > 0 ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 32px; font-weight: 800; color: #059669;">$${monthlySavings.toFixed(0)}/mo</div>
            <div style="color: #166534; font-size: 14px;">$${annualSavings.toFixed(0)} saved annually</div>
          </div>
          ` : ''}

          ${isHighSavings ? `
          <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-weight: 600; color: #065f46; margin: 0 0 8px;">You qualify for Credex savings</p>
            <p style="color: #047857; font-size: 14px; margin: 0 0 12px;">
              Credex sources discounted AI credits from companies that overforecast. With your level of spend, a consultation could save you an additional 20-40%.
            </p>
            <a href="https://credex.rocks" style="background: #059669; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Book free Credex consultation
            </a>
          </div>
          ` : ''}

          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            SpendSmart AI — Free AI spend audits for startups.<br/>
            You received this because you ran an audit at spendsmart.ai
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, isHighSavings })
  } catch (err) {
    console.error('Leads API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}