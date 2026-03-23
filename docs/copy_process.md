# The BOSS Copy Process
## How Every Piece of Copy Is Structured

> This document explains the copywriting framework built into the BOSS Copy agent system.
> Every output — regardless of format — follows this five-step process.
> Understanding this process is essential for developers extending the system and for users who want to get the most from it.

---

## Why Process Matters More Than AI

Most AI copy tools produce generic output because they have no process. They take a prompt and generate words. The words might be grammatically correct, but they don't convert — because conversion-focused copy follows a specific psychological structure that generic AI doesn't know about unless it's been explicitly trained on it.

BOSS Copy is different because the process is baked in. The AI doesn't just write words — it follows a framework that mirrors how professional direct-response copywriters think.

---

## The Five-Step BOSS Copy Process

### Step 1 — The Hook

**Purpose:** Stop the scroll. Create an immediate reason to keep reading.

The hook is the most important line in any piece of copy. It appears as:
- The first line of a Facebook ad (visible before "See More")
- The subject line of an email
- The first 3 seconds of a video
- The H1 headline on a website
- The opening line of an SMS

**What makes a hook work:**
- It speaks to a specific fear, frustration, desire, or problem the reader already has
- It is unexpected or provocative — it breaks the pattern of what they expect to see
- It is specific — not vague or generic
- It creates a "gap" — the reader needs to keep reading to close it

**Hook formulas used in BOSS Copy:**

| Formula | Example |
|---|---|
| Name the fear | "Your switchboard is older than your kids. That's a problem." |
| Create urgency | "Burst pipe at midnight? We answer." |
| Challenge assumption | "Your competitors aren't better than you. They just sound like they are." |
| Name the pain | "You know what the most expensive thing in your business is right now?" |
| Specific consequence | "That drain's been slow for weeks, hasn't it." |
| Provocative question | "What does your Facebook ad say right now?" |

**What BOSS Copy never uses as a hook:**
- The business name
- "We are a local [trade] company..."
- "Looking for quality [service]?"
- Any sentence starting with "We"
- Generic claims without specifics

---

### Step 2 — The Problem

**Purpose:** Agitate the pain. Make the reader feel the cost of not acting.

After the hook creates curiosity or recognition, the problem section deepens the emotional engagement. It makes the reader feel that their situation is worse than they realised — or confirms a suspicion they already had.

**Key rules:**
- Be specific — use numbers, timeframes, or consequences
- Speak to the emotional experience, not just the practical problem
- Keep it short — 2–4 sentences maximum in most formats
- Connect the problem to something the reader cares about (money, safety, reputation, time)

**Example (electrician — switchboard):**
> "Old switchboards overheat, trip constantly, and in the worst cases — they start fires. Most homeowners don't know their switchboard is a risk until something goes wrong. By then, it's an emergency."

---

### Step 3 — The Consequence

**Purpose:** Escalate. What happens if they don't act?

This is the emotional peak before the solution. It answers the question: "So what?" It makes the cost of inaction tangible and specific.

**Key rules:**
- One or two sentences only — don't over-explain
- Make it concrete: a dollar amount, a safety risk, a missed opportunity, a competitive disadvantage
- Don't be melodramatic — be matter-of-fact. The consequence should feel inevitable, not exaggerated.

**Example (plumber — blocked drain):**
> "Left alone, a partial blockage becomes a full blockage. Full blockage becomes an emergency callout. Emergency callout becomes a bill you didn't plan for."

---

### Step 4 — The Solution

**Purpose:** Introduce the business as the specific, credible answer.

This is where the business appears — but only after the problem has been fully established. Introducing the solution too early kills the emotional momentum.

**Key rules:**
- Be specific about what they do, how they do it differently, and what the outcome is
- Avoid generic claims: "quality service", "competitive pricing", "experienced team" — these mean nothing
- Use specifics: timeframes, guarantees, numbers, locations, certifications
- The solution should feel like a relief — the exact answer to the problem just described

**Example (emergency plumber):**
> "We cover Brisbane 24/7 — no after-hours surcharge, no excuses, no waiting until morning while your ceiling comes down. Same-day callouts. Fixed pricing. 5-star rated."

---

### Step 5 — The Call to Action

**Purpose:** Tell them exactly what to do next.

The CTA is the most underestimated element in most small business copy. Weak CTAs lose jobs. Strong CTAs book them.

**Key rules:**
- One action only — never give two options
- Make it easy and low-risk: "free quote", "no obligation", "takes 2 minutes"
- Make it time-specific where possible: "this week", "before [month] ends", "we have 3 spots left"
- Tell them the outcome of the action, not just the action: "Call now and we'll be there in 60 minutes" not just "Call now"

**CTA formulas used in BOSS Copy:**

| Format | CTA Style |
|---|---|
| Facebook Ad | "Call now and we'll be there in 60 minutes or less. Guaranteed." |
| Email | "Reply here or call [number] and we'll chat." |
| SMS | "Reply YES and we'll lock you in." |
| Google Ad | "Book Before We're Fully Booked" |
| Website | "Book a Free Quote Today" |
| Video | "Go to [URL] right now. You'll have your first ad written before this video ends." |

---

## Tone and Voice Rules

These rules apply to every piece of copy in the system. They are enforced by the agent's internal quality checklist.

### Always

- Write like a real person talking to another real person
- Use short sentences — fragments are fine, they create rhythm
- Be specific — numbers, timeframes, locations, guarantees beat vague claims every time
- Write for one person, not a crowd — "you" not "business owners"
- Use the language of the trade — "job" not "project", "call out" not "service visit"
- Make the reader feel understood before making them an offer

### Never

- Use corporate language: "leverage", "solutions", "synergy", "world-class", "cutting-edge"
- Use passive voice: "quality workmanship is provided" → "we do the job right"
- Stack adjectives: "professional, reliable, affordable, experienced" — none of these mean anything alone
- Make claims without specifics: "the best in the business" → "5-star rated, 200+ reviews"
- End with a weak close: "feel free to contact us" → "call now and we'll be there today"

---

## Format-Specific Rules

Each copy format has additional rules layered on top of the core process. These are documented in the individual sub-agent files:

| Format | File | Key Constraint |
|---|---|---|
| Facebook Ad | `agents/facebook_ad.md` | First line visible before "See More" — must be the strongest line |
| Google Ad | `agents/google_ad.md` | 30-character headline limit — every word must earn its place |
| Email | `agents/email.md` | Subject line is the most important line — if it doesn't get opened, nothing else matters |
| Social Post | `agents/social_post.md` | Must feel personal, not promotional — tell a story |
| Website Headline | `agents/website_headline.md` | H1 must answer "what do you do and why should I care" in one line |
| SMS | `agents/sms.md` | 160-character limit — response rate is the metric, not open rate |
| Video Script | `agents/video_script.md` | Written to be spoken — short sentences, natural rhythm |
| Follow-Up Sequence | `agents/followup_sequence.md` | Each touch must stand alone — assume the previous touch was ignored |

---

## The Quality Checklist

Before delivering any copy, the BOSS Copy agent runs this internal checklist:

- [ ] Does the first line hook immediately — would a tradie stop scrolling?
- [ ] Is there a specific problem or pain point named?
- [ ] Is there a consequence if they don't act?
- [ ] Is the solution specific — not generic?
- [ ] Is there one clear call to action?
- [ ] Are there zero corporate buzzwords?
- [ ] Does it sound like a real person wrote it?
- [ ] Is it the right length for the format?

If any item fails, the copy is rewritten before delivery.

---

## Primary Target Audience

BOSS Copy is built primarily for **trade businesses** — the people who are brilliant at their trade but hate writing. This includes:

- Plumbers
- Electricians
- Builders and construction companies
- Landscapers and gardeners
- HVAC and air conditioning technicians
- Cleaners and cleaning services
- Mechanics and auto services
- Pest control
- Pool and spa services
- Any service-based business that relies on local customers

The system also works for any small-to-medium business that needs better marketing copy — but the language, examples, and default tone are calibrated for trade businesses first.

---

## What Makes Trade Business Copy Different

Trade business owners respond to copy that:

1. **Acknowledges the real problem** — not "you need better marketing" but "you're losing jobs to competitors who sound more professional than you"
2. **Speaks their language** — no corporate jargon, no marketing buzzwords
3. **Shows proof in specifics** — "60-minute response" beats "fast response"; "5-star rated with 200+ reviews" beats "highly recommended"
4. **Respects their time** — short, direct, no fluff
5. **Understands their world** — early starts, job sites, cash flow, word of mouth, seasonal demand

The BOSS Copy process is calibrated for this audience. Every default, every example, and every tone rule in the system reflects this understanding.
