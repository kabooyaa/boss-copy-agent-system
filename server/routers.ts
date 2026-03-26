import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  saveCopySession,
  updateCopySession,
  getCopySessionsByUser,
  getCopySessionById,
  deleteCopySession,
  getUserByOpenId,
  updateUser,
  getExternalApiKeyByHash,
  createExternalApiKey,
  getExternalApiKeysByUser,
  deleteExternalApiKey,
} from "./db";
import type { GeneratedCopy, BossFields } from "../drizzle/schema";

// ─── BOSS Field Generation ────────────────────────────────────────────────────
async function generateBossFieldsFromAI(
  businessDescription: string,
  targetAudience: string,
  apiKey?: string | null
): Promise<BossFields> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a world-class direct response copywriter trained on $7.8 billion in ROAS data. 
You generate BOSS formula fields based on business descriptions.

BOSS Formula Rules:
- Hero Number: A SPECIFIC number of real customers/users (e.g., "37 Tradies", "5,349 Women", "127 Plumbers"). Must be specific, not round numbers.
- Big Pain: The #1 emotional/practical pain the target audience faces. Be vivid and specific.
- Big Win: The concrete, measurable result they get. Include dollar amounts or percentages where possible.
- Timeframe: How quickly they see results (e.g., "14 Days", "3 Days", "First 30 Days").
- Enemy: Give the problem a NAME — the villain they're fighting (e.g., "The Admin Vortex", "Soul-Sucking 9-to-5", "The Lead-Leaking Bucket").

Return ONLY valid JSON matching this schema exactly.`,
      },
      {
        role: "user",
        content: `Business: ${businessDescription}\nTarget Audience: ${targetAudience}\n\nGenerate BOSS fields for this business.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "boss_fields",
        strict: true,
        schema: {
          type: "object",
          properties: {
            heroNumber: { type: "string" },
            bigPain: { type: "string" },
            bigWin: { type: "string" },
            timeframe: { type: "string" },
            enemy: { type: "string" },
          },
          required: ["heroNumber", "bigPain", "bigWin", "timeframe", "enemy"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === "string" ? content : JSON.stringify(content)) as BossFields;
}

// ─── Copy Generation ──────────────────────────────────────────────────────────
async function generateCopyFromAI(
  fields: BossFields,
  selectedFormats: string[],
  businessDescription: string,
  targetAudience: string,
  apiKey?: string | null
): Promise<GeneratedCopy> {
  const formatsStr = selectedFormats.join(", ");
  const needsBullets = selectedFormats.some(f => ["landingPage", "email", "salesReport"].includes(f));
  const needsFaq = selectedFormats.some(f => ["landingPage", "email"].includes(f));

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a world-class direct response copywriter trained on $7.8 billion in ROAS data (Sabri Suby / King Kong methodology).

BOSS Formula Rules:
1. EVERY headline MUST include a specific number, the big win, AND the timeframe
2. NEVER be generic or vague — "boiled rice" copy is forbidden
3. Use vivid pain agitation before showing the solution
4. Name the enemy — give the problem a villain name
5. Stack specific proof points (real numbers, not "many" or "countless")
6. Use direct response tone: bold, conversational, edgy — not corporate
7. For landing pages and emails: include 5-7 benefit bullet points (starting with action verbs)
8. For landing pages and emails: include 5 FAQ entries that address objections and build trust
9. Make it impossible to ignore
10. CRITICAL for email and SMS outputs ONLY: Use High Level CRM merge fields for personalisation:
    - First name: {{contact.first_name}}
    - Last name: {{contact.last_name}}
    - Full name: {{contact.full_name}}
    - Business name: {{contact.company_name}}
    - Phone: {{contact.phone}}
    - Email: {{contact.email}}
    - City: {{contact.city}}
    Example SMS: "Hey {{contact.first_name}}, your business {{contact.company_name}} could save..."
    Example email greeting: "Hi {{contact.first_name}},"
    Do NOT use merge fields in landing pages, social media, video scripts, ad copy, or any other format.

Generate copy for these formats: ${formatsStr}

Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: "user",
        content: `Business: ${businessDescription}
Target Audience: ${targetAudience}
Hero Number: ${fields.heroNumber}
Big Pain: ${fields.bigPain}
Big Win: ${fields.bigWin}
Timeframe: ${fields.timeframe}
Enemy: ${fields.enemy}
Selected Formats: ${formatsStr}

Generate the complete BOSS copy suite now.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generated_copy",
        strict: true,
        schema: {
          type: "object",
          properties: {
            headlines: {
              type: "array",
              description: "10 headline variants using BOSS formula",
              items: { type: "string" },
            },
            bodyStyles: {
              type: "object",
              properties: {
                drama: { type: "string" },
                logicProof: { type: "string" },
                coldDecision: { type: "string" },
              },
              required: ["drama", "logicProof", "coldDecision"],
              additionalProperties: false,
            },
            channels: {
              type: "object",
              properties: {
                sms: { type: "string" },
                email: { type: "string" },
                videoScript: { type: "string" },
                gmbPost: { type: "string" },
                socialMedia: { type: "string" },
                landingPage: { type: "string" },
                adCopy: { type: "string" },
                salesReport: { type: "string" },
              },
              required: ["sms", "email", "videoScript", "gmbPost", "socialMedia", "landingPage", "adCopy", "salesReport"],
              additionalProperties: false,
            },
            bulletPoints: {
              type: "array",
              description: "5-7 benefit bullet points starting with action verbs (for landing pages/emails)",
              items: { type: "string" },
            },
            faq: {
              type: "array",
              description: "5 FAQ entries addressing objections",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                },
                required: ["question", "answer"],
                additionalProperties: false,
              },
            },
          },
          required: ["headlines", "bodyStyles", "channels", "bulletPoints", "faq"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === "string" ? content : JSON.stringify(content)) as GeneratedCopy;
}

// ─── Improve Existing Copy ────────────────────────────────────────────────────
async function improveExistingCopyFromAI(
  existingCopy: string,
  copyType: string,
  businessDescription: string,
  targetAudience: string
): Promise<{ improved: string; changes: string[] }> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a world-class direct response copywriter trained on $7.8 billion in ROAS data (Sabri Suby / King Kong methodology).

Your job is to IMPROVE existing copy using the BOSS formula:
1. Add specific numbers (replace vague claims with real data)
2. Name the enemy (give the problem a villain name)
3. Amplify the pain before showing the solution
4. Make the win concrete and measurable
5. Add a timeframe for results
6. Remove all "boiled rice" generic language
7. Inject urgency and direct response tone
8. For landing pages/emails: ensure bullet points and FAQ are present
9. CRITICAL for email and SMS copy types ONLY: Use High Level CRM merge fields:
    - {{contact.first_name}}, {{contact.last_name}}, {{contact.full_name}}
    - {{contact.company_name}}, {{contact.phone}}, {{contact.email}}, {{contact.city}}
    Do NOT use merge fields in any other copy type.

Return the improved copy AND a list of specific changes made.`,
      },
      {
        role: "user",
        content: `Copy Type: ${copyType}
Business: ${businessDescription}
Target Audience: ${targetAudience}

EXISTING COPY TO IMPROVE:
${existingCopy}

Improve this copy using the BOSS formula. Return improved copy and list of changes made.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "improved_copy",
        strict: true,
        schema: {
          type: "object",
          properties: {
            improved: { type: "string", description: "The improved copy" },
            changes: {
              type: "array",
              description: "List of specific improvements made",
              items: { type: "string" },
            },
          },
          required: ["improved", "changes"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
}

// ─── Website Copy Analyser (Platinum) ───────────────────────────────────────
async function scrapeWebsiteText(url: string): Promise<string> {
  // Fetch the page HTML and extract readable text using cheerio
  const { load } = await import('cheerio');
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BOSSCopyBot/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  const html = await response.text();
  const $ = load(html);
  // Remove scripts, styles, nav, footer noise
  $('script, style, nav, footer, header, noscript, iframe, [aria-hidden="true"]').remove();
  // Extract meaningful text from main content areas
  const text = $('main, article, section, .content, #content, body')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000); // cap at 4000 chars to stay within LLM context
  if (!text || text.length < 50) throw new Error('Could not extract meaningful text from this URL. Try a different page.');
  return text;
}

async function analyseWebsiteCopyFromAI(
  websiteText: string,
  url: string
): Promise<{ summary: string; issues: string[]; improvements: { section: string; original: string; improved: string; reason: string }[] }> {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are a world-class direct response copywriter trained on $7.8 billion in ROAS data (Sabri Suby / King Kong methodology).

You analyse website copy and rewrite it using the BOSS formula:
- Hero Number: specific number of customers/results
- Big Pain: vivid, specific emotional pain
- Big Win: concrete measurable result
- Timeframe: how quickly they see results
- Enemy: give the problem a villain name

Rules:
1. Identify "boiled rice" copy — vague, generic, corporate-speak
2. Find missing proof points, missing pain agitation, missing specific numbers
3. Suggest concrete rewrites for each weak section
4. Be specific — show BEFORE and AFTER
5. Keep rewrites in the same voice/industry as the original

Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: 'user',
        content: `Website URL: ${url}\n\nWebsite Copy:\n${websiteText}\n\nAnalyse this copy and provide BOSS formula improvements.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'website_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Overall assessment of the copy quality (2-3 sentences)' },
            issues: {
              type: 'array',
              description: 'List of specific copy problems found',
              items: { type: 'string' },
            },
            improvements: {
              type: 'array',
              description: 'Specific section-by-section improvements',
              items: {
                type: 'object',
                properties: {
                  section: { type: 'string', description: 'Which section/element (e.g. Hero Headline, About Us, CTA)' },
                  original: { type: 'string', description: 'The original weak copy' },
                  improved: { type: 'string', description: 'The BOSS-formula rewrite' },
                  reason: { type: 'string', description: 'Why this is better' },
                },
                required: ['section', 'original', 'improved', 'reason'],
                additionalProperties: false,
              },
            },
          },
          required: ['summary', 'issues', 'improvements'],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
}

// ─── Competitor Analysis (Platinum) ─────────────────────────────────────────
async function analyseCompetitorCopyFromAI(
  websiteText: string,
  url: string,
  businessDescription: string
): Promise<{
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: { section: string; theirCopy: string; howToBeat: string; reason: string }[];
  battlePlan: string;
}> {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are a world-class direct response copywriter trained on $7.8 billion in ROAS data (Sabri Suby / King Kong methodology).

You analyse a COMPETITOR's website copy to identify how to beat them in the market.

Your job:
1. Identify what their copy does well (so we know what to match or exceed)
2. Find every weakness, vague claim, and missing proof point
3. For each weakness, write copy that BEATS their version using the BOSS formula
4. Provide a battle plan — the positioning angle that would dominate this competitor

BOSS Formula:
- Hero Number: specific number of customers/results
- Big Pain: vivid, specific emotional pain
- Big Win: concrete measurable result  
- Timeframe: how quickly they see results
- Enemy: give the problem a villain name

Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: 'user',
        content: `Competitor URL: ${url}\nMy Business: ${businessDescription}\n\nCompetitor Copy:\n${websiteText}\n\nAnalyse this competitor and show me how to beat their copy.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'competitor_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Overall assessment of competitor copy quality and positioning (2-3 sentences)' },
            strengths: { type: 'array', description: 'What their copy does well', items: { type: 'string' } },
            weaknesses: { type: 'array', description: 'Specific weaknesses in their copy', items: { type: 'string' } },
            opportunities: {
              type: 'array',
              description: 'Section-by-section opportunities to beat them',
              items: {
                type: 'object',
                properties: {
                  section: { type: 'string', description: 'Which section (e.g. Hero Headline, About Us, CTA)' },
                  theirCopy: { type: 'string', description: 'Their weak copy' },
                  howToBeat: { type: 'string', description: 'Your BOSS formula version that beats theirs' },
                  reason: { type: 'string', description: 'Why yours wins' },
                },
                required: ['section', 'theirCopy', 'howToBeat', 'reason'],
                additionalProperties: false,
              },
            },
            battlePlan: { type: 'string', description: 'The overall positioning angle and strategy to dominate this competitor (3-5 sentences)' },
          },
          required: ['summary', 'strengths', 'weaknesses', 'opportunities', 'battlePlan'],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
}

// ─── Full Website Copy Builder (Platinum) ────────────────────────────────────
interface WebsitePageCopy {
  pageName: string;
  heroHeadline: string;
  subheadline: string;
  bodyCopy: string;
  bulletPoints: string[];
  cta: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
}

async function buildFullWebsiteCopyFromAI(
  businessName: string,
  industry: string,
  services: string,
  usp: string,
  location: string,
  targetAudience: string,
  heroNumber: string,
  bigWin: string,
  timeframe: string,
  pages: string[]
): Promise<{ pages: WebsitePageCopy[]; bossFormula: { heroNumber: string; bigPain: string; bigWin: string; timeframe: string; enemy: string } }> {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are a world-class direct response copywriter trained on $7.8 billion in ROAS data (Sabri Suby / King Kong methodology).

You write COMPLETE website copy for every page of a business website using the BOSS formula.

BOSS Formula Rules:
- Hero Number: SPECIFIC number of customers (e.g. "347 Brisbane Plumbers") — use the provided number
- Big Pain: vivid, specific emotional pain the target audience faces
- Big Win: concrete measurable result — include dollar amounts or percentages
- Timeframe: how quickly they see results
- Enemy: give the problem a villain name

For each page:
1. Hero Headline: BOSS formula headline — specific number + big win + timeframe
2. Subheadline: Agitate the pain, hint at the solution
3. Body Copy: Drama Story style — name the enemy, agitate the pain, introduce the hero, show the win
4. Bullet Points: 5-7 specific benefit bullets with numbers
5. CTA: Direct, urgent, specific
6. SEO Meta Title and Description: keyword-optimised for local search

Do NOT write generic "We are a professional company" copy. Every sentence must earn its place.

Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: 'user',
        content: `Business Name: ${businessName}
Industry: ${industry}
Services: ${services}
Unique Selling Proposition: ${usp}
Location: ${location}
Target Audience: ${targetAudience}
Hero Number: ${heroNumber}
Big Win: ${bigWin}
Timeframe: ${timeframe}
Pages to write: ${pages.join(', ')}

Write complete BOSS formula copy for every page listed.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'website_copy',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            bossFormula: {
              type: 'object',
              properties: {
                heroNumber: { type: 'string' },
                bigPain: { type: 'string' },
                bigWin: { type: 'string' },
                timeframe: { type: 'string' },
                enemy: { type: 'string' },
              },
              required: ['heroNumber', 'bigPain', 'bigWin', 'timeframe', 'enemy'],
              additionalProperties: false,
            },
            pages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pageName: { type: 'string' },
                  heroHeadline: { type: 'string' },
                  subheadline: { type: 'string' },
                  bodyCopy: { type: 'string' },
                  bulletPoints: { type: 'array', items: { type: 'string' } },
                  cta: { type: 'string' },
                  seoMetaTitle: { type: 'string' },
                  seoMetaDescription: { type: 'string' },
                },
                required: ['pageName', 'heroHeadline', 'subheadline', 'bodyCopy', 'bulletPoints', 'cta', 'seoMetaTitle', 'seoMetaDescription'],
                additionalProperties: false,
              },
            },
          },
          required: ['bossFormula', 'pages'],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
}

// ─── Viral Post Generator (Platinum) ────────────────────────────────────────
async function generateViralPostFromAI(
  topic: string,
  authorityProof: string,
  linkUrl: string,
  platform: string,
  businessDescription: string,
  targetAudience: string
): Promise<{
  postBody: string;
  firstComment: string;
  engagementHooks: string[];
  platformVariants: { platform: string; postBody: string; firstComment: string }[];
}> {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are a world-class viral social media copywriter who has studied Austin Armstrong's S.T.A.R.T. framework and generated millions of organic impressions.

S.T.A.R.T. Framework Rules:
- S = STOP SCROLL: First 1-2 lines MUST be a pattern-interrupt hook that makes the thumb stop. Use bold claims, shocking stats, counterintuitive statements, or direct challenges. No emojis in the hook — raw power only.
- T = TALK ABOUT THE PROBLEM: Agitate the pain. Make the reader feel seen. Use "you" language. 2-4 sentences.
- A = ALIGN WITH AUDIENCE: Show you understand them. Share a relatable moment, a common mistake, or an "I used to think..." story. 2-3 sentences.
- R = RESOLVE THE PROBLEM: Introduce the solution/insight. Be specific. Give real value — not a teaser. 3-5 sentences.
- T = TELL THEM WHAT TO DO: Clear CTA — but NO LINKS in the post body. Direct them to the first comment for the link.

First Comment CTA Rules:
- The post body MUST end with something like: "Link in the first comment 👇" or "Drop a comment and I'll send it over" or "Check the first comment for the full [resource]"
- The first comment contains the actual link and a brief reinforcing statement
- This is the algorithm-friendly approach — links in captions suppress reach

Platform tone adjustments:
- Facebook: Conversational, story-driven, slightly longer, community feel
- LinkedIn: Professional authority, data-driven, thought leadership tone
- Instagram: Punchy, visual-language, shorter paragraphs, lifestyle angle

Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}
Authority Proof / Credibility: ${authorityProof}
Link URL: ${linkUrl}
Primary Platform: ${platform}
Business: ${businessDescription}
Target Audience: ${targetAudience}

Generate a viral S.T.A.R.T. post for ${platform}, then create variants for all 3 platforms (Facebook, LinkedIn, Instagram). Also provide 5 engagement hook alternatives for the opening line.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'viral_post',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            postBody: { type: 'string', description: 'Full post body using S.T.A.R.T. framework — NO link in body, ends with first comment CTA' },
            firstComment: { type: 'string', description: 'Ready-to-paste first comment with the link and reinforcing statement' },
            engagementHooks: {
              type: 'array',
              description: '5 alternative opening hook lines for A/B testing',
              items: { type: 'string' },
            },
            platformVariants: {
              type: 'array',
              description: 'Variants for all 3 platforms',
              items: {
                type: 'object',
                properties: {
                  platform: { type: 'string' },
                  postBody: { type: 'string' },
                  firstComment: { type: 'string' },
                },
                required: ['platform', 'postBody', 'firstComment'],
                additionalProperties: false,
              },
            },
          },
          required: ['postBody', 'firstComment', 'engagementHooks', 'platformVariants'],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
}

// ─── Feedback Rewrite ─────────────────────────────────────────────────────────
async function rewriteCopyWithFeedbackFromAI(
  originalCopy: string,
  feedback: string,
  format: string,
  businessDescription: string
): Promise<{ rewritten: string; changes: string[] }> {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are a world-class direct response copywriter trained on $7.8 billion in ROAS data (Sabri Suby / King Kong methodology).

You rewrite copy based on specific user feedback while maintaining the BOSS formula:
1. Apply EVERY piece of feedback the user gives — do not ignore any instruction
2. Keep what is working — only change what the feedback addresses
3. Maintain the BOSS formula: specific numbers, named enemy, pain agitation, big win, timeframe
4. Keep the same format and approximate length unless feedback says otherwise
5. CRITICAL for email and SMS formats ONLY: preserve High Level merge fields like {{contact.first_name}}
6. Do NOT use merge fields in any other format
7. List every specific change made

Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: 'user',
        content: `Format: ${format}\nBusiness: ${businessDescription}\n\nORIGINAL COPY:\n${originalCopy}\n\nUSER FEEDBACK:\n${feedback}\n\nRewrite the copy applying all feedback. Return the rewritten copy and list of changes made.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'rewritten_copy',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            rewritten: { type: 'string', description: 'The rewritten copy with all feedback applied' },
            changes: {
              type: 'array',
              description: 'List of specific changes made based on feedback',
              items: { type: 'string' },
            },
          },
          required: ['rewritten', 'changes'],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── User / Onboarding ──────────────────────────────────────────────────────
  user: router({
    // Get current user with onboarding status and plan
    me: protectedProcedure.query(async ({ ctx }) => {
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        onboardingComplete: ctx.user.onboardingComplete,
        hasApiKey: !!ctx.user.externalApiKey,
        plan: ctx.user.plan ?? 'pro', // 'pro' | 'platinum'
      };
    }),

    // Admin: set a user's plan (called by HL webhook or manually)
    setPlan: protectedProcedure
      .input(z.object({
        plan: z.enum(['pro', 'platinum']),
        targetUserId: z.number().optional(), // if omitted, updates self (for testing)
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can set another user's plan; users can only set their own (for testing)
        const targetId = (ctx.user.role === 'admin' && input.targetUserId)
          ? input.targetUserId
          : ctx.user.id;
        await updateUser(targetId, { plan: input.plan });
        return { success: true, plan: input.plan };
      }),

    // Save user's API key and mark onboarding complete
    saveApiKey: protectedProcedure
      .input(z.object({
        apiKey: z.string().min(10).max(500),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateUser(ctx.user.id, {
          externalApiKey: input.apiKey,
          onboardingComplete: 1,
        });
        return { success: true };
      }),

    // Skip onboarding (use platform default)
    skipOnboarding: protectedProcedure
      .mutation(async ({ ctx }) => {
        await updateUser(ctx.user.id, { onboardingComplete: 1 });
        return { success: true };
      }),

    // Remove API key (revert to platform default)
    removeApiKey: protectedProcedure
      .mutation(async ({ ctx }) => {
        await updateUser(ctx.user.id, { externalApiKey: null });
        return { success: true };
      }),
  }),

  // ─── Copy Generation ────────────────────────────────────────────────────────
  copy: router({
    generateBossFields: publicProcedure
      .input(z.object({
        businessDescription: z.string().min(10).max(2000),
        targetAudience: z.string().min(5).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        const apiKey = ctx.user?.externalApiKey;
        const fields = await generateBossFieldsFromAI(
          input.businessDescription,
          input.targetAudience,
          apiKey
        );
        return { fields };
      }),

    generateCopy: publicProcedure
      .input(z.object({
        businessDescription: z.string().min(10).max(2000),
        targetAudience: z.string().min(5).max(1000),
        heroNumber: z.string().min(1).max(255),
        bigPain: z.string().min(5).max(1000),
        bigWin: z.string().min(5).max(1000),
        timeframe: z.string().min(1).max(255),
        enemy: z.string().min(1).max(255),
        selectedFormats: z.array(z.string()).min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const fields: BossFields = {
          heroNumber: input.heroNumber,
          bigPain: input.bigPain,
          bigWin: input.bigWin,
          timeframe: input.timeframe,
          enemy: input.enemy,
        };

        const apiKey = ctx.user?.externalApiKey;
        const generatedCopy = await generateCopyFromAI(
          fields,
          input.selectedFormats,
          input.businessDescription,
          input.targetAudience,
          apiKey
        );

        let sessionId: number | undefined;
        if (ctx.user) {
          sessionId = await saveCopySession({
            userId: ctx.user.id,
            businessDescription: input.businessDescription,
            targetAudience: input.targetAudience,
            heroNumber: input.heroNumber,
            bigPain: input.bigPain,
            bigWin: input.bigWin,
            timeframe: input.timeframe,
            enemy: input.enemy,
            selectedFormats: input.selectedFormats,
            generatedCopy,
            source: "app",
          });
        }

        return { generatedCopy, sessionId };
      }),

    // Improve existing copy
    improveCopy: protectedProcedure
      .input(z.object({
        existingCopy: z.string().min(10).max(5000),
        copyType: z.enum(["headline", "landingPage", "email", "sms", "videoScript", "adCopy", "socialMedia", "other"]),
        businessDescription: z.string().min(10).max(2000),
        targetAudience: z.string().min(5).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await improveExistingCopyFromAI(
          input.existingCopy,
          input.copyType,
          input.businessDescription,
          input.targetAudience
        );
        return result;
      }),

    updateSessionName: protectedProcedure
      .input(z.object({ sessionId: z.number(), name: z.string().max(255) }))
      .mutation(async ({ input, ctx }) => {
        const session = await getCopySessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");
        await updateCopySession(input.sessionId, { sessionName: input.name });
        return { success: true };
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getCopySessionsByUser(ctx.user.id);
    }),

    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input, ctx }) => {
        const session = await getCopySessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");
        return session;
      }),

    deleteSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const session = await getCopySessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");
        await deleteCopySession(input.sessionId);
        return { success: true };
      }),

    // ── Website Copy Analyser (Platinum only) ──────────────────────────────
    analyseWebsite: protectedProcedure
      .input(z.object({
        url: z.string().url('Please enter a valid URL including https://'),
      }))
      .mutation(async ({ input, ctx }) => {
        // Gate: Platinum only
        if (ctx.user.plan !== 'platinum') {
          throw new Error('Website Copy Analyser is available on BOSS Copy Platinum only. Please upgrade to access this feature.');
        }
        const websiteText = await scrapeWebsiteText(input.url);
        const analysis = await analyseWebsiteCopyFromAI(websiteText, input.url);
        // Save to history
        await saveCopySession({
          userId: ctx.user.id,
          sessionName: `Website Analysis: ${new URL(input.url).hostname}`,
          businessDescription: `Website analysis of ${input.url}`,
          targetAudience: 'Website visitors',
          source: 'website_analyser',
          generatedCopy: { headlines: [analysis.summary], bodyStyles: { drama: '', logicProof: '', coldDecision: '' }, channels: {} },
        });
        return { analysis, scrapedText: websiteText };
      }),

    // ── Competitor Analysis (Platinum only) ────────────────────────────────
    analyseCompetitor: protectedProcedure
      .input(z.object({
        url: z.string().url('Please enter a valid URL including https://'),
        businessDescription: z.string().min(10).max(2000),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.plan !== 'platinum') {
          throw new Error('Competitor Analysis is available on BOSS Copy Platinum only. Please upgrade to access this feature.');
        }
        const websiteText = await scrapeWebsiteText(input.url);
        const analysis = await analyseCompetitorCopyFromAI(websiteText, input.url, input.businessDescription);
        // Save to history
        await saveCopySession({
          userId: ctx.user.id,
          sessionName: `Competitor Analysis: ${new URL(input.url).hostname}`,
          businessDescription: input.businessDescription,
          targetAudience: 'Competitor research',
          source: 'competitor_analyser',
          generatedCopy: { headlines: [analysis.summary], bodyStyles: { drama: analysis.battlePlan, logicProof: '', coldDecision: '' }, channels: {} },
        });
        return { analysis };
      }),

    // ── Full Website Copy Builder (Platinum only) ──────────────────────────
    buildWebsiteCopy: protectedProcedure
      .input(z.object({
        businessName: z.string().min(2).max(255),
        industry: z.string().min(2).max(255),
        services: z.string().min(10).max(2000),
        usp: z.string().min(5).max(1000),
        location: z.string().min(2).max(255),
        targetAudience: z.string().min(5).max(1000),
        heroNumber: z.string().min(1).max(255),
        bigWin: z.string().min(5).max(500),
        timeframe: z.string().min(1).max(100),
        pages: z.array(z.string()).min(1).max(10),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.plan !== 'platinum') {
          throw new Error('Full Website Copy Generator is available on BOSS Copy Platinum only. Please upgrade to access this feature.');
        }
        const result = await buildFullWebsiteCopyFromAI(
          input.businessName, input.industry, input.services,
          input.usp, input.location, input.targetAudience,
          input.heroNumber, input.bigWin, input.timeframe, input.pages
        );
        // Save to history
        const sessionId = await saveCopySession({
          userId: ctx.user.id,
          sessionName: `Website Copy: ${input.businessName}`,
          businessDescription: `${input.businessName} — ${input.industry} in ${input.location}. Services: ${input.services}`,
          targetAudience: input.targetAudience,
          heroNumber: input.heroNumber,
          bigWin: input.bigWin,
          timeframe: input.timeframe,
          enemy: result.bossFormula.enemy,
          bigPain: result.bossFormula.bigPain,
          selectedFormats: input.pages,
          source: 'website_builder',
          generatedCopy: {
            headlines: result.pages.map(p => `${p.pageName}: ${p.heroHeadline}`),
            bodyStyles: { drama: result.pages[0]?.bodyCopy ?? '', logicProof: '', coldDecision: '' },
            channels: {},
          },
        });
        return { ...result, sessionId };
      }),

    // ── Email Results (all plans) ──────────────────────────────────────────
    emailResults: protectedProcedure
      .input(z.object({
        subject: z.string().min(1).max(255),
        content: z.string().min(10).max(20000),
      }))
      .mutation(async ({ input, ctx }) => {
        const { notifyOwner } = await import('./_core/notification');
        // Send to the user via owner notification channel (routes to project owner's inbox)
        // In production this would use a transactional email service; for now we use the built-in notification
        const success = await notifyOwner({
          title: `📧 BOSS Copy Results: ${input.subject} — ${ctx.user.email ?? ctx.user.name}`,
          content: `User: ${ctx.user.name} (${ctx.user.email ?? 'no email'})\n\n${input.content}`,
        });
        return { success };
      }),

    // ── Feedback & Rewrite Loop (all plans) ────────────────────────────────
    rewriteWithFeedback: protectedProcedure
      .input(z.object({
        originalCopy: z.string().min(10).max(8000),
        feedback: z.string().min(5).max(2000),
        format: z.string().min(1).max(100),
        businessDescription: z.string().min(5).max(2000),
      }))
      .mutation(async ({ input }) => {
        const result = await rewriteCopyWithFeedbackFromAI(
          input.originalCopy,
          input.feedback,
          input.format,
          input.businessDescription
        );
        return result;
      }),

    // ── Viral Post Generator (Platinum only) ──────────────────────────────
    generateViralPost: protectedProcedure
      .input(z.object({
        topic: z.string().min(5).max(500),
        authorityProof: z.string().min(5).max(1000),
        linkUrl: z.string().url('Please enter a valid URL including https://'),
        platform: z.enum(['facebook', 'linkedin', 'instagram']),
        businessDescription: z.string().min(10).max(2000),
        targetAudience: z.string().min(5).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.plan !== 'platinum') {
          throw new Error('Viral Post Generator is available on BOSS Copy Platinum only. Please upgrade to access this feature.');
        }
        const result = await generateViralPostFromAI(
          input.topic,
          input.authorityProof,
          input.linkUrl,
          input.platform,
          input.businessDescription,
          input.targetAudience
        );
        // Save to history
        await saveCopySession({
          userId: ctx.user.id,
          sessionName: `Viral Post: ${input.topic.substring(0, 60)}`,
          businessDescription: input.businessDescription,
          targetAudience: input.targetAudience,
          source: 'viral_post_generator',
          generatedCopy: {
            headlines: result.engagementHooks,
            bodyStyles: { drama: result.postBody, logicProof: result.firstComment, coldDecision: '' },
            channels: {},
          },
        });
        return result;
      }),
  }),

  // ─── Open CLAW API Bridge Keys ──────────────────────────────────────────────
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getExternalApiKeysByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ label: z.string().max(255).optional() }))
      .mutation(async ({ input, ctx }) => {
        const rawKey = `bck_${randomBytes(24).toString("hex")}`;
        const keyHash = createHash("sha256").update(rawKey).digest("hex");
        const keyPrefix = rawKey.substring(0, 12);
        await createExternalApiKey({
          userId: ctx.user.id,
          keyHash,
          keyPrefix,
          label: input.label ?? "My API Key",
        });
        // Return the raw key ONCE — it cannot be retrieved again
        return { key: rawKey, keyPrefix, label: input.label ?? "My API Key" };
      }),

    delete: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteExternalApiKey(input.keyId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ── Image Generation (Platinum only) ────────────────────────────────────────────────
  image: router({
    generate: protectedProcedure
      .input(z.object({
        prompt: z.string().min(5).max(2000),
        refinementPrompt: z.string().max(1000).optional(),
        selectedSizes: z.array(z.string()).min(1).max(10),
        styleRefUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Gate: Platinum only
        if (ctx.user.plan !== 'platinum') {
          throw new Error('Image generation is available on BOSS Copy Platinum only. Please upgrade to access this feature.');
        }

        const { generateImage } = await import('./_core/imageGeneration');

        const fullPrompt = input.refinementPrompt
          ? `${input.prompt}. Additional refinement: ${input.refinementPrompt}`
          : input.prompt;

        // Generate one image per selected size by appending size context
        const SIZE_LABELS: Record<string, string> = {
          fb_post: 'Facebook Post (1200x628, landscape)',
          ig_square: 'Instagram Square (1080x1080)',
          ig_story: 'Instagram Story (1080x1920, vertical portrait)',
          reel: 'Reel / Short video thumbnail (1080x1920, vertical portrait)',
          ig_landscape: 'Instagram Landscape (1080x566)',
          fb_cover: 'Facebook Cover (1640x624, wide banner)',
        };

        const results = await Promise.all(
          input.selectedSizes.map(async (sizeId) => {
            const sizeLabel = SIZE_LABELS[sizeId] ?? sizeId;
            const sizePrompt = `${fullPrompt}. Format: ${sizeLabel}. Optimised for this exact aspect ratio.`;
            const originalImages = input.styleRefUrl
              ? [{ url: input.styleRefUrl, mimeType: 'image/jpeg' as const }]
              : undefined;
            const result = await generateImage({ prompt: sizePrompt, originalImages });
            return { sizeId, url: result.url ?? '' };
          })
        );

        return { images: results };
      }),
  }),
});

export type AppRouter = typeof appRouter;
