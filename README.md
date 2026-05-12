# SpendSmart AI — Free AI Spend Audit Tool for Startups

SpendSmart AI helps startup founders and engineering managers find out if they're overpaying for AI tools like Cursor, Claude, ChatGPT, and GitHub Copilot. Enter your tools and plans, get an instant audit — right plan, right seats, exact savings.

**Live URL:** https://ai-spend-audit-eta.vercel.app  
**Built for:** Credex Web Development Intern Assignment — Round 1

---

## Screenshots

### Homepage — Spend Input Form
![Homepage form where users enter their AI tools, plans, and seats](https://ai-spend-audit-eta.vercel.app/og-preview.png)

> Form with tool selector, plan dropdown, seat count, and auto-calculated monthly cost. Cost is read-only — calculated from official pricing × seats to prevent invalid inputs.

### Results Page — Savings Identified
![Results page showing savings hero, AI summary, and per-tool breakdown]

> Hero shows total monthly and annual savings. AI-generated summary powered by Claude via OpenRouter. Per-tool breakdown with specific recommendations and reasons.

### Results Page — Already Optimized
![Results page showing spending well message with email capture]

> Honest output when no savings found — "You are spending well." Email capture still shown so users can be notified when new optimizations apply.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account (free tier)
- An OpenRouter account (free credits available)
- A Resend account (free tier)

### Install and run locally

```bash
git clone https://github.com/RAVADA-LAKSHITHA/ai-spend-audit
cd ai-spend-audit
npm install
```

Create `.env.local` at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
RESEND_API_KEY=your_resend_api_key
```

Run the Supabase SQL to create tables:

```sql
create table audits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  tools jsonb not null,
  team_size int,
  use_case text,
  total_monthly_savings numeric,
  total_annual_savings numeric,
  results jsonb,
  is_public boolean default true
);

create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  audit_id uuid references audits(id),
  email text not null,
  company_name text,
  role text,
  team_size int
);
```

Then start the dev server:

```bash
npm run dev
```

Open http://localhost:3000

### Run tests

```bash
npm test
```

### Deploy

Push to GitHub and connect to Vercel. Add all four environment variables in Vercel project settings before deploying.

---

## How the Audit Engine Works

The engine applies deterministic rules — no AI involved in the math. Each tool input goes through these checks in order:

1. **Seat minimum violation** — Does the chosen plan require more seats than entered? (e.g. Claude Team requires min 5)
2. **Billing overage** — Is actual spend higher than `pricePerSeat × seats`? Flags unexplained charges.
3. **Team plan for tiny team** — Business/Team plan for ≤2 people? Recommends downgrading to individual plan.
4. **Under-licensed** — Coding tool with seats covering <40% of the dev team? Flags as wasted or shared accounts.
5. **Extra seats** — More seats than team members? Flags unused seats.
6. **Use case mismatch** — Coding IDE for a writing team? Recommends cancellation.
7. **Duplicate general tools** — Paying for both Claude and ChatGPT for the same use case? Flags overlap.
8. **Claude Max overkill** — Solo user on $100/mo Max plan? Recommends Pro at $17/mo.
9. **Perplexity overlap** — Paying for Perplexity when Claude/ChatGPT already cover the use case?

AI is only used for the 100-word personalized summary paragraph. The audit math is hardcoded rules — knowing when not to use AI is part of the product design.

---

## Decisions

**1. Read-only cost field instead of editable**
Initially the monthly spend was a free-text input. This allowed users to enter $0 for paid plans, which made the audit engine output nonsense ("spending well" for a Claude Team plan at $0). Changed to auto-calculate from `pricePerSeat × seats` using verified pricing data. API/pay-as-you-go tools (OpenAI API, Anthropic API) remain editable since they have no fixed per-seat price.

**2. OpenRouter instead of Anthropic API directly**
The Anthropic API requires adding payment before getting an API key. OpenRouter provides free credits and proxies to Claude models with the same API structure. For a submission-week prototype this was the pragmatic choice. Switching to direct Anthropic API in production requires changing one URL and the model string.

**3. Rule-based audit engine, not AI**
Early design considered using Claude to analyze spend. Rejected because: (a) AI output is non-deterministic — two identical inputs might get different recommendations, undermining user trust; (b) hardcoded rules are debuggable, auditable, and defensible to a finance-literate reader; (c) the assignment explicitly noted "knowing when not to use AI is part of the test."

**4. Next.js App Router with server/client split**
The results page uses a server component (`page.tsx`) for metadata generation (Open Graph tags need server-side Supabase access) and a client component (`AuditResultsClient.tsx`) for interactivity. This is the correct Next.js 14 pattern — not a premature optimization.

**5. Supabase over Firebase**
Both would work. Supabase gives a real Postgres database, SQL editor for quick schema changes, and row-level security. The SQL familiarity made debugging faster. Firebase's NoSQL would have required more upfront schema thinking.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Server components + API routes in one deploy |
| Language | TypeScript | Catches type errors in audit engine at compile time |
| Styling | Tailwind + shadcn/ui | Fast, accessible, not a pre-built template |
| Database | Supabase (Postgres) | Free tier, SQL, row-level security |
| Email | Resend | Simplest transactional email API, free tier |
| AI | OpenRouter → Claude Haiku | Free credits, Claude quality |
| Deploy | Vercel | One-click Next.js deployment |
| CI | GitHub Actions | Lint + test on every push to main |
| Tests | Vitest | Jest-compatible, faster, ESM-native |

---

## Required Files at Repo Root

| File | Purpose |
|------|---------|
| README.md | This file |
| ARCHITECTURE.md | System diagram, data flow, stack decisions |
| DEVLOG.md | Daily log — 7 entries across 7 days |
| REFLECTION.md | 5 questions, 150–400 words each |
| TESTS.md | All automated and manual tests |
| PRICING_DATA.md | Source URLs for every price in the audit engine |
| PROMPTS.md | Full AI prompts used in the tool |
| GTM.md | Go-to-market strategy |
| ECONOMICS.md | Unit economics and $1M ARR model |
| USER_INTERVIEWS.md | 3 real conversations with potential users |
| LANDING_COPY.md | Hero copy, CTA, FAQ |
| METRICS.md | North Star metric and input metrics |