import { TOOLS } from './pricingData'

export type ToolInput = {
  toolId: string
  planName: string
  monthlySpend: number
  seats: number
}

export type AuditResult = {
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

export type AuditSummary = {
  results: AuditResult[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  isHighSavings: boolean
  isAlreadyOptimal: boolean
}

export function runAudit(inputs: ToolInput[], teamSize: number, useCase: string): AuditSummary {
  const results: AuditResult[] = inputs.map((input) => {
    const tool = TOOLS.find((t) => t.id === input.toolId)
    if (!tool) {
      return {
        toolId: input.toolId,
        toolName: input.toolId,
        currentPlan: input.planName,
        currentMonthlySpend: input.monthlySpend,
        recommendation: 'Tool not found in database',
        recommendedAction: 'No action',
        monthlySavings: 0,
        annualSavings: 0,
        isOptimal: true,
      }
    }

    const currentPlan = tool.plans.find((p) => p.name === input.planName)
    const impliedPricePerSeat = input.seats > 0 ? input.monthlySpend / input.seats : input.monthlySpend

    // Check: Perplexity + Claude/ChatGPT overlap — research use case only
    if (input.toolId === 'perplexity' && input.planName === 'Pro') {
      const hasOtherGeneral = inputs.some(
        (i) => (i.toolId === 'claude' || i.toolId === 'chatgpt') && i.monthlySpend > 0
      )

      if (hasOtherGeneral && useCase !== 'research') {
        const savings = input.monthlySpend

        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlan: input.planName,
          currentMonthlySpend: input.monthlySpend,
          recommendation: `You're paying for Perplexity Pro AND Claude/ChatGPT. For ${useCase} work, one general AI tool is enough. Perplexity's strength is real-time research — if that's not your primary use, cancel it.`,
          recommendedAction: 'Cancel Perplexity Pro — covered by existing tools',
          monthlySavings: savings,
          annualSavings: savings * 12,
          isOptimal: false,
        }
      }
    }
    
    // Check: Are they on a team plan for very few users?
    if (input.planName.toLowerCase().includes('team') || input.planName.toLowerCase().includes('business') || input.planName.toLowerCase().includes('enterprise')) {
      if (input.seats <= 2) {
        const individualPlan = tool.plans.find((p) =>
          p.name.toLowerCase().includes('pro') || p.name.toLowerCase().includes('individual')
        )
        if (individualPlan && individualPlan.pricePerSeat > 0) {
          const recommended = individualPlan.pricePerSeat * input.seats
          const savings = input.monthlySpend - recommended
          if (savings > 0) {
            return {
              toolId: input.toolId,
              toolName: tool.name,
              currentPlan: input.planName,
              currentMonthlySpend: input.monthlySpend,
              recommendation: `Switch to ${individualPlan.name} plan — you only have ${input.seats} seat(s), a team plan is overkill.`,
              recommendedAction: `Downgrade to ${tool.name} ${individualPlan.name}`,
              monthlySavings: savings,
              annualSavings: savings * 12,
              isOptimal: false,
            }
          }
        }
      }
    }

    // Check: Are they overpaying vs expected price for their plan?
    if (currentPlan && currentPlan.pricePerSeat > 0) {
      const expectedSpend = currentPlan.pricePerSeat * input.seats
      const overspend = input.monthlySpend - expectedSpend
      if (overspend > 10) {
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlan: input.planName,
          currentMonthlySpend: input.monthlySpend,
          recommendation: `You're paying $${input.monthlySpend}/mo but the ${input.planName} plan should cost $${expectedSpend}/mo for ${input.seats} seats. Review your billing.`,
          recommendedAction: 'Audit your billing — possible overage or extra seats',
          monthlySavings: overspend,
          annualSavings: overspend * 12,
          isOptimal: false,
        }
      }
    }

    // Check: Coding tools — suggest cheaper alternative based on use case
    if (tool.category === 'coding' && input.toolId === 'cursor') {
      if (useCase === 'writing' || useCase === 'research') {
        const savings = input.monthlySpend
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlan: input.planName,
          currentMonthlySpend: input.monthlySpend,
          recommendation: `Cursor is a coding IDE — for ${useCase}, you likely don't need it. Consider cancelling and using Claude or ChatGPT directly.`,
          recommendedAction: 'Cancel Cursor subscription',
          monthlySavings: savings,
          annualSavings: savings * 12,
          isOptimal: false,
        }
      }
    }

    // Check: Duplicate tools doing same job
    const hasClaude = inputs.some((i) => i.toolId === 'claude')
    const hasChatGPT = inputs.some((i) => i.toolId === 'chatgpt')
    if (hasClaude && hasChatGPT && (input.toolId === 'chatgpt' || input.toolId === 'claude')) {
      if (input.toolId === 'chatgpt' && useCase !== 'data') {
        const savings = input.monthlySpend * 0.5
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlan: input.planName,
          currentMonthlySpend: input.monthlySpend,
          recommendation: `You're paying for both Claude and ChatGPT. For ${useCase}, teams typically only need one. Consider consolidating to Claude (better for writing/coding) and cutting ChatGPT.`,
          recommendedAction: 'Consolidate to Claude, cancel ChatGPT',
          monthlySavings: savings,
          annualSavings: savings * 12,
          isOptimal: false,
        }
      }
    }

    // If we get here, spending looks reasonable
    return {
      toolId: input.toolId,
      toolName: tool.name,
      currentPlan: input.planName,
      currentMonthlySpend: input.monthlySpend,
      recommendation: `Your ${tool.name} ${input.planName} plan looks right-sized for ${input.seats} seat(s).`,
      recommendedAction: 'No change needed',
      monthlySavings: 0,
      annualSavings: 0,
      isOptimal: true,
    }
  })

  const totalMonthlySavings = results.reduce((sum, r) => sum + r.monthlySavings, 0)
  const totalAnnualSavings = totalMonthlySavings * 12

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    isHighSavings: totalMonthlySavings > 500,
    isAlreadyOptimal: totalMonthlySavings === 0,
  }
}