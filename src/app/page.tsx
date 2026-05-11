'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  } catch { }
  return fallback
}

export default function Home() {
  const router = useRouter()
  const [teamSize, setTeamSize] = useState<string>(() => loadFromStorage(STORAGE_KEY, 'teamSize', ''))
  const [useCase, setUseCase] = useState<string>(() => loadFromStorage(STORAGE_KEY, 'useCase', 'mixed'))
  const [entries, setEntries] = useState<ToolEntry[]>(() => loadFromStorage(STORAGE_KEY, 'entries', [DEFAULT_ENTRY]))
  const [isLoading, setIsLoading] = useState(false)

  // Save to localStorage on every change
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

      if (plan && plan.pricePerSeat > 0) {
        const minSeats = plan.minSeats ?? 1
        const effectiveSeats = Math.max(rawSeats, minSeats)
        updated[index].monthlySpend = (plan.pricePerSeat * effectiveSeats).toString()
        updated[index].seats = effectiveSeats.toString()
      } else if (plan && plan.pricePerSeat === 0) {
        updated[index].monthlySpend = '0'
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

  async function handleSubmit() {
    if (!teamSize || parseInt(teamSize) < 1) {
      alert('Please enter a valid team size of at least 1.')
      return
    }

    if (entries.some((e) => {
      const tool = TOOLS.find(t => t.id === e.toolId)
      if (tool?.category === 'api' && (!e.monthlySpend || parseFloat(e.monthlySpend) === 0)) {
        return true // flag API tools with $0
      }
      return !e.planName && tool?.category !== 'api'
    })) {
      alert('Please enter your actual monthly spend for API tools — they cannot be $0.')
      return
    }

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
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-slate-900 tracking-tight">SpendSmart AI</span>
        </div>
        <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs">
          Free · No login required
        </Badge>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 text-sm text-emerald-700 font-medium mb-6">
          <TrendingDown className="h-4 w-4" />
          The free AI spend audit tool for startups
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
          Are you overspending<br />on AI tools?
        </h1>
        <p className="text-slate-500 text-lg mb-2 max-w-xl mx-auto">
          Enter your team size and AI tools. Get an instant audit — right plan, right seats, exact savings.
        </p>
        <p className="text-slate-400 text-sm">Takes 2 minutes. No account needed. See results instantly.</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-slate-900 text-lg font-semibold">Your AI Tool Stack</CardTitle>
            <p className="text-slate-400 text-sm">Select your tools and plans — cost calculates automatically based on seats.</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-6">

            {/* Team info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-medium">Team size (total people)</Label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-medium">Primary use case</Label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            <div className="grid grid-cols-12 gap-2 px-1">
              <div className="col-span-4 text-xs font-medium text-slate-400 uppercase tracking-wide">Tool</div>
              <div className="col-span-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Plan</div>
              <div className="col-span-2 text-xs font-medium text-slate-400 uppercase tracking-wide">Seats</div>
              <div className="col-span-2 text-xs font-medium text-slate-400 uppercase tracking-wide">$/mo</div>
              <div className="col-span-1" />
            </div>

            <div className="h-px bg-slate-100 -mt-2" />

            {/* Tool entries */}
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const tool = TOOLS.find((t) => t.id === entry.toolId)
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">

                    {/* Tool */}
                    <div className="col-span-4">
                      <select
                        value={entry.toolId}
                        onChange={(e) => updateEntry(index, 'toolId', e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {TOOLS.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Plan */}
                    <div className="col-span-3">
                      <select
                        value={entry.planName}
                        onChange={(e) => updateEntry(index, 'planName', e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Plan</option>
                        {tool?.plans.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={entry.seats}
                        onChange={(e) => updateEntry(index, 'seats', e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Cost — read only for seat-based, editable for API tools */}
                    <div className="col-span-2">
                      {tool?.category === 'api' ? (
                        <input
                          type="number"
                          min="0"
                          placeholder="$/mo"
                          value={entry.monthlySpend}
                          onChange={(e) => updateEntry(index, 'monthlySpend', e.target.value)}
                          className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      ) : (
                        <div className="h-10 rounded-md border border-slate-100 bg-slate-50 px-3 flex items-center text-sm text-slate-700 font-medium">
                          {entry.monthlySpend ? `$${entry.monthlySpend}` : '—'}
                        </div>
                      )}
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeTool(index)}
                        disabled={entries.length === 1}
                        className="text-slate-300 hover:text-red-400 disabled:opacity-0 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={addTool}
                className="w-full h-10 rounded-md border border-dashed border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add another tool
              </button>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running your audit...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Run my free audit
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400">
              No account needed · Data not sold · Email only asked after you see results
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}