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

function makeResult(
  input: ToolInput,
  toolName: string,
  recommendation: string,
  recommendedAction: string,
  monthlySavings: number,
  isOptimal: boolean
): AuditResult {
  return {
    toolId: input.toolId,
    toolName,
    currentPlan: input.planName,
    currentMonthlySpend: input.monthlySpend,
    recommendation,
    recommendedAction,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    isOptimal,
  }
}

export function runAudit(inputs: ToolInput[], teamSize: number, useCase: string): AuditSummary {
  const results: AuditResult[] = inputs.map((input) => {
    const tool = TOOLS.find((t) => t.id === input.toolId)
    if (!tool) {
      return makeResult(input, input.toolId, 'Tool not found.', 'No action', 0, true)
    }

    const currentPlan = tool.plans.find((p) => p.name === input.planName)
    const planPrice = currentPlan?.pricePerSeat ?? 0
    const minSeats = currentPlan?.minSeats ?? 1
    const effectiveSeats = Math.max(input.seats, minSeats)
    const expectedCost = planPrice * effectiveSeats

    // ── RULE 0: API tools with $0 spend — invalid input ──
    if (tool.category === 'api' && input.monthlySpend === 0) {
      return makeResult(
        input,
        tool.name,
        `You selected ${tool.name} but entered $0/mo. Pay-as-you-go APIs always have some cost — enter your actual monthly bill from your dashboard.`,
        'Check your API billing dashboard and enter actual spend',
        0,
        false
      )
    }

    // ── RULE 1: Seats below plan minimum ──
    if (input.seats < minSeats && planPrice > 0) {
      const correctCost = planPrice * minSeats
      const overspend = input.monthlySpend - correctCost
      return makeResult(
        input,
        tool.name,
        `${tool.name} ${input.planName} requires a minimum of ${minSeats} seats. You entered ${input.seats} seat(s) — this plan always bills for at least ${minSeats}. Your actual cost should be $${correctCost}/mo.`,
        `Correct your seat count to ${minSeats} minimum, or downgrade to a lower plan`,
        Math.max(overspend, 0),
        false
      )
    }

    // ── RULE 2: Billing overage vs expected cost ──
    if (planPrice > 0 && input.monthlySpend > expectedCost + 5) {
      const overspend = input.monthlySpend - expectedCost
      return makeResult(
        input,
        tool.name,
        `You are paying $${input.monthlySpend}/mo but ${tool.name} ${input.planName} should cost $${expectedCost}/mo for ${effectiveSeats} seat(s). You have $${overspend.toFixed(0)}/mo in unexplained charges — possible unused seats or overages.`,
        `Audit your ${tool.name} billing — remove unused seats`,
        overspend,
        false
      )
    }

    // ── RULE 3: Team plan for tiny team (≤2 people) ──
    const isTeamPlan = ['Business', 'Teams', 'Team', 'Enterprise'].some(p =>
      input.planName.toLowerCase().includes(p.toLowerCase())
    )
    if (isTeamPlan && teamSize <= 2) {
      const individualPlan = tool.plans.find((p) =>
        p.name.toLowerCase().includes('pro') || p.name.toLowerCase().includes('individual')
      )
      if (individualPlan && individualPlan.pricePerSeat > 0) {
        const recommendedCost = individualPlan.pricePerSeat * teamSize
        const savings = input.monthlySpend - recommendedCost
        if (savings > 0) {
          return makeResult(
            input,
            tool.name,
            `You are on a ${input.planName} plan but your team is only ${teamSize} person(s). Team/Business plans are designed for 5+ people — you are paying for admin features and minimum seats you don't need.`,
            `Downgrade to ${tool.name} ${individualPlan.name} — save $${savings.toFixed(0)}/mo`,
            savings,
            false
          )
        }
      }
    }

    // ── RULE 4: Too few seats for team size (under-licensed) ──
    if (tool.category === 'coding' && useCase === 'coding') {
      const coverageRatio = effectiveSeats / teamSize
      if (teamSize >= 5 && coverageRatio < 0.4) {
        return makeResult(
          input,
          tool.name,
          `Your team has ${teamSize} developers but only ${effectiveSeats} ${tool.name} seat(s) — only ${Math.round(coverageRatio * 100)}% coverage. Either most developers are not using it (wasted spend) or sharing accounts (against terms of service).`,
          `Audit actual usage — cancel unused seats or buy seats for active users only`,
          0,
          false
        )
      }
    }

    // ── RULE 5: Too many seats vs team size ──
    if (planPrice > 0 && effectiveSeats > teamSize * 1.1 && teamSize > 1) {
      const extraSeats = effectiveSeats - teamSize
      const savings = extraSeats * planPrice
      return makeResult(
        input,
        tool.name,
        `You have ${effectiveSeats} ${tool.name} seats but only ${teamSize} people on your team. You are paying for ${extraSeats} seat(s) nobody is using.`,
        `Remove ${extraSeats} unused seat(s) — save $${savings.toFixed(0)}/mo`,
        savings,
        false
      )
    }

    // ── RULE 6: Wrong tool for use case ──
    if (tool.category === 'coding' && (useCase === 'writing' || useCase === 'research')) {
      return makeResult(
        input,
        tool.name,
        `${tool.name} is built for coding. Your team's primary use is ${useCase} — a general AI tool like Claude Pro ($17/mo) would serve you better at lower cost.`,
        `Cancel ${tool.name} — switch to Claude Pro for ${useCase}`,
        input.monthlySpend,
        false
      )
    }

    // ── RULE 7: Claude Max overkill for solo user ──
    if (input.toolId === 'claude' && input.planName === 'Max' && teamSize <= 2) {
      return makeResult(
        input,
        tool.name,
        `Claude Max ($100/mo) is for power users who hit Pro limits every single day. For a ${teamSize}-person team, Claude Pro at $17/mo gives the same capability unless you consistently max out daily limits.`,
        `Downgrade to Claude Pro — save $83/mo unless you hit limits daily`,
        83,
        false
      )
    }

    // ── RULE 8: Duplicate general AI tools ──
    const hasClaude = inputs.some((i) => i.toolId === 'claude' && i.monthlySpend > 0)
    const hasChatGPT = inputs.some((i) => i.toolId === 'chatgpt' && i.monthlySpend > 0)
    if (hasClaude && hasChatGPT && input.toolId === 'chatgpt' && useCase !== 'data') {
      return makeResult(
        input,
        tool.name,
        `You pay for both Claude and ChatGPT. For ${useCase}, they overlap significantly. Claude is stronger for writing and coding; ChatGPT has an edge only for data analysis. Pick one and save.`,
        `Consolidate to Claude — cancel ChatGPT, save $${input.monthlySpend.toFixed(0)}/mo`,
        input.monthlySpend,
        false
      )
    }

    // ── RULE 9: Perplexity overlap ──
    const hasOtherGeneral = inputs.some(
      (i) => (i.toolId === 'claude' || i.toolId === 'chatgpt') && i.monthlySpend > 0
    )
    if (input.toolId === 'perplexity' && input.planName === 'Pro' && hasOtherGeneral && useCase !== 'research') {
      return makeResult(
        input,
        tool.name,
        `Perplexity Pro's strength is real-time research with citations. For ${useCase} work, Claude or ChatGPT already covers this. You are paying for overlap.`,
        `Cancel Perplexity Pro — use Claude for ${useCase} instead`,
        input.monthlySpend,
        false
      )
    }

    // ── RULE: Team size suggests better plan ──
    if (tool.category === 'coding' && useCase === 'coding') {
      // Solo dev on team plan
      if (teamSize === 1 && isTeamPlan) {
        const proPlan = tool.plans.find(p => p.name === 'Pro')
        if (proPlan && proPlan.pricePerSeat > 0) {
          const savings = input.monthlySpend - proPlan.pricePerSeat
          if (savings > 0) {
            return makeResult(
              input, tool.name,
              `You are a solo developer on a team plan. ${tool.name} Pro ($${proPlan.pricePerSeat}/mo) has everything you need — the team plan adds admin features only useful for 5+ person teams.`,
              `Downgrade to ${tool.name} Pro — save $${savings.toFixed(0)}/mo`,
              savings, false
            )
          }
        }
      }
      // Large team on individual/pro plan — suggest business
      if (teamSize >= 10 && !isTeamPlan && input.planName !== 'Enterprise') {
        const businessPlan = tool.plans.find(p =>
          p.name === 'Business' || p.name === 'Teams' || p.name === 'Team'
        )
        if (businessPlan && businessPlan.pricePerSeat > 0) {
          return makeResult(
            input, tool.name,
            `Your team has ${teamSize} people on ${tool.name} ${input.planName}. At this team size, the ${businessPlan.name} plan ($${businessPlan.pricePerSeat}/seat/mo) adds centralized billing, admin controls, and SSO — important for a team your size and often required for compliance.`,
            `Consider upgrading to ${tool.name} ${businessPlan.name} for team management features`,
            0, false
          )
        }
      }
    }

    // General AI tools — large team should use Team plan
    if (tool.category === 'general' && teamSize >= 5 &&
      (input.planName === 'Pro' || input.planName === 'Plus' || input.planName === 'Gemini Advanced')) {
      const teamPlan = tool.plans.find(p => p.name === 'Team' || p.name === 'Teams')
      if (teamPlan && teamPlan.pricePerSeat > 0 && effectiveSeats < teamSize * 0.5) {
        return makeResult(
          input, tool.name,
          `You have ${teamSize} people but only ${effectiveSeats} ${tool.name} seat(s). If most of your team uses this for ${useCase}, you are either under-licensed or have people sharing accounts. Team plans also add shared workspaces and admin controls.`,
          `Audit who uses ${tool.name} — buy seats for active users or remove unused ones`,
          0, false
        )
      }
    }

    // ── DEFAULT: Spending looks right ──
    return makeResult(
      input,
      tool.name,
      `Your ${tool.name} ${input.planName} plan looks right-sized — ${effectiveSeats} seat(s) for a ${teamSize}-person team focused on ${useCase}.`,
      'No change needed',
      0,
      true
    )
  })

  const totalMonthlySavings = results.reduce((sum, r) => sum + r.monthlySavings, 0)

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    isHighSavings: totalMonthlySavings > 500,
    isAlreadyOptimal: results.every((r) => r.isOptimal),
  }
}