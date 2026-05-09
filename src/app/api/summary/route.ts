import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { totalMonthlySavings, totalAnnualSavings, toolCount, useCase, topRecommendation } = body

    const prompt = `You are a financial advisor specializing in AI tool costs for startups. Write a personalized 100-word audit summary for a startup based on this data:

- Total tools audited: ${toolCount}
- Primary use case: ${useCase}
- Total monthly savings identified: $${totalMonthlySavings.toFixed(2)}
- Total annual savings identified: $${totalAnnualSavings.toFixed(2)}
- Top recommendation: ${topRecommendation}

Write directly to the founder ("you/your"). Be specific about the numbers. Be honest — if savings are low, say they're spending well. End with one actionable next step. No bullet points. Plain paragraph only. Maximum 100 words.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://spendsmart-ai.vercel.app',
        'X-Title': 'SpendSmart AI',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error('OpenRouter API failed')
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content || null

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('Summary API error:', err)
    // Graceful fallback — never break the results page
    return NextResponse.json({ summary: null })
  }
}