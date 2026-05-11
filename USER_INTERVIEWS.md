# USER_INTERVIEWS.md

Three conversations conducted between May 9–11, 2026 with people in my network who use or work around AI tools professionally.

---

## Interview 1 — P.V. Sai Deepak, Software Developer, Early-stage startup

**Background:** Recent graduate from my college (ANITS), placed at a tech company at 17 LPA. Has hands-on experience using AI APIs in production.

**How we connected:** LinkedIn DM. He responded within minutes and was willing to talk.

**Direct quotes:**

> "We ran into a serious issue. We were using the Opus model and due to a bug in the code, the API kept getting called continuously without us noticing. Since the output was still being generated correctly, we didn't realize anything was wrong at first."

> "That one small issue ended up charging us nearly $400 in just two hours."

> "A single unnoticed bug or runaway API loop can burn through hundreds of dollars within hours. Teams need a way to monitor usage, detect abnormal API activity, set spending limits, and receive instant alerts before costs spiral out of control."

> "If you can build something that solves this kind of problem, people will absolutely pay for your app."

**Most surprising thing he said:** I expected him to say the tool would be useful for comparing plans. What I did not expect was the $400 in two hours story. The problem is not just "am I on the right plan" — it is "is my API usage even behaving normally right now?" That is a completely different and more urgent problem than what I had originally designed for.

**What it changed about my design:** After this conversation I added the concept of "abnormal spend detection" to my Week 2 roadmap. The current tool audits historical spend. The next version should flag when real-time spend is accelerating unusually. It also made me realize the real fear is not overpaying by $20/month — it is a $400 surprise charge in 2 hours that nobody saw coming.

---

## Interview 2 — Harsith Veera Charan Bheesetti, Developer, Student/Freelancer

**Background:** Final year student, uses AI tools for projects including GitHub Copilot and Figma AI features. Pays nothing personally — uses free tiers exclusively.

**How we connected:** LinkedIn. He was active and gave honest pushback.

**Direct quotes:**

> "I mean, if you need a good critic on that — is it simple to just ask ChatGPT to compare benchmarks and get an AI tool for my use case?"

> "People don't care if an AI tool is marginally better than the other. They mostly go towards the preferred one and that data can be obtained from a single ChatGPT prompt."

> "The thinking was good on the idea, but remember to check for simple alternatives because it will be difficult when you try to provide your idea as a solution."

> "It will be better if you frame your idea as a platform that not only provides tool suggestions, but also a pipeline or workflow where the role or task of the tools is also provided, so the user can get a clear cut idea on how to work out their project."

**Most surprising thing he said:** He directly challenged whether my tool does anything ChatGPT can't already do in one prompt. That is the strongest possible objection and I had not thought about it seriously before this conversation. It forced me to articulate the real differentiation: current pricing data with source URLs, dollar-specific recommendations, and a shareable report — not general advice, but a specific audit with numbers attached.

**What it changed about my design:** I added the "Sources cited in PRICING_DATA.md" requirement more seriously after this. If someone can verify that my numbers come from the actual vendor pricing pages checked this week, that is something a ChatGPT prompt cannot reliably give. The tool's credibility depends on the pricing data being trustworthy and verifiable.

---

## Interview 3 — Omkar Palika, Developer, Early career

**Background:** Developer who uses multiple AI tools based on project type — including Antigravity, Google AI Studio, and other tools for prototyping and UI work. Uses free versions exclusively.

**How we connected:** LinkedIn. Shorter conversation but gave useful signal.

**Direct quotes:**

> "Based on the work type, I usually use different AI tools."

> "Free versions usually satisfy my work needs."

> "I sometimes feel limited, but I usually search for better alternatives and use them together."

> "If there was a platform that compared AI tools, tracked new alternative updates, and suggested better or cheaper options based on my needs — yes, I would personally use that."

> "If I was using paid versions, I would obviously use your project."

**Most surprising thing he said:** He uses multiple tools simultaneously and switches between them based on task type — not because he has compared them systematically, but because he has just discovered through trial and error what works for what. He has no framework for deciding. This confirmed that the problem is real even for technically sophisticated users — nobody sits down and audits their AI tool decisions.

**What it changed about my design:** The "primary use case" field in the form became more important after this conversation. Omkar's workflow — different tools for different tasks — is common. The audit engine needs to catch cases where someone is paying for a general tool when a specialized one would be cheaper, and vice versa. His response also confirmed the product positioning: the tool is not just for companies overspending. It is also for individuals and small teams who have never thought carefully about whether their current stack is optimal.