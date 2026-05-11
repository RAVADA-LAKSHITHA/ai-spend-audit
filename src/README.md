# SpendSmart AI

**Free AI spend audit tool for startups.**  
Are you overspending on AI tools? Enter your stack. Get an instant audit — right plans, right seats, exact savings.

🔗 **Live:** https://ai-spend-audit-eta.vercel.app  
📦 **Repo:** https://github.com/RAVADA-LAKSHITHA/ai-spend-audit

---

## What it does
 
SpendSmart AI analyzes your team's AI tool subscriptions and tells you:
 
- Whether you're on the right plan for your team size
- If you have too many or too few seats
- Where you're paying for tools that overlap
- Whether your use case matches the tools you're paying for
- Exactly how much you could save per month and per year
No login required. Takes 2 minutes. Results are shareable via a unique URL.
 
---

## Features

- **Smart audit engine** — 9 rule-based checks: seat coverage, plan right-sizing, duplicate tool detection, use-case mismatch, billing overage, API spend validation
- **AI-generated summary** — personalized 100-word paragraph via Claude (through OpenRouter)
- **Shareable report URLs** — every audit gets a unique UUID link with Open Graph previews
- **Email capture** — sends a full report to your inbox via Resend
- **Auto-calculated costs** — monthly spend auto-fills from plan × seats; API tools require manual entry
- **Team-aware analysis** — recommendations change based on team size, not just dollar amounts

---

 
## Audit Engine Rules
 
The engine in `src/lib/auditEngine.ts` checks 9 rules per tool:
 
1. **API tools with $0 spend** — flags invalid input
2. **Billing overage** — paying more than plan × seats implies unused seats or overages
3. **Team plan for small team** — Business/Team plans for ≤2 people is overkill
4. **Under-licensed** — too few seats for team size (compliance risk or sharing accounts)
5. **Over-licensed** — more seats than team members (waste)
6. **Wrong tool for use case** — coding IDE for a writing team, etc.
7. **Claude Max overkill** — $100/mo plan rarely justified for small teams
8. **Duplicate general AI tools** — paying for both Claude and ChatGPT when one covers the use case
9. **Perplexity overlap** — research tool redundant when Claude/ChatGPT already present

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Server components + API routes in one, Vercel deploy in one click |
| Language | TypeScript | Audit engine has complex types; catches bugs at compile time |
| Styling | Tailwind + shadcn/ui | Fast, accessible, consistent — no pre-built template |
| Database | Supabase (Postgres) | Free tier, built-in RLS, instant REST API |
| Email | Resend | Simplest transactional email API, free tier sufficient |
| AI | OpenRouter → Claude Haiku | Same Claude model, no Anthropic billing setup needed |
| Deploy | Vercel | Auto-deploy on push, free tier, global CDN |
| Testing | Vitest | Jest-compatible, much faster, works with TypeScript natively |
| CI | GitHub Actions | Lint + test on every push to main |

---

## Project Structure
 
```
ai-spend-audit/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Homepage with spend input form
│   │   ├── audit/[id]/
│   │   │   ├── page.tsx              # Server component — fetches audit from Supabase
│   │   │   └── AuditResultsClient.tsx # Client component — results UI + email capture
│   │   └── api/
│   │       ├── audit/route.ts        # POST: runs audit engine, saves to Supabase
│   │       ├── summary/route.ts      # POST: generates AI summary via OpenRouter
│   │       └── leads/route.ts        # POST: saves email lead, sends Resend email
│   └── lib/
│       ├── pricingData.ts            # Tool and plan definitions with verified prices
│       ├── auditEngine.ts            # Rule-based audit logic
│       ├── supabase.ts               # Supabase client
│       └── __tests__/
│           └── auditEngine.test.ts   # 9 unit tests for audit engine
├── .github/workflows/ci.yml          # GitHub Actions: lint + test on push
├── ARCHITECTURE.md
├── PRICING_DATA.md
├── PROMPTS.md
├── GTM.md
├── ECONOMICS.md
├── USER_INTERVIEWS.md
├── LANDING_COPY.md
├── METRICS.md
├── REFLECTION.md
└── DEVLOG.md
```
 
---

## Key Architecture Decisions

**Why rule-based, not AI-only for the audit?**  
Deterministic rules are auditable, explainable, and never hallucinate savings. AI is used only for the summary paragraph where natural language adds value. Users can trust the numbers because the logic is transparent.

**Why separate server and client components on the results page?**  
`page.tsx` runs server-side to fetch from Supabase and generate Open Graph metadata for shareable links. `AuditResultsClient.tsx` handles interactivity (share button, email form). Mixing these would break OG tags.

**Why make monthly spend read-only for seat-based plans?**  
Prevents users from entering $0 or random numbers for plans with known prices. Cost auto-calculates from `pricePerSeat × seats`, enforcing minimum seat counts (e.g. Claude Team requires minimum 5 seats).

**Why OpenRouter instead of Anthropic API directly?**  
Same Claude model, zero billing friction for a student project. The summary API route can be pointed at Anthropic directly with one line change.

---

## Running Locally

```bash
# Clone and install
git clone https://github.com/RAVADA-LAKSHITHA/ai-spend-audit
cd ai-spend-audit
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENROUTER_API_KEY, RESEND_API_KEY

# Run Supabase SQL (in Supabase SQL editor)
# create table audits (...) — see ARCHITECTURE.md

# Start dev server
npm run dev
```

Open http://localhost:3000

---

## Running Tests

```bash
npm test
```

9 tests covering: plan right-sizing, billing overage detection, duplicate tool flagging, use-case mismatch, optimal spending detection, annual savings math.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENROUTER_API_KEY` | OpenRouter API key (for Claude summary) |
| `RESEND_API_KEY` | Resend API key (for confirmation emails) |

---

## Deployment

Deployed on Vercel. Auto-deploys on every push to `main`.  
CI runs lint + tests on every push via GitHub Actions (`.github/workflows/ci.yml`).

---

## Database Schema
 
```sql
-- Stores each audit result
create table audits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  tools jsonb not null,
  team_size int,
  use_case text,
  total_monthly_savings numeric,
  total_annual_savings numeric,
  results jsonb,
  summary text,
  is_public boolean default true
);
 
-- Stores email leads captured after results
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
 
---

## What I'd Add With More Time

1. **Real-time API cost monitoring** — detect runaway API loops before they cost hundreds of dollars (inspired by a user interview where a bug cost $400 in 2 hours)
2. **Spending alerts** — set a monthly cap; get notified when you're approaching it
3. **Tool workflow builder** — not just "which tool" but "which tool for which task in which pipeline"
4. **Historical tracking** — compare this month's spend vs last month, trend over time

---

## Pricing Data
 
All tool prices verified manually against official vendor pricing pages during submission week (May 2026). Sources and verification dates documented in `PRICING_DATA.md`.
 
Tools covered: Cursor, GitHub Copilot, Claude, ChatGPT, OpenAI API, Anthropic API, Gemini, Windsurf, Perplexity AI.
 
---

## Built By

Ravada Lakshitha — 2nd year, Anil Neerukonda Institute of Technology and Sciences  
Built as part of the Credex Web Development Internship Assignment, May 2026