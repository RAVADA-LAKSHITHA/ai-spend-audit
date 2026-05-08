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