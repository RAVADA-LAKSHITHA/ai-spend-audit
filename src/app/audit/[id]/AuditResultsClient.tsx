'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingDown, CheckCircle, AlertTriangle, Share2, ArrowRight, Sparkles, Mail } from 'lucide-react'
import Link from 'next/link'

type AuditResult = {
  toolId: string
  toolName: string
  currentPlan: string
  currentMonthlySpend: number
  recommendation: string
  recommendedAction: string
  monthlySavings: number
  annualSavings: number
  isOptimal: boolean
}

type Audit = {
  id: string
  tools: { toolId: string; planName: string; monthlySpend: number; seats: number }[]
  team_size: number
  use_case: string
  total_monthly_savings: number
  total_annual_savings: number
  results: AuditResult[]
  created_at: string
}

export default function AuditResultsClient({ audit }: { audit: Audit }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  const isHighSavings = audit.total_monthly_savings > 500
  const isOptimal = audit.total_monthly_savings === 0
  const topRecommendation =
    audit.results?.find((r) => !r.isOptimal)?.recommendedAction ?? 'Review your current plans'


  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalMonthlySavings: audit.total_monthly_savings,
            totalAnnualSavings: audit.total_annual_savings,
            toolCount: audit.results?.length ?? 0,
            useCase: audit.use_case,
            topRecommendation,
          }),
        })
        const data = await res.json()
        setSummary(data.summary)
      } catch {
        setSummary(null)
      } finally {
        setSummaryLoading(false)
      }
    }
    fetchSummary()
  }, [])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleEmailSubmit() {
    if (!email) return
    setEmailLoading(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, role, auditId: audit.id, honeypot: '' }),
      })
      setEmailSubmitted(true)
    } catch {
      setEmailSubmitted(true)
    } finally {
      setEmailLoading(false)
    }
  }

  const fallbackSummary = isOptimal
    ? `Your AI tool stack looks well-optimized for a ${audit.team_size}-person team focused on ${audit.use_case}. You are on the right plans and spending efficiently. Keep reviewing quarterly as new tools and pricing changes emerge.`
    : `Your audit identified $${audit.total_monthly_savings.toFixed(0)}/month ($${audit.total_annual_savings.toFixed(0)}/year) in potential savings. The biggest opportunity is: ${topRecommendation}.`

  const displaySummary = summary ?? fallbackSummary

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-slate-900 tracking-tight">SpendSmart AI</span>
          </Link>
          <Button onClick={handleShare} variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300">
            <Share2 className="h-4 w-4 mr-2" />
            {copied ? 'Link copied!' : 'Share report'}
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Card className={`border-0 shadow-sm rounded-2xl overflow-hidden ${isOptimal ? 'bg-emerald-50' : 'bg-white'}`}>
          <CardContent className="p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {isOptimal ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    {isOptimal ? 'Already optimized' : 'Savings identified'}
                  </span>
                </div>
                {isOptimal ? (
                  <h1 className="text-3xl md:text-4xl font-bold text-emerald-700">You are spending well</h1>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                      Save <span className="text-emerald-600">${audit.total_monthly_savings.toFixed(0)}/mo</span>
                    </h1>
                    <p className="text-slate-500 mt-1 text-lg">
                      That is <span className="font-semibold text-slate-700">${audit.total_annual_savings.toFixed(0)} saved per year</span>
                    </p>
                  </>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Team size</div>
                <div className="text-2xl font-bold text-slate-700">{audit.team_size}</div>
                <div className="text-sm text-slate-400 capitalize">{audit.use_case} focus</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">AI-generated summary</span>
              <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">Powered by Claude</Badge>
            </div>
            {summaryLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-4/6" />
              </div>
            ) : (
              <p className="text-slate-600 leading-relaxed">{displaySummary}</p>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Tool-by-tool breakdown</h2>
          <div className="space-y-3">
            {audit.results?.map((result, i) => (
              <Card key={i} className={`border shadow-sm rounded-xl bg-white ${!result.isOptimal ? 'border-amber-100' : 'border-slate-100'}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{result.toolName}</span>
                        <Badge variant="outline" className={`text-xs ${result.isOptimal ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                          {result.currentPlan}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{result.recommendation}</p>
                      {!result.isOptimal && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                          <ArrowRight className="h-3.5 w-3.5" />
                          {result.recommendedAction}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-slate-400">Currently paying</div>
                      <div className="text-xl font-bold text-slate-800">
                        ${result.currentMonthlySpend.toFixed(0)}<span className="text-sm font-normal text-slate-400">/mo</span>
                      </div>
                      {result.monthlySavings > 0 && (
                        <div className="text-sm font-semibold text-emerald-600 mt-0.5">Save ${result.monthlySavings.toFixed(0)}/mo</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {isHighSavings && (
          <Card className="border-0 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-sm">
            <CardContent className="p-7 text-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">You qualify for Credex savings</Badge>
                  <h3 className="text-xl font-bold mb-1">Get an extra 20-40% off your AI tools</h3>
                  <p className="text-emerald-100 text-sm max-w-md">
                    Credex sources discounted AI credits from companies that overforecast. A Credex consultation could save you even more.
                  </p>
                </div>
                <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-emerald-50 transition-colors">
                  Book free consultation
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email capture card — always visible unless submitted */}
        {!emailSubmitted && (
          <Card className="border border-emerald-100 rounded-2xl shadow-sm bg-gradient-to-br from-white to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  {isOptimal ? 'Notify me when new savings apply' : 'Get your full report by email'}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                {isOptimal
                  ? 'We will let you know when new optimizations apply to your stack.'
                  : 'We will send you the complete audit and notify you when new savings apply.'}
                {audit.total_monthly_savings > 500 && (
                  <span className="text-emerald-700 font-medium"> High-savings audits get a personal Credex follow-up.</span>
                )}
              </p>

              {!showEmailCapture ? (
                <Button onClick={() => setShowEmailCapture(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  {isOptimal ? 'Notify me' : 'Send me the report'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-slate-700 text-sm">Email address *</Label>
                      <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-700 text-sm">Company name</Label>
                      <Input placeholder="Acme Inc. (optional)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="border-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-700 text-sm">Your role (optional)</Label>
                    <Input placeholder="e.g. CTO, Engineering Manager" value={role} onChange={(e) => setRole(e.target.value)} className="border-slate-200" />
                  </div>
                  <Button onClick={handleEmailSubmit} disabled={!email || emailLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                    {emailLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : 'Send my report'}
                  </Button>
                  <p className="text-xs text-slate-400 text-center">No spam. Unsubscribe anytime.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {emailSubmitted && (
          <Card className="border border-emerald-200 rounded-2xl bg-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-emerald-800">Report sent to your inbox!</p>
              <p className="text-emerald-600 text-sm mt-1">Check your email for the full audit.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 flex-wrap pb-10">
          <Button onClick={handleShare} variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700">
            <Share2 className="h-4 w-4 mr-2" />
            {copied ? 'Link copied!' : 'Share this report'}
          </Button>
          <Link href="/" className="flex-1">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Run another audit</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}