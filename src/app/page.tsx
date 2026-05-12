'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TOOLS } from '@/lib/pricingData'
import { Trash2, Plus, Zap, TrendingDown } from 'lucide-react'

type ToolEntry = {
  toolId: string
  planName: string
  monthlySpend: string
  seats: string
}

const USE_CASES = ['coding', 'writing', 'data', 'research', 'mixed']
const STORAGE_KEY = 'ai-spend-audit-form'
const DEFAULT_ENTRY: ToolEntry = { toolId: 'cursor', planName: '', monthlySpend: '', seats: '1' }

function loadFromStorage<T>(key: string, field: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed[field] !== undefined && parsed[field] !== null) return parsed[field] as T
    }
  } catch {}
  return fallback
}

function needsManualSpend(toolId: string, planName: string): boolean {
  const tool = TOOLS.find(t => t.id === toolId)
  if (!tool) return false
  if (tool.category === 'api') return true
  const plan = tool.plans.find(p => p.name === planName)
  if (!plan) return false
  return plan.pricePerSeat === 0 && planName !== 'Free' && planName !== 'Hobby'
}

export default function Home() {
  const router = useRouter()
  const [teamSize, setTeamSize] = useState<string>(() => loadFromStorage(STORAGE_KEY, 'teamSize', ''))
  const [useCase, setUseCase] = useState<string>(() => loadFromStorage(STORAGE_KEY, 'useCase', 'mixed'))
  const [entries, setEntries] = useState<ToolEntry[]>(() => loadFromStorage(STORAGE_KEY, 'entries', [DEFAULT_ENTRY]))
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamSize, useCase, entries }))
  }, [teamSize, useCase, entries])

  function updateEntry(index: number, field: keyof ToolEntry, value: string) {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'toolId') {
      updated[index].planName = ''
      updated[index].monthlySpend = ''
      updated[index].seats = '1'
    }

    if (field === 'planName' || field === 'seats') {
      const tool = TOOLS.find((t) => t.id === updated[index].toolId)
      const planName = field === 'planName' ? value : updated[index].planName
      const plan = tool?.plans.find((p) => p.name === planName)
      const rawSeats = parseInt(field === 'seats' ? value : updated[index].seats) || 1

      if (plan) {
        if (plan.pricePerSeat > 0) {
          const minSeats = plan.minSeats ?? 1
          const effectiveSeats = Math.max(rawSeats, minSeats)
          updated[index].monthlySpend = (plan.pricePerSeat * effectiveSeats).toString()
          updated[index].seats = effectiveSeats.toString()
        } else {
          if (planName === 'Free' || planName === 'Hobby') {
            updated[index].monthlySpend = '0'
          } else {
            updated[index].monthlySpend = ''
          }
        }
      }
    }

    setEntries(updated)
  }

  function addTool() {
    setEntries([...entries, { toolId: 'claude', planName: '', monthlySpend: '', seats: '1' }])
  }

  function removeTool(index: number) {
    setEntries(entries.filter((_, i) => i !== index))
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!teamSize || parseInt(teamSize) < 1) {
      errs.push('Please enter a valid team size of at least 1.')
    }
    entries.forEach((e, i) => {
      const tool = TOOLS.find(t => t.id === e.toolId)
      if (!e.planName) {
        errs.push(`Row ${i + 1}: Please select a plan for ${tool?.name ?? e.toolId}.`)
        return
      }
      const plan = tool?.plans.find(p => p.name === e.planName)
      const requiresManual = tool?.category === 'api' ||
        (plan && plan.pricePerSeat === 0 && e.planName !== 'Free' && e.planName !== 'Hobby')
      if (requiresManual && (!e.monthlySpend || parseFloat(e.monthlySpend) <= 0)) {
        errs.push(`Row ${i + 1}: Please enter your actual monthly spend for ${tool?.name} ${e.planName}.`)
      }
    })
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    setIsLoading(true)
    try {
      const payload = {
        teamSize: parseInt(teamSize),
        useCase,
        tools: entries.map((e) => ({
          toolId: e.toolId,
          planName: e.planName || 'Unknown',
          monthlySpend: parseFloat(e.monthlySpend) || 0,
          seats: parseInt(e.seats) || 1,
        })),
      }
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.auditId) {
        router.push(`/audit/${data.auditId}`)
      } else {
        setErrors(['Something went wrong. Please try again.'])
      }
    } catch {
      setErrors(['Network error. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-3.5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-700 rounded-md flex items-center justify-center flex-shrink-0">
            <TrendingDown className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-slate-900 text-sm">SpendSmart AI</span>
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Free · No login required
        </span>
      </nav>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-1.5 text-xs text-emerald-700 font-medium mb-5">
          <TrendingDown className="h-3.5 w-3.5" />
          Free AI spend audit for startups
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4 leading-tight">
          Stop overpaying for<br />
          <span className="text-emerald-700">AI tools</span>
        </h1>
        <p className="text-slate-500 text-base mb-2 max-w-md mx-auto leading-relaxed">
          Enter your tools and plans. Get an instant audit — right plan, right seats, exact savings in under 2 minutes.
        </p>
        <p className="text-slate-400 text-sm">No account · No credit card · Results shown instantly</p>
      </div>

      {/* Stats row */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex justify-center gap-8 py-4 border-y border-slate-100">
          <div className="text-center">
            <div className="text-lg font-medium text-slate-900">9</div>
            <div className="text-xs text-slate-400 mt-0.5">Tools supported</div>
          </div>
          <div className="w-px bg-slate-100" />
          <div className="text-center">
            <div className="text-lg font-medium text-slate-900">2 min</div>
            <div className="text-xs text-slate-400 mt-0.5">To complete</div>
          </div>
          <div className="w-px bg-slate-100" />
          <div className="text-center">
            <div className="text-lg font-medium text-slate-900">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">Free, always</div>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">

          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <div className="text-sm font-medium text-slate-900">Your AI tool stack</div>
              <div className="text-xs text-slate-400 mt-0.5">Select tools and plans — cost calculates automatically</div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">Step 1 of 1</span>
          </div>

          {/* Team info */}
          <div className="grid grid-cols-2 gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/40">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Team size
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                aria-label="Team size"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Primary use case
              </label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                aria-label="Select primary use case"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {USE_CASES.map((uc) => (
                  <option key={uc} value={uc}>
                    {uc.charAt(0).toUpperCase() + uc.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            <div className="col-span-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Tool</div>
            <div className="col-span-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Plan</div>
            <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Seats</div>
            <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Cost/mo</div>
            <div className="col-span-1" />
          </div>

          {/* Tool rows */}
          <div className="divide-y divide-slate-50">
            {entries.map((entry, index) => {
              const tool = TOOLS.find((t) => t.id === entry.toolId)
              const plan = tool?.plans.find(p => p.name === entry.planName)
              const isManual = needsManualSpend(entry.toolId, entry.planName)
              const isFree = plan?.pricePerSeat === 0 && (entry.planName === 'Free' || entry.planName === 'Hobby')

              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center px-5 py-3 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="col-span-4">
                    <select
                      value={entry.toolId}
                      onChange={(e) => updateEntry(index, 'toolId', e.target.value)}
                      aria-label="Select AI tool"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-900 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {TOOLS.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <select
                      value={entry.planName}
                      onChange={(e) => updateEntry(index, 'planName', e.target.value)}
                      aria-label="Select plan"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-900 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Plan</option>
                      {tool?.plans.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={entry.seats}
                      onChange={(e) => updateEntry(index, 'seats', e.target.value)}
                      aria-label="Number of seats"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-900 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="col-span-2">
                    {isManual ? (
                      <input
                        type="number"
                        min="0"
                        placeholder="$/mo"
                        value={entry.monthlySpend}
                        onChange={(e) => updateEntry(index, 'monthlySpend', e.target.value)}
                        aria-label="Monthly spend in dollars"
                        className="w-full h-9 rounded-lg border border-amber-200 bg-amber-50 text-slate-900 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-amber-400"
                      />
                    ) : isFree ? (
                      <div className="h-9 rounded-lg bg-slate-50 border border-slate-100 px-2.5 flex items-center text-xs text-slate-400 font-medium">
                        Free
                      </div>
                    ) : entry.monthlySpend ? (
                      <div className="h-9 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 flex items-center text-sm text-emerald-700 font-medium">
                        ${entry.monthlySpend}
                      </div>
                    ) : (
                      <div className="h-9 rounded-lg bg-slate-50 border border-slate-100 px-2.5 flex items-center text-sm text-slate-300">
                        —
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeTool(index)}
                      disabled={entries.length === 1}
                      aria-label="Remove this tool"
                      className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300 hover:text-red-400 hover:border-red-100 disabled:opacity-0 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add tool row */}
          <button
            onClick={addTool}
            aria-label="Add another AI tool"
            className="w-full py-3 flex items-center justify-center gap-2 text-sm text-emerald-700 font-medium hover:bg-emerald-50 border-t border-slate-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add another tool
          </button>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="mx-5 mb-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 leading-relaxed">{err}</p>
              ))}
            </div>
          )}

          {/* Card footer */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              No account needed · Data not sold
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-5 h-9 rounded-lg transition-colors disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running audit...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  Run my free audit
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          For OpenAI API and Anthropic API — enter your actual monthly spend in the highlighted field
        </p>
      </div>
    </main>
  )
}