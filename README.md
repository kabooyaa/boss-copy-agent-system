# BOSS Copy — AI Copywriting Agent System

> **Built using the BOSS AI Agent System** — an AI infrastructure framework for business automation.
> This repository contains the complete BOSS Copy product: the Claude Code agent system, all 8 copy format sub-agents, the full launch campaign, and GoHighLevel workflow documentation.

---

## What Is BOSS Copy?

BOSS Copy is an AI-powered copywriting engine built specifically for **trade businesses and small-to-medium businesses**. It generates professional, conversion-focused marketing copy — Facebook ads, Google ads, emails, social posts, website headlines, SMS campaigns, video scripts, and follow-up sequences — in under 60 seconds.

The product is live at: **https://bosscopy.kabooyaaassistant.ai**

### The Origin Story

BOSS Copy was built *using* the BOSS AI Agent System — the same AI infrastructure framework sold by [KABOOYAA](https://kabooyaaassistant.ai). This makes BOSS Copy a proof-of-concept for the system itself: AI infrastructure building a commercial AI product.

---

## Repository Structure

```
boss-copy-agent-system/
│
├── README.md                          ← You are here
│
├── claude-agent/                      ← Claude Code agent system
│   ├── CLAUDE.md                      ← Master orchestrator (load as system prompt)
│   ├── README.md                      ← Developer integration guide
│   │
│   ├── agents/                        ← Sub-agent prompt files (one per copy format)
│   │   ├── facebook_ad.md             ← Facebook Ad copy agent
│   │   ├── google_ad.md               ← Google Search Ad copy agent
│   │   ├── email.md                   ← Email copy agent
│   │   ├── social_post.md             ← Organic social post agent
│   │   ├── website_headline.md        ← Website headline agent
│   │   ├── sms.md                     ← SMS campaign agent
│   │   ├── video_script.md            ← Video script agent
│   │   └── followup_sequence.md       ← Follow-up nurture sequence agent
│   │
│   └── examples/
│       └── copy_examples.md           ← Quality benchmark outputs for all 8 formats
│
├── campaign/                          ← Full BOSS Copy launch campaign assets
│   ├── facebook_posts_v2.md           ← 5 Facebook posts with image prompts
│   ├── trade_email_sequence.md        ← 3-email trade business database sequence
│   ├── heygen_script_v2.md            ← HeyGen video script (~2.5 min)
│   └── email_sequence.md             ← General database email sequence
│
├── ghl-workflows/                     ← GoHighLevel workflow documentation
│   └── hl_workflow_guide.md           ← Simplified HL setup — buyers go direct to app
│
└── docs/
    └── copy_process.md                ← The BOSS Copy process explained in full
```

---

## Quick Start for Developers

### Option 1 — Single Orchestrator Agent (Recommended)

Load `claude-agent/CLAUDE.md` as the system prompt for your Claude Code agent. The orchestrator detects the required copy format and applies the correct sub-agent rules automatically.

```bash
# Copy the master orchestrator to your Claude Code project
cp claude-agent/CLAUDE.md .claude/system_prompt.md
```

### Option 2 — Dedicated Sub-Agents per Format

Spin up a separate Claude instance for each copy format, each loaded with its own sub-agent file:

| Format | System Prompt File |
|---|---|
| Facebook Ad | `claude-agent/agents/facebook_ad.md` |
| Google Ad | `claude-agent/agents/google_ad.md` |
| Email | `claude-agent/agents/email.md` |
| Social Post | `claude-agent/agents/social_post.md` |
| Website Headline | `claude-agent/agents/website_headline.md` |
| SMS Campaign | `claude-agent/agents/sms.md` |
| Video Script | `claude-agent/agents/video_script.md` |
| Follow-Up Sequence | `claude-agent/agents/followup_sequence.md` |

### Input Schema

Pass business context to the agent in this JSON structure:

```json
{
  "business_type": "plumbing",
  "business_name": "Smith Plumbing Co",
  "location": "Brisbane",
  "target_customer": "homeowners with older properties",
  "core_service": "emergency callouts and blocked drains",
  "unique_angle": "60-minute response guarantee, no after-hours surcharge",
  "offer": "free callout this week",
  "copy_format": "facebook_ad",
  "platform": "Facebook",
  "tone": "direct and punchy"
}
```

---

## The BOSS Copy Process

Every piece of copy produced by this system follows a five-step structure:

1. **Hook** — Stop the scroll. Specific, provocative, or unexpected. Never start with the business name.
2. **Problem** — Agitate the pain. Make the cost of inaction real and specific.
3. **Consequence** — What happens if they don't act? One or two sentences maximum.
4. **Solution** — Introduce the business as the specific, credible answer.
5. **Call to Action** — One action only. Easy, low-risk, time-specific where possible.

See `docs/copy_process.md` for the full process documentation.

---

## Live Product

| Plan | Price | Includes |
|---|---|---|
| Pro | $97/month | All 8 copy formats, unlimited generation |
| Platinum | $147/month | Pro + AI Image Generator |
| Annual (Pro) | $970/year | Save 2 months |
| Annual (Platinum) | $1,470/year | Save 2 months |

**URL:** https://bosscopy.kabooyaaassistant.ai

---

## KABOOYAA 3-Day AI Build With You Workshop

Attendees who implement the BOSS AI Agent System at the **KABOOYAA 3-Day AI Build With You Workshop** (Hua Hin, April 2026) receive BOSS Copy included free as part of their package.

**Event info:** https://kabooyaaassistant.ai

---

## Built By

**KABOOYAA** — AI infrastructure for business automation.
Website: https://kabooyaaassistant.ai
BOSS Copy: https://bosscopy.kabooyaaassistant.ai
