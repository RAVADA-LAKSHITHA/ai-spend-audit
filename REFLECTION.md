# REFLECTION.md

## 1. The hardest bug I hit this week, and how I debugged it

The hardest bug was the CI pipeline failing on GitHub Actions — specifically the `npm ci` step crashing with a lockfile sync error. Vercel kept deploying successfully, which confused me because that also installs packages. So the code was fine. But GitHub Actions was using `npm ci`, which requires the `package-lock.json` to be perfectly in sync with `package.json`, and mine was not.

My first hypothesis was that it was a lint error — because the error message said "process completed with exit code 1" and I associated that with code errors. So I spent time fixing lint warnings, re-running lint locally (which passed every time), pushing, watching CI fail again. That went on for four or five cycles.

Second hypothesis: the environment variables are missing in CI. I checked — the CI workflow does not need env vars to run lint and tests, so that was wrong too.

I finally opened the raw CI logs carefully instead of just reading the summary. Line 6 said: `npm error: npm ci can only install packages when your package-lock.json and package.json are in sync`. And then I saw `Missing: @emnapi/runtime@1.10.0 from lock file`. That package was not in my lockfile because there was a conflicting `package-lock.json` in my home directory (`C:\Users\LAKSHITHA\`) that had interfered with how packages were tracked.

The fix was simple once I understood it: I changed `npm ci` to `npm install` in the CI workflow. `npm install` regenerates as needed; `npm ci` requires perfection. I documented the decision in the DEVLOG and moved on. What worked: reading the raw logs instead of the summary. The summary just said "failure." The raw logs said exactly what was wrong.

---

## 2. A decision I reversed mid-week, and what made me reverse it

I originally designed the monthly spend field as an editable input — users could type any amount they wanted. The logic was that some teams negotiate custom pricing or have grandfathered plans, so they should be able to enter their actual spend.

I reversed this completely on Day 4. The reason was a test I ran on my own tool: I entered $0/month for a Claude Team plan with 50 team members, and the audit said "you are spending well." That is obviously wrong. A user entering $0 either made a mistake or is trying to game the system — in both cases, the audit output becomes meaningless and potentially misleading.

The right design is: pick your tool, pick your plan, set your seats — and the cost calculates automatically from the verified pricing data. If someone has a truly custom price, they should enter it in seats (more seats = higher cost). The editable spend field was a premature feature that created more problems than it solved. Making it read-only forced the audit engine to work with real data, which made every output more trustworthy.

This was the most important product decision of the week. It made the tool more opinionated, but opinionated is the right call for a tool built on pricing data accuracy.

---

## 3. What I would build in Week 2 if I had it

One conversation changed what I think this product should become. My senior Sai Deepak told me about a bug in their company where a runaway API loop charged them $400 in two hours — and nobody noticed until the bill arrived.

The current tool is a retrospective audit: "here is what you paid last month, here is whether it was right." What Week 2 would build is a real-time monitoring layer: connect your API keys, set a monthly spending limit, and receive an alert the moment spend accelerates abnormally. Not a dashboard — an alert. One push notification or email that says "your Claude API spend has hit 60% of your monthly limit in the first week — something may be wrong."

I would also build the workflow layer that Harsith suggested: instead of just saying "switch from ChatGPT to Claude," show a concrete workflow. "For your use case (coding + writing, 8-person team), here is the optimal stack: Cursor Pro for coding, Claude Pro for writing, cancel ChatGPT." One specific recommendation, not a menu of options.

The current version tells you what is wrong. Week 2 would prevent the problem from happening in the first place, and tell you exactly what to do about it.

---

## 4. How I used AI tools this week

I used Claude (through claude.ai) as my primary tool throughout the week. It helped me scaffold the initial Next.js project, write the audit engine rules, debug JSX errors in the results page, and draft the ARCHITECTURE.md. I would say roughly 70% of the code started from Claude suggestions.

But there were three specific things I did not trust it with and did myself:

**Pricing verification.** Claude gave me pricing data in pricingData.ts, but I personally opened every vendor pricing page and verified each number. Claude had Windsurf Pro at $15/month — the actual price was $20. Claude had Claude Pro at $20 — the actual price is $17. These are not small differences for an audit tool. I documented every correction in PRICING_DATA.md with source URLs.

**The CI lockfile bug.** When the GitHub Actions CI kept failing, I tried asking Claude for help and it gave me solutions that did not address the real problem. It kept suggesting I fix lint errors. I eventually had to read the raw CI logs myself, identify the `@emnapi/runtime` missing package error, and figure out that switching from `npm ci` to `npm install` was the right fix. Claude did not catch this because it was reasoning about code, not about environment-specific npm behavior.

**The audit engine flaw.** I noticed mid-week that the engine was saying "you are spending well" even when I entered a team of 50 people with 1 seat. Claude wrote the initial engine but did not anticipate this scenario. I identified it by testing the tool myself, described the problem precisely, and then used Claude to help implement the fix — but the identification of the bug was mine.

One specific time Claude was wrong: on Day 3, it generated JSX with a `→` arrow character directly in the code. This broke compilation because JSX cannot render that character without an HTML entity. The error manifested as 11 cascading TypeScript errors that made the file look completely broken. Claude's suggested fix (change the arrow to text) was correct, but it took several exchanges to identify the root cause because the error messages pointed to lines 50 lines away from the actual problem.

---

## 5. Self-rating

**Discipline: 7/10**
I started strong on Days 1–3 and got progressively more reactive on Days 4–5 as debugging took longer than planned. I did not fall behind on deliverables, but I was not as proactive as I wanted to be — especially on the entrepreneurial files, which I left too late. The DEVLOG entries are honest but some days were written at the end of the day rather than throughout.

**Code quality: 6/10**
The architecture is sensible — separation of audit engine, API routes, and UI components is clean. But there are places where I took shortcuts: the audit engine rules are a long if-else chain that would be better as a rule registry pattern. Some TypeScript types could be tighter. The test coverage (9 tests) covers the happy paths but not edge cases like empty inputs or API failures.

**Design sense: 6/10**
The light theme was the right call and the results page looks professional enough to screenshot. But the form has alignment issues at smaller screen sizes and I did not run Lighthouse until late in the process. I relied on Tailwind defaults more than I should have for a product that is supposed to be shareable and screenshot-worthy.

**Problem-solving: 8/10**
The strongest moment was identifying that the audit engine was not using team size meaningfully — and then redesigning the seat coverage logic, auto-calculation, and read-only cost field in response. That required understanding both the product problem and the technical implementation. The CI debugging was also a genuine problem I had to work through without a clean answer.

**Entrepreneurial thinking: 8.5/10**
I converted a "tool comparison" idea into an "AI overspending prevention" product after three real user conversations. The user interviews genuinely changed my design — the read-only cost field, the team coverage analysis, and the Week 2 roadmap all came from things real people said. I understand who the customer is, what they are afraid of, and why this tool exists. The economics make sense and the GTM is specific. I leave this week believing the product could actually work, not just that it was a good exercise.