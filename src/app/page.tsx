'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TOOLS } from '@/lib/pricingData'
import { Trash2, Plus, Zap } from 'lucide-react'

type ToolEntry = {
  toolId: string
  planName: string
  monthlySpend: string
  seats: string
}

const USE_CASES = ['coding', 'writing', 'data', 'research', 'mixed']
const STORAGE_KEY = 'ai-spend-audit-form'

export default function Home() {
  const router = useRouter()
  const [teamSize, setTeamSize] = useState('')
  const [useCase, setUseCase] = useState('mixed')
  const [entries, setEntries] = useState<ToolEntry[]>([
    { toolId: 'cursor', planName: '', monthlySpend: '', seats: '1' },
  ])
  const [isLoading, setIsLoading] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setTeamSize(parsed.teamSize || '')
      setUseCase(parsed.useCase || 'mixed')
      setEntries(parsed.entries || [{ toolId: 'cursor', planName: '', monthlySpend: '', seats: '1' }])
    }
  }, [])

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamSize, useCase, entries }))
  }, [teamSize, useCase, entries])

  function addTool() {
    setEntries([...entries, { toolId: 'claude', planName: '', monthlySpend: '', seats: '1' }])
  }

  function removeTool(index: number) {
    setEntries(entries.filter((_, i) => i !== index))
  }

  function updateEntry(index: number, field: keyof ToolEntry, value: string) {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: value }
    // Reset plan when tool changes
    if (field === 'toolId') updated[index].planName = ''
    setEntries(updated)
  }

  async function handleSubmit() {
    // Basic validation
    if (!teamSize || entries.some((e) => !e.toolId || !e.monthlySpend)) {
      alert('Please fill in team size and monthly spend for each tool.')
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
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          Free · No login required
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Are you overspending on AI tools?
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          Enter what you pay. Get an instant audit — where you're overspending, what to cut, and how much you save.
        </p>
        <p className="text-slate-500 text-sm">Takes 2 minutes. Trusted by 0 startups so far — be the first.</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Your AI Tool Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Team info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Team size (people)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Primary use case</Label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-600 bg-slate-900 text-white px-3 text-sm"
                >
                  {USE_CASES.map((uc) => (
                    <option key={uc} value={uc}>
                      {uc.charAt(0).toUpperCase() + uc.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tool entries */}
            <div className="space-y-4">
              <Label className="text-slate-300">AI tools you pay for</Label>
              {entries.map((entry, index) => {
                const tool = TOOLS.find((t) => t.id === entry.toolId)
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    {/* Tool selector */}
                    <div className="col-span-4">
                      <select
                        value={entry.toolId}
                        onChange={(e) => updateEntry(index, 'toolId', e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-600 bg-slate-900 text-white px-3 text-sm"
                      >
                        {TOOLS.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Plan selector */}
                    <div className="col-span-3">
                      <select
                        value={entry.planName}
                        onChange={(e) => updateEntry(index, 'planName', e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-600 bg-slate-900 text-white px-3 text-sm"
                      >
                        <option value="">Plan</option>
                        {tool?.plans.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Monthly spend */}
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder="$/mo"
                        value={entry.monthlySpend}
                        onChange={(e) => updateEntry(index, 'monthlySpend', e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* Seats */}
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Seats"
                        value={entry.seats}
                        onChange={(e) => updateEntry(index, 'seats', e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {/* Remove */}
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTool(index)}
                        disabled={entries.length === 1}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              <Button
                variant="outline"
                onClick={addTool}
                className="w-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another tool
              </Button>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {isLoading ? (
                'Running audit...'
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Run my free audit
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-500">
              No account needed. Your data is not sold. Email only asked after you see results.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}