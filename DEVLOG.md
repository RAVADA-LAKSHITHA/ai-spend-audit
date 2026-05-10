# Dev Log

## Day 1 — 2026-05-07

**Hours worked:** 6

**What I did:**
- Scaffolded Next.js 14 project with TypeScript, Tailwind, shadcn/ui
- Set up Supabase project and created audits + leads tables
- Installed all dependencies and configured environment variables
- Built the pricing data module with all 8 required tools and their plans
- Built the core audit engine with rule-based logic for plan right-sizing, duplicate tool detection, and use-case mismatch detection
- Wrote ARCHITECTURE.md with Mermaid system diagram
- Wrote PRICING_DATA.md with sources for all tool pricing

**What I learned:**
- Supabase SQL editor makes schema setup fast — no ORM needed for simple tables
- The audit engine logic is trickier than it looks — "is this plan right-sized?" requires knowing both the plan's expected price AND the user's actual spend

**Blockers / what I'm stuck on:**
- Need to verify exact current pricing for Gemini Ultra and ChatGPT Enterprise — couldn't find clear per-seat numbers, will document as "custom" for now

**Plan for tomorrow:**
- Build the spend input form (all 8 tools, plan selector, seats, team size, use case)
- Implement localStorage persistence so form survives page reload
- Write 5+ unit tests for the audit engine


## Day 2 — 2026-05-08

**Hours worked:** 6

**What I did:**
- Fixed pricing data: Claude Pro ($17), Windsurf Pro ($20/Teams $40), added Perplexity AI
- Set up Vitest and wrote 6 unit tests for the audit engine
- Built the homepage spend input form with tool selector, plan selector, monthly spend, seats
- Implemented localStorage persistence — form state survives page reloads
- Created /api/audit API route that runs audit engine and stores result in Supabase
- Confirmed end-to-end: form → API → Supabase row created ✅

**What I learned:**
- Supabase insert().select('id').single() is the cleanest way to get the inserted row ID back
- localStorage needs to be wrapped in useEffect to avoid hydration errors in Next.js

**Blockers / what I'm stuck on:**
- Results page not built yet — audit submits but redirects to a 404

**Plan for tomorrow:**
- Build audit results page (/audit/[id]) with per-tool breakdown and savings hero
- Integrate Anthropic API for personalized summary
- Add shareable URL with Open Graph tags

## Day 3 — 2026-05-09

**Hours worked:** 6

**What I did:**
- Built the audit results page (/audit/[id]) with savings hero, per-tool breakdown, AI summary
- Created /api/summary route using OpenRouter (Claude Haiku) for personalized summary
- Added graceful fallback for when AI API fails — results page never breaks
- Added Open Graph + Twitter card meta tags for shareable URLs
- Added Credex CTA for audits showing >$500/mo savings
- Wrote PROMPTS.md documenting the prompt, reasoning, and what didn't work

**What I learned:**
- Next.js generateMetadata runs server-side so it can fetch from Supabase directly
- Separating server component (page.tsx) from client component (AuditResultsClient.tsx) is the right pattern — metadata needs server, interactivity needs client

**Blockers / what I'm stuck on:**
- Need to set up Resend for email capture tomorrow
- Lead capture form not built yet

**Plan for tomorrow:**
- Build email capture modal on results page
- Set up Resend transactional email
- Deploy to Vercel
- Set up GitHub Actions CI


## Day 4 — 2026-05-10

**Hours worked:** 8

**What I did:**
- Set up Resend account and built /api/leads route with transactional email confirmation
- Added email capture card to results page — shown after value is delivered, never before
- Implemented honeypot field + in-memory rate limiting for abuse protection
- Deployed to Vercel — live URL confirmed working end-to-end
- Set up GitHub Actions CI workflow (.github/workflows/ci.yml)
- Fixed major audit engine issues — added team size analysis, seat coverage detection, auto-calculated costs (read-only), plan upgrade suggestions based on team size
- Made monthly spend field read-only — cost now auto-calculates from plan × seats, preventing invalid inputs like $0
- Fixed all ESLint errors — replaced any types, fixed setState in useEffect, removed unused imports
- Fixed CI npm install sync error by switching from npm ci to npm install in workflow
- Confirmed CI green on latest commit ✅

**What I learned:**
- npm ci requires perfect lockfile sync — npm install is safer for projects with multiple developers or environments
- Making the cost field read-only is both better UX and prevents garbage data entering the audit engine
- useState lazy initializers (() => ...) are the right pattern for reading localStorage without triggering hydration issues
- GitHub Actions fails fast — even one step failure skips all remaining steps

**Blockers / what I'm stuck on:**
- Need to write all entrepreneurial files tomorrow (GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS) — these are worth 25 points
- Need to complete 3rd user interview

**Plan for tomorrow:**
- Write GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md, USER_INTERVIEWS.md
- Complete REFLECTION.md and TESTS.md and README.md
- Run Lighthouse on deployed URL and fix any scores below threshold