// All prices verified May 2026 from official vendor pricing pages
// Sources documented in PRICING_DATA.md

export type Plan = {
  name: string
  pricePerSeat: number // USD per user per month
  minSeats?: number
  bestFor: string
}

export type Tool = {
  id: string
  name: string
  plans: Plan[]
  category: 'coding' | 'writing' | 'general' | 'api'
}

export const TOOLS: Tool[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding',
    plans: [
      { name: 'Hobby', pricePerSeat: 0, bestFor: 'Individual, light use' },
      { name: 'Pro', pricePerSeat: 20, bestFor: 'Individual power users' },
      { name: 'Business', pricePerSeat: 40, bestFor: 'Teams needing admin' },
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'coding',
    plans: [
      { name: 'Individual', pricePerSeat: 10, bestFor: 'Solo developers' },
      { name: 'Business', pricePerSeat: 19, bestFor: 'Teams' },
      { name: 'Enterprise', pricePerSeat: 39, bestFor: 'Large orgs with policy control' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    category: 'general',
    plans: [
      { name: 'Free', pricePerSeat: 0, bestFor: 'Light use' },
      { name: 'Pro', pricePerSeat: 17, bestFor: 'Individual heavy users' },
      { name: 'Max', pricePerSeat: 100, bestFor: 'Power users needing max output' },
      { name: 'Team', pricePerSeat: 30, minSeats: 5, bestFor: 'Teams needing collaboration' },
      { name: 'Enterprise', pricePerSeat: 0, bestFor: 'Custom pricing, large orgs' },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'general',
    plans: [
      { name: 'Plus', pricePerSeat: 20, bestFor: 'Individual users' },
      { name: 'Team', pricePerSeat: 30, minSeats: 2, bestFor: 'Small teams' },
      { name: 'Enterprise', pricePerSeat: 0, bestFor: 'Custom pricing' },
    ],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'api',
    plans: [
      { name: 'Pay-as-you-go', pricePerSeat: 0, bestFor: 'Variable usage' },
    ],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    category: 'api',
    plans: [
      { name: 'Pay-as-you-go', pricePerSeat: 0, bestFor: 'Variable usage' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    category: 'general',
    plans: [
      { name: 'Gemini Advanced', pricePerSeat: 20, bestFor: 'Individual users' },
      { name: 'Workspace Add-on', pricePerSeat: 0, bestFor: 'Custom; varies by Workspace tier' },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'coding',
    plans: [
      { name: 'Free', pricePerSeat: 0, bestFor: 'Light use' },
      { name: 'Pro', pricePerSeat: 20, bestFor: 'Individual developers' },
      { name: 'Teams', pricePerSeat: 40, bestFor: 'Teams' },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'general',
    plans: [
      { name: 'Free', pricePerSeat: 0, bestFor: 'Light use' },
      { name: 'Pro', pricePerSeat: 20, bestFor: 'Heavy research, file uploads' },
      { name: 'Enterprise', pricePerSeat: 0, bestFor: 'Custom pricing, SSO' },
    ],
  },
]