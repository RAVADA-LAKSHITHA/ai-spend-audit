# PRICING_DATA.md

> **Internal Engineering Reference** — AI Spend Audit Application
> Last verified: 2026-05-07 | Update cadence: Monthly | Format version: 2.1

---

## Normalization Rules

| Rule | Description |
|------|-------------|
| **Currency** | All prices in USD |
| **Billing unit** | Per user, per month (seat-based unless noted) |
| **Annual vs monthly** | Monthly equivalent listed; annual-only flagged with `[annual-only]` |
| **Minimum seats** | Noted inline; enforced as floor in billing logic |
| **Free tiers** | Represented as `$0.00` — never omitted |
| **Unknown prices** | Marked `[unconfirmed]` — never estimated |
| **Token-based APIs** | Listed separately; not normalized to seat cost |

---

## Assumptions

- All prices reflect public, self-serve plans. Enterprise/negotiated pricing excluded.
- Monthly billing used as default where both monthly and annual options exist.
- Seat minimums treated as hard floors in audit calculations.
- API pricing tracked separately and not aggregated with seat-based tools.

---

## Pricing Tables

### Cursor
**Source:** https://cursor.com/pricing | **Last verified:** 2026-05-07

| Plan | Price (USD/user/month) | Notes |
|------|------------------------|-------|
| Hobby | $0.00 | Free tier; limited completions |
| Pro | $20.00 | Unlimited completions, priority models |
| Business | $40.00 | SSO, admin dashboard, audit logs |

---

### GitHub Copilot
**Source:** https://github.com/features/copilot | **Last verified:** 2026-05-07

| Plan | Price (USD/user/month) | Notes |
|------|------------------------|-------|
| Individual | $10.00 | Personal accounts only |
| Business | $19.00 | Policy management, org controls |
| Enterprise | $39.00 | Fine-tuning, audit, SAML SSO |

---

### Claude — claude.ai (Anthropic)
**Source:** https://anthropic.com/pricing | **Last verified:** 2026-05-07

| Plan | Price (USD/user/month) | Notes |
|------|------------------------|-------|
| Free | $0.00 | Usage limits apply |
| Pro | $17.00 | Higher limits, priority access |
| Max | $100.00 | Highest limits, early feature access |

---

### ChatGPT — OpenAI
**Source:** https://openai.com/chatgpt/pricing | **Last verified:** 2026-05-07

| Plan | Price (USD/user/month) | Notes |
|------|------------------------|-------|
| Plus | $20.00 | GPT-4o access |
| Enterprise | [unconfirmed] | Custom pricing; contact sales |

---

### Gemini — Google
**Source:** https://gemini.google.com/advanced | **Last verified:** 2026-05-07

| Plan | Price (USD/user/month) | Notes |
|------|------------------------|-------|
| Gemini Advanced (Google One AI Premium) | $20.00 | Includes 2TB storage |
| Gemini for Google Workspace | [unconfirmed] | Add-on; pricing varies by Workspace tier |

> Billing caveat: $20/month bundles non-AI features. Flag as mixed-use subscription in audit output.

---

### Windsurf — Codeium
**Source:** https://windsurf.com/pricing | **Last verified:** 2026-05-07

| Plan | Price (USD/user/month) | Notes |
|------|------------------------|-------|
| Free | $0.00 | Limited AI flows |
| Pro | $20.00 | Unlimited flows, faster models |
| Teams | $40.00 | Centralized billing, team admin |

---

### Perplexity AI
**Source:** https://www.perplexity.ai/pro | **Last verified:** 2026-05-07

| Plan | Price (USD/user/month) | Notes |
|------|------------------------|-------|
| Free | $0.00 | Limited Pro searches |
| Pro | $17.00 | Unlimited Pro searches, file uploads, ~$5 API credit |
| Enterprise | [unconfirmed] | Contact sales; SSO and audit features |

---

## API Pricing (Token-Based)

> Do not hardcode token rates. Pull from vendor pricing pages at calculation time.

| Provider | Reference |
|----------|-----------|
| Anthropic API | https://anthropic.com/api |
| OpenAI API | https://openai.com/api/pricing |
| Google Gemini API | https://ai.google.dev/pricing |
| Perplexity API | https://docs.perplexity.ai/docs/pricing |

---

## Unsupported Edge Cases

| Scenario | Reason |
|----------|--------|
| Annual prepay discounts | Requires contract-level data |
| Enterprise / negotiated pricing | Not publicly listed |
| Educational / nonprofit discounts | Non-standard; requires manual input |
| Mixed-bundle products (e.g., Google One) | Non-AI costs cannot be cleanly separated |
| API overage / burst pricing | Requires real-time consumption data |

Flag these as `requires_manual_review` in audit output.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-07 | Initial version; all prices verified against official vendor pages |