# BOSS Copy — Claude Code Agent Package
## Developer Setup Guide

This package contains the complete BOSS Copy agent system, ready to integrate with Claude Code.

---

## Directory Structure

```
boss_copy_claude_agent/
├── CLAUDE.md                    ← Master orchestrator — load this as the system prompt
├── README.md                    ← This file
├── agents/
│   ├── facebook_ad.md           ← Facebook Ad sub-agent
│   ├── google_ad.md             ← Google Ad sub-agent
│   ├── email.md                 ← Email copy sub-agent
│   ├── social_post.md           ← Organic social post sub-agent
│   ├── website_headline.md      ← Website headline sub-agent
│   ├── sms.md                   ← SMS campaign sub-agent
│   ├── video_script.md          ← Video script sub-agent
│   └── followup_sequence.md     ← Follow-up sequence sub-agent
├── examples/
│   └── copy_examples.md         ← Quality benchmark outputs for all 8 formats
└── assets/
    ├── facebook_posts_v2.md     ← 5 launch Facebook posts (campaign reference)
    ├── trade_email_sequence.md  ← 3-email trade database sequence (campaign reference)
    ├── heygen_script_v2.md      ← HeyGen video script (campaign reference)
    └── email_sequence.md        ← General database email sequence (campaign reference)
```

---

## Claude Code Integration

### Option 1 — Single Agent with Sub-Agent Routing (Recommended)

Load `CLAUDE.md` as the system prompt for your main Claude Code agent. The orchestrator handles format detection and routes to the appropriate sub-agent prompt automatically.

```bash
# In your Claude Code project root
cp CLAUDE.md .claude/system_prompt.md
```

The agent will:
1. Accept business details from the user
2. Identify the copy format required
3. Load the relevant sub-agent instructions
4. Apply the BOSS Copy process (Hook → Problem → Consequence → Solution → CTA)
5. Run the internal quality checklist before delivering output

### Option 2 — Dedicated Sub-Agents per Format

If your architecture uses separate Claude instances per copy format, load each sub-agent file as the system prompt for its dedicated agent. Each sub-agent file is self-contained and includes format specs, rules, and an example output.

```
facebook_ad_agent    → system prompt: agents/facebook_ad.md
google_ad_agent      → system prompt: agents/google_ad.md
email_agent          → system prompt: agents/email.md
social_post_agent    → system prompt: agents/social_post.md
headline_agent       → system prompt: agents/website_headline.md
sms_agent            → system prompt: agents/sms.md
video_agent          → system prompt: agents/video_script.md
followup_agent       → system prompt: agents/followup_sequence.md
```

---

## Input Schema

Pass business context to the agent in this format for best results:

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

All fields except `business_name` and `offer` are required for quality output. If fields are missing, the agent will ask before generating.

---

## Quality Standard

Every output is benchmarked against the examples in `examples/copy_examples.md`. The agent runs an internal 7-point checklist before delivering copy. If your integration allows, surface the checklist result to the user so they understand why the copy is structured the way it is.

---

## Live Product Reference

BOSS Copy is live at: **https://bosscopy.kabooyaaassistant.ai**

Pro Plan: All 8 copy formats, unlimited generation
Platinum Plan: Pro + AI Image Generator

Built using the BOSS AI Agent System — kabooyaaassistant.ai
