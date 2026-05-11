# TESTS.md

## Test Strategy

The audit engine is the core of SpendSmart AI — if it gives wrong advice, the product is useless. So all tests focus on the audit engine logic. The UI is tested manually (described below).

Run tests:
```bash
npm test
```

All 9 tests pass. Test runner: Vitest v4.1.5.

---

## Automated Tests — Audit Engine

File: `src/lib/__tests__/auditEngine.test.ts`

---

### Test 1: Team plan overkill — flags correctly

**Scenario:** 1 user on Cursor Business plan ($40/mo)  
**Expected:** flagged as overkill — Business plan is for teams, not solo users  
**Result:** ✅ `isOptimal = false`, `monthlySavings > 0`

**Why this matters:** A solo developer on a Business plan pays for admin features, SSO, and audit logs they will never use. The engine should catch this.

---

### Test 2: Pro plan for solo user — not flagged

**Scenario:** 1 user on Cursor Pro plan ($20/mo)  
**Expected:** no flag — Pro is the right plan for an individual  
**Result:** ✅ `isOptimal = true`, `monthlySavings = 0`

**Why this matters:** The engine should only flag genuine problems, not generate false positives for correctly-priced plans.

---

### Test 3: Billing overage detection

**Scenario:** Cursor Pro (should be $20/mo for 1 seat) but paying $45/mo  
**Expected:** flagged — $25 unexplained overage  
**Result:** ✅ `isOptimal = false`, `monthlySavings >= 20`

**Why this matters:** Extra seats, add-ons, or billing errors are common. The engine compares actual spend vs expected `pricePerSeat × seats` and flags the difference.

---

### Test 4: Correct billing — not flagged

**Scenario:** GitHub Copilot Business, 3 seats, paying $57/mo ($19 × 3 = $57 exactly)  
**Expected:** no flag — billing matches expected cost  
**Result:** ✅ `monthlySavings = 0`

**Note:** This test was initially written with 2 seats ($38), but 2 seats triggered the "team plan for small team" rule correctly. Fixed to 3 seats which is above the threshold.

---

### Test 5: Duplicate general AI tools

**Scenario:** Paying for both Claude Pro and ChatGPT Plus, use case = writing  
**Expected:** ChatGPT flagged as redundant — Claude covers writing better  
**Result:** ✅ `chatgptResult.isOptimal = false`, `monthlySavings > 0`

**Why this matters:** Many teams pay for 2-3 general AI tools that overlap 80%. For non-data use cases, one is enough.

---

### Test 6: Use case mismatch

**Scenario:** Cursor Pro ($20/mo), use case = writing  
**Expected:** flagged — Cursor is a coding IDE, not useful for writing teams  
**Result:** ✅ `isOptimal = false`, `monthlySavings = 20`

**Why this matters:** Teams sometimes keep tools from a previous use case. A writing team paying for a coding IDE is pure waste.

---

### Test 7: Already optimal — isAlreadyOptimal flag

**Scenario:** Cursor Pro, 1 seat, correct price, coding use case  
**Expected:** `isAlreadyOptimal = true`, `totalMonthlySavings = 0`  
**Result:** ✅ Correct

**Why this matters:** The results page shows a different UI ("You're spending well") when no savings are found. This flag drives that branch.

---

### Test 8: Annual savings = 12x monthly

**Scenario:** Any audit with detected monthly savings  
**Expected:** `totalAnnualSavings === totalMonthlySavings * 12`  
**Result:** ✅ Correct

**Why this matters:** Annual savings is the headline number on the results page. A calculation bug here would undermine user trust in the entire product.

---

### Test 9: High savings flag (>$500/mo)

**Scenario:** Cursor Business, 1 seat, paying $600/mo  
**Expected:** `isHighSavings = true`  
**Result:** ✅ Correct

**Why this matters:** The `isHighSavings` flag triggers the Credex CTA on the results page — the business-critical conversion path. It must fire accurately.

---

## Manual Tests — UI and Integration

These were tested manually on both localhost and the live Vercel deployment.

### Form Behavior

| Test | Expected | Result |
|------|----------|--------|
| Select a seat-based plan (e.g. Cursor Pro) → change seats | Monthly cost auto-updates | ✅ |
| Select Claude Team with 1 seat | Auto-corrects to minimum 5 seats, cost = $150 | ✅ |
| Select OpenAI API (pay-as-you-go) | Cost field becomes editable (not read-only) | ✅ |
| Submit with team size 0 | Alert: "Please enter a valid team size of at least 1" | ✅ |
| Submit with API tool at $0 | Alert: "Please enter your actual monthly spend for API tools" | ✅ |
| Submit without selecting a plan | Alert: "Please select a plan for each tool" | ✅ |
| Reload page | Form data restored from localStorage | ✅ |
| Add tool then remove it | Works, cannot remove last tool | ✅ |

### Audit Engine — End-to-End

| Test | Expected | Result |
|------|----------|--------|
| Claude Pro + ChatGPT Plus, writing use case | ChatGPT flagged as duplicate | ✅ |
| Cursor Pro, 2 seats, team size 50, coding | Low coverage warning | ✅ |
| Cursor Pro, 60 seats, team size 50, coding | Extra seats warning | ✅ |
| Gemini Advanced, 1 seat, correct price, solo team | No flag — spending well | ✅ |
| Claude Max, 1 seat, team size 1 | Downgrade to Pro recommended, save $83/mo | ✅ |
| API tool with $0 entered | Flagged as invalid — must enter actual spend | ✅ |

### Results Page

| Test | Expected | Result |
|------|----------|--------|
| Results page loads for valid UUID | Audit data and per-tool breakdown visible | ✅ |
| AI summary loads | Claude-generated paragraph appears after ~2s | ✅ |
| Click "Share report" | URL copied to clipboard, button shows "Link copied!" | ✅ |
| Email form — enter email and submit | Success state shown, email arrives in inbox | ✅ |
| Open audit URL in incognito | Page loads correctly (public audit) | ✅ |
| Browser tab title | Shows "I found $X/mo in AI overspend" with correct amount | ✅ |

### Email Delivery

| Test | Expected | Result |
|------|----------|--------|
| Submit email on results page | Confirmation email delivered to inbox | ✅ |
| Email content | Shows savings amount, tool recommendations | ✅ |
| Multiple emails from same IP | Rate limited after 3 submissions per hour | ✅ |
| Bot honeypot field filled | Silently rejected, no email sent | ✅ |

---

## What I Would Test Next (Given More Time)

- **Load testing** — how does the audit API handle 100 concurrent requests?
- **Edge cases** — what if Supabase is down? Does the UI degrade gracefully?
- **Accessibility** — run axe-core on the form and results page
- **Mobile layout** — the 12-column grid on mobile needs responsive testing
- **API error handling** — what if OpenRouter fails mid-request? (Currently falls back to a templated summary)