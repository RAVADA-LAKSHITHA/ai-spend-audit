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


## Day 5 — 2026-05-11

**Hours worked:** 5

**What I did:**
- Fixed API tool $0 validation — audit engine now flags Pay-as-you-go tools entered as $0 as invalid input, and form blocks submission with a clear message
- Updated handleSubmit validation to distinguish between API tools (need manual spend entry) and seat-based tools (need plan selection)
- Wrote README.md — project overview, tech stack decisions, audit engine rules, local setup, database schema
- Wrote TESTS.md — documented all 9 unit tests with inputs/expected outputs, manual test scenarios on live URL, what is not tested and why
- Committed all entrepreneurial files (GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS, REFLECTION) from Day 5 work
- Verified 5 distinct commit days in git history: May 7, 8, 9, 10, 11 ✅
- Final submission checklist complete

**What I learned:**
- Separating API tools (pay-as-you-go) from seat-based tools in validation logic is important — the same "no plan selected" check doesn't apply to both
- Writing TESTS.md made me realize how much manual testing I had been doing without documenting it — the Resend dashboard, the Supabase table, the localStorage — all of it counts as testing
- README.md is harder to write than code because you have to explain your decisions, not just what the code does

**What I would do with more time:**
- Add real-time API spend monitoring — the biggest insight from user interviews was Sai Deepak's $400 runaway API loop. The next version of this tool should detect abnormal API activity and alert before costs spiral, not just audit what happened last month
- Add usage-based analysis — right now we audit what you're paying for. The better question is what you're actually using. A tool that shows "you have 20 Cursor seats and only 8 people logged in this week" is 10x more useful
- Verify a custom domain on Resend so emails come from a branded address instead of onboarding@resend.dev

**Final state:**
- Live URL: https://ai-spend-audit-eta.vercel.app/
- GitHub: https://github.com/RAVADA-LAKSHITHA/ai-spend-audit
- CI: ✅ Green
- Commit days: ✅ 5 distinct days
- All required files: ✅ Present at repo root
- User interviews: ✅ 3 completed (Sai Deepak, Harsith Veera Charan, Omkar Palika)


## Day 6 — 2026-05-12

**Hours worked:** 5

**What I did:**
- Complete UI redesign — moved from a simple form layout to a professional table-style card with proper visual hierarchy
- Added green cost pills that auto-calculate, amber highlighted fields for API tools requiring manual spend entry
- Added stats row (9 tools · 2 min · 100% free) and Step 1 of 1 badge for product feel
- Added inline validation error display inside the card instead of browser alerts
- Fixed Enterprise/Pay-as-you-go $0 validation — users must enter actual spend for custom-priced plans
- Added aria-labels to all buttons and select elements for accessibility
- Removed auto-generated AGENTS.md and CLAUDE.md files from repo root
- Ran Lighthouse on live URL: Performance 99, Accessibility 84, Best Practices 96, SEO 100
- Verified 6 distinct commit days in git history ✅

**What I learned:**
- Hydration errors caused by browser extensions (password managers add fdprocessedid attributes) look scary but are not real bugs — they don't affect real users
- UI redesign is faster when you have a clear reference — the preview widget helped me understand what professional looks like vs what I had

**Blockers / what I'm stuck on:**
- Accessibility score is 84, need 90+ — select elements and buttons need aria-labels (in progress)

**Plan for tomorrow:**
- Submit the assignment via Google Form
- Final git log check — confirm 5+ distinct days
- Verify live URL still working
- Verify CI green on latest commit


