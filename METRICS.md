# METRICS.md

## North Star Metric

**Audits completed per week**

This is the right North Star for this stage because:
- Every audit represents genuine value delivered (someone learned something about their spend)
- It is upstream of every business outcome — no audit means no lead, no consultation, no Credex revenue
- It is not gameable — someone completing an audit requires intent and engagement
- It is not a vanity metric like page views or signups

"Leads captured" would seem like a better business metric, but leads are a downstream outcome. If audits are growing, leads follow. If we optimize for leads directly, we might add friction that kills audit completion. Protect the North Star.

**Target:** 100 audits/week by end of month 1, 500/week by end of month 3.

---

## 3 Input Metrics That Drive the North Star

**1. Audit start rate (visitors who begin filling the form)**
- Why it matters: if people land and immediately leave, the value proposition is unclear or the form looks intimidating
- Target: >55% of visitors start the form
- How to improve: sharpen hero copy, reduce form fields, add social proof above the fold

**2. Audit completion rate (people who start and submit)**
- Why it matters: form abandonment means friction — too many fields, confusion about what to enter, or broken UX
- Target: >70% of starters complete the audit
- How to improve: auto-calculate cost (already done), clear column headers, sensible defaults

**3. Shareable URL click-through rate**
- Why it matters: this is the viral loop — shared audit results bring new visitors for free
- Target: each audit generates 0.3 new visits on average (i.e., 30% of audits get shared and clicked)
- How to improve: make the results page screenshot-worthy, add a prominent share button, generate compelling OG preview text

---

## What We Instrument First

In order of priority:

1. **Audit completions** — Supabase row count in `audits` table (already instrumented)
2. **Email capture rate** — leads / audits (Supabase `leads` table vs `audits` table)
3. **Shareable URL opens** — track when a `/audit/[id]` page is opened without coming from the form flow (referrer not localhost or the homepage)
4. **High-savings audit rate** — what % of audits show >$500/mo savings (determines Credex CTA trigger frequency)
5. **Credex CTA click rate** — clicks on "Book free consultation" button (Google Analytics event or Vercel Analytics)

We do not instrument session duration or bounce rate at this stage. They are noise. We care about actions, not time spent.

---

## What Number Triggers a Pivot Decision

**If audit completion rate drops below 40%** — the form is broken or confusing. Stop adding features, fix the funnel first.

**If email capture rate drops below 15%** — the audit results are not delivering enough value to earn the email. The audit logic needs to be sharper, or the results page needs redesign.

**If 0 Credex consultations are booked after 200 high-savings audits** — the Credex CTA is not compelling or the audience does not trust it. Revisit the CTA copy and placement.

**If shareable URL click-through stays at 0** — the viral loop is not working. Consider adding a "compare with your friends' stack" angle or a leaderboard to incentivize sharing.

The tool is at lead-gen stage. The pivot trigger is not "people aren't paying" (it's free) — it is "people are not completing the audit" or "completed audits are not converting to Credex consultations." Those are the two metrics that determine whether the business model works.