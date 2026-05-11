# ECONOMICS.md — Unit Economics

## What a Converted Lead is Worth to Credex

Credex sells discounted AI infrastructure credits. Based on publicly available information about AI tool pricing:

- A startup spending $500/mo on AI tools spends $6,000/year
- Credex offers 20–40% discounts, so potential credit purchase = $1,200–$2,400/year
- If Credex takes a 15–20% margin on credits sold, revenue per customer = **$180–$480/year**
- A customer who renews for 2 years = **$360–$960 LTV**

Conservative estimate: **$300 LTV per converted Credex customer**
Optimistic estimate: **$800 LTV per converted Credex customer** (larger team, higher spend)

I will use **$400 average LTV** for calculations below.

## Customer Acquisition Cost (CAC) by Channel

| Channel | Estimated CAC | Notes |
|---------|--------------|-------|
| Show HN / Hacker News | ~$0 | Organic; time cost only |
| Reddit organic posts | ~$0 | Organic; time cost only |
| Credex existing pipeline (warm) | ~$20 | Sales team time to send link |
| LinkedIn outreach | ~$15 | Time cost of DMs |
| Paid Twitter/X ads (if added later) | ~$80–150 | Estimated CPL for B2B SaaS |

For the first 6 months: **blended CAC ≈ $10–25** (mostly organic)

## Conversion Funnel

```
Landing page visitor
        ↓ (est. 60% start the form)
Audit completed
        ↓ (est. 30% submit email)
Lead captured
        ↓ (est. 15% of high-savings leads book consultation)
Credex consultation booked
        ↓ (est. 40% of consultations convert to credit purchase)
Credit purchase = Revenue
```

**Overall conversion: visitor → revenue ≈ 1.1%**

At 1,000 monthly visitors:
- 600 start audit
- 180 submit email
- 27 high-savings leads book consultation (assuming 50% of leads show >$500 savings)
- ~11 credit purchases per month
- Revenue: 11 × $400 LTV = **$4,400/month from 1,000 visitors**

## What Makes This Profitable

CAC of $25, LTV of $400 = **LTV:CAC ratio of 16:1**

This is excellent for B2B SaaS (industry standard is 3:1 minimum). The tool is free, so there is no product cost barrier. The main costs are:

- Hosting (Vercel free tier → ~$20/mo at scale)
- Supabase (free tier → ~$25/mo at scale)
- OpenRouter API for summaries (~$0.001 per audit = negligible)
- Resend emails (~$0.001 per email = negligible)

**At 1,000 audits/month, infrastructure cost ≈ $50/month**

## What Would Have to Be True for $1M ARR in 18 Months

$1M ARR = $83,333/month in credit sales revenue to Credex

Working backwards:
- At $400 LTV and 18-month horizon: need ~208 new paying customers/month by month 18
- At 40% consultation-to-purchase rate: need 520 consultations/month
- At 15% lead-to-consultation rate: need 3,467 leads/month
- At 30% audit-to-lead rate: need 11,556 audits/month
- At 60% visitor-to-audit rate: need **~19,000 monthly visitors by month 18**

19,000 monthly visitors in 18 months is achievable if:
1. Show HN drives initial 2,000–5,000 visits in month 1
2. SEO compounds from "AI tool comparison" content (3–6 month lag)
3. Shareable audit URLs create viral loop (each shared report = free distribution)
4. Credex sales team sends link to their existing warm leads pipeline

This is not guaranteed, but it is not fantasy math either. The viral loop is the key variable — if shared audit URLs drive even 0.5 new audits per share, growth compounds.

## Key Risk

The biggest risk is that the audit logic becomes stale. AI tool pricing changes frequently. If Cursor drops their price or Claude adds a new tier and the engine doesn't update, the recommendations become wrong and trust erodes. Mitigation: monthly pricing verification process (already documented in PRICING_DATA.md).