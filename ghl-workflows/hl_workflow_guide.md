# GoHighLevel Workflow Setup — BOSS Copy
## Simplified Access Guide (Buyers Go Direct to App)

> **Key principle:** The GoHighLevel membership course is a **silent backend gate only**.
> Buyers never see the membership portal, never receive a portal login email, and never need to interact with GoHighLevel directly.
> All access is granted and revoked automatically via workflows. The buyer's only touchpoint is the BOSS Copy app URL.

---

## How This Works

```
Buyer purchases (Stripe/GHL checkout)
        ↓
GHL workflow triggers automatically
        ↓
Membership course access GRANTED silently (backend only)
        ↓
Buyer receives confirmation email with direct app link
        ↓
Buyer goes to: https://bosscopy.kabooyaaassistant.ai
        ↓
Buyer logs in with their Manus account (NOT a GHL portal login)
        ↓
Access confirmed — buyer uses the app
```

**On cancellation:**
```
Subscription cancelled (Stripe/GHL)
        ↓
GHL workflow triggers automatically
        ↓
Membership course access REVOKED silently (backend only)
        ↓
Buyer receives cancellation email with resubscribe link
        ↓
No portal interaction required at any point
```

---

## The 4 Workflows You Need

| # | Workflow Name | Trigger | Action |
|---|---|---|---|
| 1 | Buy Pro | New Pro subscription (Monthly OR Annual) | Grant access + send confirmation |
| 2 | Buy Platinum | New Platinum subscription (Monthly OR Annual) | Grant access + send confirmation |
| 3 | Cancel Pro | Pro subscription cancelled/expired | Revoke access + send cancellation |
| 4 | Cancel Platinum | Platinum subscription cancelled/expired | Revoke access + send cancellation |

> **OR trigger logic:** Each workflow uses a single trigger with OR conditions for Monthly and Annual products.
> This means 4 workflows total — not 8. Monthly and Annual are handled in the same workflow.

---

## Step 1 — Create the Silent Membership Course

Before building workflows, create the membership course that acts as the access gate.

**Settings:**
- **Name:** BOSS Copy Access (internal name — buyers never see this)
- **Visibility:** Private
- **Portal access:** Disabled — do NOT send portal login emails
- **Content:** Empty or placeholder — buyers never access this course directly
- **Purpose:** Purely a backend flag that grants/revokes app access via webhook

> **Why a membership course?** GoHighLevel's membership system provides the cleanest way to
> trigger the BOSS Copy app webhook with a grant/revoke signal. The course itself is irrelevant —
> it's the trigger mechanism, not the product.

---

## Step 2 — Buy Pro Workflow

**Trigger:** Product purchased
- Product 1: BOSS Copy Pro Monthly ← OR
- Product 2: BOSS Copy Pro Annual

**Actions (in order):**

### Action 1 — Add Tag
```
Tag: boss-copy-pro-active
```
*This tag identifies active Pro subscribers for segmentation and future automations.*

### Action 2 — Remove Tag (cleanup)
```
Tag: boss-copy-pro-cancelled
```
*Removes the cancelled tag in case this is a resubscribe.*

### Action 3 — Grant Membership Course Access
```
Course: BOSS Copy Access
Action: Grant
Send portal email: NO (critical — do not enable this)
```

### Action 4 — Send Webhook (to BOSS Copy app)
```
URL: https://bosscopy.kabooyaaassistant.ai/api/webhooks/ghl
Method: POST
Content-Type: application/json

Body:
{
  "event": "subscription.activated",
  "plan": "pro",
  "contact_id": "{{contact.id}}",
  "email": "{{contact.email}}",
  "first_name": "{{contact.first_name}}",
  "timestamp": "{{now}}"
}

Headers:
x-webhook-secret: [YOUR_WEBHOOK_SECRET]
```

### Action 5 — Send Confirmation Email
```
Subject: You're in — here's your BOSS Copy access link
From: [Your Name] <hello@kabooyaaassistant.ai>

Body:
Hi {{contact.first_name}},

You're all set.

Your BOSS Copy Pro access is live. Go here to log in and start generating copy:

👉 https://bosscopy.kabooyaaassistant.ai

Log in with your Manus account (the email you used to purchase).

If you have any questions, reply to this email and I'll get back to you personally.

[Your Name]
KABOOYAA | kabooyaaassistant.ai
```

---

## Step 3 — Buy Platinum Workflow

**Trigger:** Product purchased
- Product 1: BOSS Copy Platinum Monthly ← OR
- Product 2: BOSS Copy Platinum Annual

**Actions (in order):**

### Action 1 — Add Tag
```
Tag: boss-copy-platinum-active
```

### Action 2 — Remove Tag (cleanup)
```
Tag: boss-copy-platinum-cancelled
```

### Action 3 — Grant Membership Course Access
```
Course: BOSS Copy Access
Action: Grant
Send portal email: NO
```

### Action 4 — Send Webhook
```
URL: https://bosscopy.kabooyaaassistant.ai/api/webhooks/ghl
Method: POST
Content-Type: application/json

Body:
{
  "event": "subscription.activated",
  "plan": "platinum",
  "contact_id": "{{contact.id}}",
  "email": "{{contact.email}}",
  "first_name": "{{contact.first_name}}",
  "timestamp": "{{now}}"
}

Headers:
x-webhook-secret: [YOUR_WEBHOOK_SECRET]
```

### Action 5 — Send Confirmation Email
```
Subject: You're in — BOSS Copy Platinum is live for you
From: [Your Name] <hello@kabooyaaassistant.ai>

Body:
Hi {{contact.first_name}},

You're all set.

Your BOSS Copy Platinum access is live — that includes all 8 copy formats AND the AI Image Generator.

Go here to log in:

👉 https://bosscopy.kabooyaaassistant.ai

Log in with your Manus account (the email you used to purchase).

If you have any questions, reply to this email.

[Your Name]
KABOOYAA | kabooyaaassistant.ai
```

---

## Step 4 — Cancel Pro Workflow

**Trigger:** Subscription cancelled or payment failed
- Product 1: BOSS Copy Pro Monthly ← OR
- Product 2: BOSS Copy Pro Annual

**Actions (in order):**

### Action 1 — Remove Tag
```
Tag: boss-copy-pro-active
```

### Action 2 — Add Tag
```
Tag: boss-copy-pro-cancelled
```

### Action 3 — Revoke Membership Course Access
```
Course: BOSS Copy Access
Action: Revoke
Send portal email: NO
```

### Action 4 — Send Webhook
```
URL: https://bosscopy.kabooyaaassistant.ai/api/webhooks/ghl
Method: POST
Content-Type: application/json

Body:
{
  "event": "subscription.cancelled",
  "plan": "pro",
  "contact_id": "{{contact.id}}",
  "email": "{{contact.email}}",
  "first_name": "{{contact.first_name}}",
  "timestamp": "{{now}}"
}

Headers:
x-webhook-secret: [YOUR_WEBHOOK_SECRET]
```

### Action 5 — Send Cancellation Email
```
Subject: Your BOSS Copy access has ended
From: [Your Name] <hello@kabooyaaassistant.ai>

Body:
Hi {{contact.first_name}},

Your BOSS Copy Pro subscription has ended and your access has been removed.

If you'd like to resubscribe, you can do that here:
👉 https://kabooyaaassistant.ai/check-out-boss-copy

If you cancelled by mistake or have any questions, reply to this email.

[Your Name]
KABOOYAA | kabooyaaassistant.ai
```

---

## Step 5 — Cancel Platinum Workflow

**Trigger:** Subscription cancelled or payment failed
- Product 1: BOSS Copy Platinum Monthly ← OR
- Product 2: BOSS Copy Platinum Annual

**Actions:** Same structure as Cancel Pro — replace "pro" with "platinum" in tags, webhook body, and resubscribe link.

```
Resubscribe link: https://kabooyaaassistant.ai/check-out-boss-copy-platinum
Webhook plan field: "platinum"
Tags: boss-copy-platinum-active / boss-copy-platinum-cancelled
```

---

## Quick Reference

| Item | Value |
|---|---|
| BOSS Copy App URL | https://bosscopy.kabooyaaassistant.ai |
| Pro Checkout URL | https://kabooyaaassistant.ai/check-out-boss-copy |
| Platinum Checkout URL | https://kabooyaaassistant.ai/check-out-boss-copy-platinum |
| Webhook Endpoint | https://bosscopy.kabooyaaassistant.ai/api/webhooks/ghl |
| Webhook Secret Header | x-webhook-secret |
| Active Pro Tag | boss-copy-pro-active |
| Active Platinum Tag | boss-copy-platinum-active |
| Cancelled Pro Tag | boss-copy-pro-cancelled |
| Cancelled Platinum Tag | boss-copy-platinum-cancelled |
| Membership Course Name | BOSS Copy Access |
| Portal Email | NEVER send — always disabled |

---

## Critical Reminders

1. **Never enable portal login emails** on any membership grant/revoke action. This is the most common mistake and will confuse buyers.
2. **The webhook secret** must match exactly between GoHighLevel and the BOSS Copy app server configuration.
3. **OR triggers** — always use OR logic between Monthly and Annual products in the same workflow. Do not create separate workflows for each billing period.
4. **Resubscribe links** go to checkout pages, never to the membership portal.
5. **The membership course is invisible to buyers** — it is purely a backend mechanism.
