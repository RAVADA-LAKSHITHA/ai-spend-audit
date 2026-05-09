# PROMPTS.md

## AI Summary Prompt

Used in: `src/app/api/summary/route.ts`
Model: `anthropic/claude-3-haiku` via OpenRouter

### The prompt

```
You are a financial advisor specializing in AI tool costs for startups. Write a personalized 100-word audit summary for a startup based on this data:

- Total tools audited: {toolCount}
- Primary use case: {useCase}
- Total monthly savings identified: ${totalMonthlySavings}
- Total annual savings identified: ${totalAnnualSavings}
- Top recommendation: {topRecommendation}

Write directly to the founder ("you/your"). Be specific about the numbers. Be honest — if savings are low, say they're spending well. End with one actionable next step. No bullet points. Plain paragraph only. Maximum 100 words.
```

### Why this prompt works
- Role-setting ("financial advisor") keeps the tone professional and numbers-focused
- Injecting real numbers forces specificity — generic summaries don't help users
- "Be honest" instruction prevents the AI from manufacturing savings that don't exist
- "No bullet points" keeps it as a readable paragraph, not a list

### What I tried that didn't work
- First version asked for "a helpful summary" — output was too generic and didn't mention specific numbers
- Second version asked for 200 words — too long, users don't read it
- Tried without role-setting — tone was too casual for a financial tool

### Failure handling
If the OpenRouter API fails (network error, rate limit, no credits), the API route returns `{ summary: null }`. The client then displays a templated fallback summary built from the audit data directly. The results page never breaks due to AI failure.