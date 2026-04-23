// ─────────────────────────────────────────────────────────────
//  Mobilions AI — Power-Up Definitions (40+)
// ─────────────────────────────────────────────────────────────

export const POWERUPS = [

  // ── CONTENT ────────────────────────────────────────────────
  {
    id: "seo-blog-post",
    name: "SEO Blog Post",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "📝",
    agentId: "luma",
    description: "Generate a fully structured, SEO-optimized blog post with headings, intro, body, and conclusion.",
    fields: [
      { id: "keyword", label: "Target Keyword", type: "text", placeholder: "e.g. best project management tools", required: true },
      { id: "topic", label: "Blog Topic / Title", type: "text", placeholder: "e.g. 10 Best Project Management Tools for Remote Teams", required: true },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. startup founders, small business owners", required: true },
      { id: "wordCount", label: "Word Count", type: "select", options: ["800 words", "1200 words", "1500 words", "2000 words"], defaultVal: "1200 words" },
      { id: "tone", label: "Tone", type: "select", options: ["Professional", "Conversational", "Educational", "Authoritative"], defaultVal: "Professional" },
      { id: "details", label: "Additional Context / Key Points", type: "textarea", placeholder: "Any specific points to cover, competitors to mention, or brand details…", required: false },
    ],
    buildPrompt: (f) => `Write a ${f.wordCount} SEO blog post on the topic: "${f.topic}".

Target keyword: "${f.keyword}"
Audience: ${f.audience}
Tone: ${f.tone}
${f.details ? `Additional context: ${f.details}` : ""}

Requirements:
1. Start with a compelling introduction that hooks the reader and naturally includes the target keyword in the first 100 words.
2. Use H2 and H3 subheadings (in Markdown) that include keyword variations.
3. Write in a ${f.tone.toLowerCase()} tone tailored to ${f.audience}.
4. Include actionable insights, examples, and data points where relevant.
5. Use short paragraphs (2–4 sentences max) for readability.
6. End with a strong conclusion that summarizes key takeaways and includes a CTA.
7. Naturally weave the keyword and related terms throughout — avoid keyword stuffing.
8. Aim for approximately ${f.wordCount}.

Output the full blog post in Markdown format.`,
  },

  {
    id: "landing-page-copy",
    name: "Landing Page Copy",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "🏠",
    agentId: "coda",
    description: "Write complete, conversion-focused landing page copy: hero, features, social proof, and CTA.",
    fields: [
      { id: "product", label: "Product / Service Name", type: "text", placeholder: "e.g. FlowDesk CRM", required: true },
      { id: "tagline", label: "Tagline (optional)", type: "text", placeholder: "e.g. The CRM built for freelancers", required: false },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. freelance designers and consultants", required: true },
      { id: "problem", label: "Core Problem You Solve", type: "textarea", placeholder: "What pain point does your product eliminate?", required: true },
      { id: "features", label: "Key Features / Benefits (one per line)", type: "textarea", placeholder: "Client pipeline tracking\nInvoice automation\nTime tracking", required: true },
      { id: "cta", label: "Primary CTA Text", type: "text", placeholder: "e.g. Start free trial, Book a demo", required: true },
    ],
    buildPrompt: (f) => `Write complete landing page copy for "${f.product}" — a product for ${f.audience}.

${f.tagline ? `Tagline: ${f.tagline}` : ""}
Core problem solved: ${f.problem}
Key features/benefits:
${f.features}
Primary CTA: "${f.cta}"

Write ALL of the following sections in order:

**HERO SECTION**
- Headline (bold, specific, benefit-driven — max 10 words)
- Sub-headline (1–2 sentences expanding on the value)
- CTA button: "${f.cta}"

**PAIN SECTION** (2–3 sentences describing the status quo frustration your audience feels)

**SOLUTION SECTION** (How ${f.product} changes everything — 2–3 sentences)

**FEATURES GRID** (For each feature listed, write: Feature Name, one-line benefit description)

**SOCIAL PROOF SECTION**
- 3 fictional but realistic testimonials (name, title/company, quote)

**FAQ SECTION** (5 questions and answers relevant to this product)

**FINAL CTA SECTION**
- Closing headline (urgency or outcome-focused)
- 1–2 sentence pitch
- CTA button: "${f.cta}"

Write in persuasive, benefit-focused copy style. Use Markdown for formatting.`,
  },

  {
    id: "youtube-script",
    name: "YouTube Video Script",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "🎬",
    agentId: "aria",
    description: "Full YouTube video script with hook, intro, body sections, and CTA outro.",
    fields: [
      { id: "topic", label: "Video Topic", type: "text", placeholder: "e.g. How to grow on LinkedIn in 2024", required: true },
      { id: "duration", label: "Estimated Duration", type: "select", options: ["5 minutes", "8 minutes", "10 minutes", "15 minutes"], defaultVal: "8 minutes" },
      { id: "style", label: "Presentation Style", type: "select", options: ["Educational / Tutorial", "Storytelling / Personal", "Listicle", "Review / Comparison"], defaultVal: "Educational / Tutorial" },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. small business owners new to LinkedIn", required: true },
      { id: "channel", label: "Channel Name / Niche (optional)", type: "text", placeholder: "e.g. The Marketing Lab — B2B growth tips", required: false },
    ],
    buildPrompt: (f) => `Write a complete YouTube video script for a ${f.duration} ${f.style} video.

Topic: "${f.topic}"
Target audience: ${f.audience}
${f.channel ? `Channel: ${f.channel}` : ""}

Script structure:

**HOOK (0:00–0:20)**
Write a 3–5 sentence hook that immediately grabs attention. Start with a bold statement, surprising fact, or relatable problem. End with "Here's exactly what you'll learn today…"

**INTRO (0:20–1:00)**
Brief introduction: who this is for, what they'll get, quick credibility builder.

**MAIN CONTENT**
Divide into clearly labeled sections (Section 1, Section 2, etc.) with timestamps appropriate for a ${f.duration} video. Write natural, conversational spoken dialogue — not bullet points. Include [B-ROLL] cues and [VISUAL] notes where relevant.

**TRANSITION LINES**
Include natural transition phrases between sections.

**OUTRO + CTA (last 30–45 seconds)**
Summarize key takeaways. Ask them to like, comment (with a specific question), and subscribe. Tease the next video topic.

Write in a ${f.style.toLowerCase()} style for ${f.audience}. Use natural spoken language, not written prose. Include [PAUSE], [EMPHASIZE], and [SCREEN SHARE] cues where useful.`,
  },

  {
    id: "product-description",
    name: "Product Description",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "🛍️",
    agentId: "zeno",
    description: "Write compelling product descriptions for eCommerce that convert browsers into buyers.",
    fields: [
      { id: "product", label: "Product Name", type: "text", placeholder: "e.g. Titanium Chef's Knife Set", required: true },
      { id: "platform", label: "Platform", type: "select", options: ["Shopify", "Amazon", "Etsy", "WooCommerce", "General"], defaultVal: "Shopify" },
      { id: "features", label: "Key Features / Specs", type: "textarea", placeholder: "List the key features, materials, dimensions…", required: true },
      { id: "audience", label: "Target Buyer", type: "text", placeholder: "e.g. home cooks who love cooking, professional chefs", required: true },
      { id: "price", label: "Price Point", type: "text", placeholder: "e.g. $89.99 — premium tier", required: false },
    ],
    buildPrompt: (f) => `Write a high-converting product description for "${f.product}" on ${f.platform}.

Target buyer: ${f.audience}
${f.price ? `Price: ${f.price}` : ""}
Key features/specs:
${f.features}

Deliver:

**HEADLINE** — Benefit-focused product title (for ${f.platform} listing)

**SHORT DESCRIPTION** (2–3 sentences) — Lead with the transformation/benefit, not features. Use sensory language. Make the buyer imagine owning it.

**BULLET POINTS** (5–7 bullets)
Format: ✓ [Feature] — [Specific Benefit / Why It Matters]
Focus on benefits, not just specs. Include the feature briefly, but lead with what it means for the buyer.

**LONG DESCRIPTION** (150–200 words)
Weave features, benefits, and the buyer's desired outcome into a narrative. Include social proof language ("loved by professionals", "rated 4.9 stars" etc.) and end with urgency or a closing line.

**TECHNICAL SPECS** (clean list of all specs/dimensions from the input)

Optimize for both search (include product keywords) and conversion (benefits-first language).`,
  },

  {
    id: "press-release",
    name: "Press Release",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "📰",
    agentId: "coda",
    description: "Write a professional, journalist-ready press release for any company news or announcement.",
    fields: [
      { id: "company", label: "Company Name", type: "text", placeholder: "e.g. Acme Corp", required: true },
      { id: "headline", label: "News Headline / Announcement", type: "text", placeholder: "e.g. Acme Corp Raises $5M Seed Round to Automate HR", required: true },
      { id: "details", label: "Key Details & Facts", type: "textarea", placeholder: "Who, what, when, where, why — quotes, stats, dates, context…", required: true },
      { id: "quote1", label: "Executive Quote (Name & Title)", type: "textarea", placeholder: "e.g. Jane Smith, CEO — what would she say about this news?", required: false },
      { id: "boilerplate", label: "Company Boilerplate (About Us)", type: "textarea", placeholder: "One paragraph describing the company for the end of the press release", required: false },
    ],
    buildPrompt: (f) => `Write a professional press release for ${f.company}.

Headline: ${f.headline}
Key details: ${f.details}
${f.quote1 ? `Executive quote context: ${f.quote1}` : ""}
${f.boilerplate ? `Company boilerplate: ${f.boilerplate}` : ""}

Format the press release with these exact sections:

FOR IMMEDIATE RELEASE

**[HEADLINE]** — Make it newsworthy, specific, and compelling. Max 12 words.

**[SUBHEADLINE]** — Expand on the headline with a key detail. 1 sentence.

[City, Date] — **DATELINE + LEAD PARAGRAPH** — Who, what, when, where, why in 2–3 sentences. The most important information first (inverted pyramid).

**BODY PARAGRAPHS** (2–3 paragraphs) — Provide context, background, supporting details, and the significance/impact of the news.

**QUOTE** — Compelling, newsworthy quote attributed to the executive. Make it sound human, not like marketing copy.

**SUPPORTING DETAILS** — Additional context, data points, or timeline.

**ABOUT ${f.company.toUpperCase()}**
${f.boilerplate || `[Boilerplate paragraph describing ${f.company}]`}

**MEDIA CONTACT**
[Contact Name]
[Title]
[Email] | [Phone]

###

Write in AP Style. Use active voice. Avoid jargon and superlatives unless attributing to a quote.`,
  },

  {
    id: "case-study",
    name: "Case Study",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "📊",
    agentId: "nexus",
    description: "Write a persuasive customer case study that showcases real results and builds trust.",
    fields: [
      { id: "customer", label: "Customer / Client Name", type: "text", placeholder: "e.g. BrightPath Marketing Agency", required: true },
      { id: "product", label: "Your Product / Service", type: "text", placeholder: "e.g. Our AI analytics platform", required: true },
      { id: "challenge", label: "Customer's Challenge / Problem", type: "textarea", placeholder: "What problem were they facing before?", required: true },
      { id: "solution", label: "Solution Implemented", type: "textarea", placeholder: "What did you do for them? What features/services were used?", required: true },
      { id: "results", label: "Results & Metrics", type: "textarea", placeholder: "e.g. 42% increase in leads, saved 10 hours/week, $30K revenue increase", required: true },
    ],
    buildPrompt: (f) => `Write a professional customer case study.

Customer: ${f.customer}
Product/Service: ${f.product}
Challenge: ${f.challenge}
Solution: ${f.solution}
Results: ${f.results}

Structure the case study as follows:

**HEADLINE** — Result-focused headline that leads with the outcome (e.g. "How [Customer] Achieved [Key Result] with [Product]")

**EXECUTIVE SUMMARY** (3–4 sentences) — Quick overview of who the customer is, the challenge, and the top result.

**ABOUT ${f.customer.toUpperCase()}** (2–3 sentences) — Brief company background, industry, size.

**THE CHALLENGE** — Tell the story of the problem. Include the business impact of NOT solving it. Use specific details. (2–3 paragraphs)

**THE SOLUTION** — How your product/service addressed the challenge. Be specific about implementation and features used. (2–3 paragraphs)

**THE RESULTS** — Lead with the headline metrics in a callout box format:
📈 [Metric 1]
💰 [Metric 2]
⏱️ [Metric 3]
Then explain the results in 2 paragraphs with context.

**CUSTOMER QUOTE** — A compelling, authentic-sounding testimonial quote from the customer.

**WHAT'S NEXT** — Brief closing on continued partnership or plans.

Write in a storytelling style that feels genuine, not like marketing brochure copy.`,
  },

  {
    id: "newsletter",
    name: "Email Newsletter",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "📬",
    agentId: "mailo",
    description: "Write a complete email newsletter that subscribers actually want to read.",
    fields: [
      { id: "brand", label: "Newsletter / Brand Name", type: "text", placeholder: "e.g. The Growth Letter", required: true },
      { id: "topic", label: "Main Topic or Theme for This Issue", type: "text", placeholder: "e.g. Why most marketing strategies fail + 3 fixes", required: true },
      { id: "audience", label: "Subscriber Audience", type: "text", placeholder: "e.g. SaaS founders and growth marketers", required: true },
      { id: "tone", label: "Newsletter Tone", type: "select", options: ["Conversational / Personal", "Professional / Authoritative", "Educational", "Witty / Casual"], defaultVal: "Conversational / Personal" },
      { id: "points", label: "Key Points / Content Notes", type: "textarea", placeholder: "Bullet the main ideas, insights, tips, or stories you want to include", required: true },
      { id: "cta", label: "Call-to-Action", type: "text", placeholder: "e.g. Check out our new guide, Book a demo, Reply with your thoughts", required: false },
    ],
    buildPrompt: (f) => `Write a complete email newsletter for "${f.brand}".

Audience: ${f.audience}
Main topic: ${f.topic}
Tone: ${f.tone}
Key content points:
${f.points}
${f.cta ? `CTA: ${f.cta}` : ""}

Write the full newsletter:

**SUBJECT LINE** — 5 options with varying approaches (curiosity, benefit, question, number, urgency)

**PREVIEW TEXT** — 5 matching preview text options (40–90 chars each)

**NEWSLETTER BODY:**

Opening (2–3 sentences) — Personal, warm opener that acknowledges the reader and teases the value inside. Sound like a real person, not a brand.

Main Content — Write the full body of the newsletter based on the key points. Use the ${f.tone.toLowerCase()} tone throughout. Format with short paragraphs, **bold key takeaways**, and clear hierarchy. Include pull quotes or callout boxes for key insights.

${f.cta ? `CTA Section — Natural transition into the CTA: "${f.cta}". Make it feel like a recommendation, not a sales push.` : ""}

Sign-off — Personal, warm closing. Name/persona of the sender.

P.S. Line — One powerful, memorable P.S. that adds a final insight or reinforces the CTA.

Keep paragraphs under 4 sentences. Write for ${f.audience} who read on mobile.`,
  },

  {
    id: "white-paper-outline",
    name: "White Paper Outline",
    category: "content",
    categoryLabel: "Content Writing",
    emoji: "📄",
    agentId: "nexus",
    description: "Create a detailed, authoritative white paper outline with executive summary and chapter structure.",
    fields: [
      { id: "topic", label: "White Paper Topic", type: "text", placeholder: "e.g. The Future of Remote Work: Challenges, Solutions, and Predictions", required: true },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. HR directors and Chief People Officers at enterprises", required: true },
      { id: "thesis", label: "Core Thesis / Argument", type: "textarea", placeholder: "What is the main position or insight this white paper argues?", required: true },
      { id: "company", label: "Publishing Company / Brand", type: "text", placeholder: "e.g. Mobilions AI Research", required: false },
    ],
    buildPrompt: (f) => `Create a detailed white paper outline for a professional B2B white paper.

Title topic: "${f.topic}"
Target audience: ${f.audience}
Core thesis: ${f.thesis}
${f.company ? `Publishing entity: ${f.company}` : ""}

Deliver the complete outline:

**TITLE OPTIONS** — 3 compelling white paper title options (authoritative, specific, outcome-focused)

**EXECUTIVE SUMMARY** (write a full 200-word draft of the executive summary)

**INTRODUCTION**
- Problem Statement
- Why Now / Market Context
- Purpose of This Paper

**CHAPTER 1: [Background / State of the Industry]**
- Section 1.1: [subsection]
- Section 1.2: [subsection]
- Key data points / research to include

**CHAPTER 2: [Core Challenge Analysis]**
- Section 2.1–2.3 with subsection titles and key content bullets for each

**CHAPTER 3: [Solution Framework / Methodology]**
- Section 3.1–3.3 with implementation detail bullets

**CHAPTER 4: [Case Studies / Evidence]**
- Structure for 2–3 case study examples

**CHAPTER 5: [Recommendations / Action Plan]**
- Strategic recommendations (3–5)
- Implementation roadmap

**CONCLUSION**
- Key takeaways
- Call to action for the reader

**APPENDIX SUGGESTIONS**
- Data tables, glossary, methodology notes

**RECOMMENDED VISUALS/CHARTS** — List 5 charts or visuals that would strengthen this white paper

Total estimated word count: 3,500–5,000 words
Estimated reading time: 15–20 minutes`,
  },

  // ── SOCIAL ─────────────────────────────────────────────────
  {
    id: "instagram-caption",
    name: "Instagram Caption",
    category: "social",
    categoryLabel: "Social Media",
    emoji: "📸",
    agentId: "aria",
    description: "Write scroll-stopping Instagram captions with hooks, story, and hashtags.",
    fields: [
      { id: "topic", label: "Post Topic / What You're Posting About", type: "text", placeholder: "e.g. New product launch, behind-the-scenes, motivational", required: true },
      { id: "brand", label: "Brand / Account Name", type: "text", placeholder: "e.g. @freshroastcoffee", required: false },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. coffee lovers aged 25–40", required: true },
      { id: "tone", label: "Caption Tone", type: "select", options: ["Inspirational", "Playful / Fun", "Professional", "Storytelling", "Educational", "Promotional"], defaultVal: "Playful / Fun" },
      { id: "cta", label: "Desired Action", type: "text", placeholder: "e.g. Visit link in bio, comment below, tag a friend", required: false },
      { id: "details", label: "Key Details / Context", type: "textarea", placeholder: "Any specific details, products, events, or messages to include", required: false },
    ],
    buildPrompt: (f) => `Write 5 different Instagram captions for ${f.brand || "a brand"}.

Post topic: ${f.topic}
Target audience: ${f.audience}
Tone: ${f.tone}
${f.cta ? `Desired action: ${f.cta}` : ""}
${f.details ? `Additional context: ${f.details}` : ""}

For each caption (numbered 1–5), provide:

**Hook line** — First sentence that stops the scroll (this appears before "more"). Make it punchy, curious, or emotional.

**Body** — The full caption story or message. Vary length: some short (3–5 lines), some long-form storytelling. Match the ${f.tone.toLowerCase()} tone.

${f.cta ? `**CTA** — Natural, non-pushy call to action: "${f.cta}"` : ""}

**Hashtags** — 15–20 relevant hashtags in 3 tiers: broad (5), niche (7), micro-niche (5). Place them after a line break.

Make each of the 5 captions completely different in approach: one storytelling, one educational, one promotional, one conversational, one inspirational.`,
  },

  {
    id: "twitter-thread",
    name: "Twitter/X Thread",
    category: "social",
    categoryLabel: "Social Media",
    emoji: "🐦",
    agentId: "aria",
    description: "Write a viral Twitter/X thread that educates, entertains, and drives followers.",
    fields: [
      { id: "topic", label: "Thread Topic", type: "text", placeholder: "e.g. 10 things I learned building a $1M startup", required: true },
      { id: "tweets", label: "Number of Tweets", type: "select", options: ["7 tweets", "10 tweets", "12 tweets", "15 tweets"], defaultVal: "10 tweets" },
      { id: "style", label: "Thread Style", type: "select", options: ["Listicle (numbered tips)", "Storytelling", "Hot take / Contrarian", "Educational deep-dive", "Case study"], defaultVal: "Listicle (numbered tips)" },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. startup founders, marketers", required: true },
      { id: "details", label: "Key Points / Story Details", type: "textarea", placeholder: "What insights, data, or story beats should be included?", required: true },
    ],
    buildPrompt: (f) => `Write a ${f.tweets} Twitter/X thread in ${f.style.toLowerCase()} style.

Topic: "${f.topic}"
Audience: ${f.audience}
Key content:
${f.details}

Format each tweet as:

**Tweet 1 (Hook):** — The opening tweet that makes people STOP scrolling and want to read more. Max 280 characters. No hashtags on hook tweet. Should standalone as a great single tweet.

**Tweet 2–${parseInt(f.tweets) - 1}:** — Numbered tweets delivering the value. Each must:
- Be max 280 characters
- End with a reason to read the next one
- Use line breaks for readability (Twitter formatting)
- Include specific, actionable insights (not generic advice)

**Final Tweet (CTA):** — Summarize the thread value and ask for retweet/follow/reply. Include: "If this was useful, RT tweet 1 to help others."

Thread writing rules:
- Hook must stop the scroll in under 2 seconds
- Every tweet must deliver value — cut anything fluffy
- Use numbers and specifics over vague claims
- Short sentences. Line breaks. White space.
- No hashtags except on the last tweet (3 max)`,
  },

  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    category: "social",
    categoryLabel: "Social Media",
    emoji: "💼",
    agentId: "aria",
    description: "Write a high-engagement LinkedIn post that builds authority and drives comments.",
    fields: [
      { id: "topic", label: "Post Topic / Insight", type: "text", placeholder: "e.g. Why I quit my 6-figure job to start a business", required: true },
      { id: "audience", label: "Target Professional Audience", type: "text", placeholder: "e.g. marketing professionals, startup founders", required: true },
      { id: "style", label: "Post Style", type: "select", options: ["Personal story", "Contrarian take", "Industry insight", "Numbered list tips", "Lessons learned", "Announcement"], defaultVal: "Personal story" },
      { id: "details", label: "Key Points / Story", type: "textarea", placeholder: "The main idea, story, data, or message you want to convey", required: true },
      { id: "cta", label: "Engagement CTA", type: "text", placeholder: "e.g. What's your take? Drop it in the comments.", required: false },
    ],
    buildPrompt: (f) => `Write a high-performing LinkedIn post.

Topic: ${f.topic}
Audience: ${f.audience}
Style: ${f.style}
Key content:
${f.details}
${f.cta ? `CTA: ${f.cta}` : ""}

Write 2 versions of this LinkedIn post:

**VERSION A (Short - high engagement):**
- Hook line (appears before "see more" — must be irresistible, max 2 lines)
- Body (8–12 short lines, each line 1–2 sentences, heavy white space)
- Emotional or surprising kicker
- ${f.cta || "Engagement question to drive comments"}
- 3–5 relevant hashtags

**VERSION B (Long-form storytelling):**
- Strong hook (1–2 lines)
- Full story/insight developed over 15–20 lines with clear narrative arc
- Specific data, examples, or turning points
- Lesson or takeaway clearly stated
- ${f.cta || "Engagement question"}
- 3–5 relevant hashtags

LinkedIn post rules:
- Hook must work as a standalone sentence people screenshot
- No bullet point walls — use single lines with spacing
- Be personal and specific, not generic and corporate
- End with a question that's easy to answer to drive comments`,
  },

  {
    id: "tiktok-script",
    name: "TikTok Script",
    category: "social",
    categoryLabel: "Social Media",
    emoji: "🎵",
    agentId: "aria",
    description: "Write an engaging TikTok video script with hook, content, and viral elements.",
    fields: [
      { id: "topic", label: "Video Topic / Concept", type: "text", placeholder: "e.g. 3 signs your business idea will fail", required: true },
      { id: "duration", label: "Video Length", type: "select", options: ["15 seconds", "30 seconds", "60 seconds", "3 minutes"], defaultVal: "60 seconds" },
      { id: "style", label: "Video Style", type: "select", options: ["Talking head / Educational", "Voiceover + B-roll", "Text on screen", "Trending format / POV"], defaultVal: "Talking head / Educational" },
      { id: "niche", label: "Account Niche", type: "text", placeholder: "e.g. business advice, cooking, fitness, comedy", required: true },
      { id: "hook", label: "Hook Angle (optional)", type: "text", placeholder: "e.g. 'Nobody talks about this but…', 'Stop doing this if…'", required: false },
    ],
    buildPrompt: (f) => `Write a complete TikTok video script.

Topic: "${f.topic}"
Duration: ${f.duration}
Style: ${f.style}
Niche: ${f.niche}
${f.hook ? `Hook angle: ${f.hook}` : ""}

Deliver:

**HOOK (First 1–3 seconds):** — The most critical part. Must stop the scroll INSTANTLY. Write 3 hook options:
Option A: [Question hook]
Option B: [Bold statement hook]
Option C: [Pattern interrupt hook]
Pick the strongest and mark it RECOMMENDED.

**FULL SCRIPT (for the selected RECOMMENDED hook):**
Write the complete spoken script formatted like this:
[0:00] — [What's said + what's shown on screen]
[0:05] — [...]
...continue for full ${f.duration}

Include:
- [VISUAL] cues for what appears on screen
- [TEXT OVERLAY] for words on screen
- [TRANSITION] notes
- [SOUND] suggestions for trending audio types

**CAPTION** — TikTok caption (150 chars max) + 5–7 hashtags

**THUMBNAIL TEXT** — If using thumbnail, what text goes on it?

Write for maximum retention — assume 80% of viewers will swipe away in the first 2 seconds.`,
  },

  {
    id: "facebook-ad",
    name: "Facebook Ad Copy",
    category: "social",
    categoryLabel: "Social Media",
    emoji: "📢",
    agentId: "coda",
    description: "Write high-converting Facebook and Instagram ad copy for any offer or product.",
    fields: [
      { id: "product", label: "Product / Offer", type: "text", placeholder: "e.g. Online yoga course, SaaS trial, weight loss coaching", required: true },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. women aged 30–45 interested in fitness", required: true },
      { id: "objective", label: "Ad Objective", type: "select", options: ["Clicks to website", "Lead generation", "Sales / Conversions", "Brand awareness", "App installs"], defaultVal: "Sales / Conversions" },
      { id: "offer", label: "The Offer / Hook", type: "text", placeholder: "e.g. Free 7-day trial, 50% off today only, Free guide", required: true },
      { id: "pain", label: "Audience Pain Point", type: "textarea", placeholder: "What keeps your audience up at night? What do they desperately want?", required: true },
    ],
    buildPrompt: (f) => `Write complete Facebook/Instagram ad copy for the following:

Product/Offer: ${f.product}
Target audience: ${f.audience}
Ad objective: ${f.objective}
Hook/Offer: ${f.offer}
Audience pain point: ${f.pain}

Deliver 3 complete ad variations:

**AD VARIATION 1 — Pain/Solution (PAS Formula)**
Primary text (150–200 words): Open with the pain, agitate it, then present the solution.
Headline (40 chars max):
Description (25 chars max):
CTA button:

**AD VARIATION 2 — Social Proof / Results**
Primary text (100–150 words): Lead with a result or transformation. Proof-based.
Headline:
Description:
CTA button:

**AD VARIATION 3 — Direct Response / Urgency**
Primary text (80–120 words): Direct, punchy, urgency-driven offer-focused copy.
Headline:
Description:
CTA button:

For all variations:
- First line must hook without "more" being needed to understand the value
- Speak directly to ${f.audience} — use "you" language
- Focus on ${f.offer} as the key value exchange
- Match ${f.objective} objective — make the desired action crystal clear
- Avoid banned words (guaranteed, free trial claims without caveats, etc.)`,
  },

  {
    id: "social-bio",
    name: "Social Media Bio",
    category: "social",
    categoryLabel: "Social Media",
    emoji: "✍️",
    agentId: "aria",
    description: "Write optimized bios for Instagram, Twitter, LinkedIn, and TikTok profiles.",
    fields: [
      { id: "name", label: "Your Name / Brand Name", type: "text", placeholder: "e.g. Sarah Chen | GrowWithSarah", required: true },
      { id: "what", label: "What You Do", type: "text", placeholder: "e.g. I help SaaS founders grow to 6 figures with content marketing", required: true },
      { id: "who", label: "Who You Help / Audience", type: "text", placeholder: "e.g. early-stage startup founders, freelancers, coaches", required: true },
      { id: "cta", label: "Desired Action / Link", type: "text", placeholder: "e.g. Free guide at link below, Book a call, Join my newsletter", required: false },
      { id: "personality", label: "Personality / Fun Fact (optional)", type: "text", placeholder: "e.g. dog mom, marathon runner, obsessed with spreadsheets", required: false },
    ],
    buildPrompt: (f) => `Write optimized social media bios for multiple platforms.

Name/Brand: ${f.name}
What I do: ${f.what}
Who I help: ${f.who}
${f.cta ? `CTA/Link: ${f.cta}` : ""}
${f.personality ? `Personality/fun fact: ${f.personality}` : ""}

Write one optimized bio for EACH platform:

**INSTAGRAM BIO** (max 150 characters total, must fit in 5 short lines):
Line 1: Who you are / what you do (bold if emoji used)
Line 2: Who you help + result
Line 3: Social proof or credibility
Line 4: ${f.personality ? "Personality/relatability" : "Key differentiator"}
Line 5: ${f.cta ? `CTA + link (use 👇 or ➡️)` : "Current focus or offer"}

**TWITTER/X BIO** (max 160 characters): One punchy sentence that captures who you are, what you do, and for whom. Include 1–2 emojis max.

**LINKEDIN HEADLINE** (max 220 characters): Keyword-optimized, role-clear, benefit-focused. Format: [Role] helping [audience] achieve [result] | [Credential or differentiator]

**LINKEDIN ABOUT SECTION** (300 words): First-person, conversational, story-driven. Problem → your solution → credibility → CTA.

**TIKTOK BIO** (max 80 characters): Fun, personality-forward, with a hook. Include what content they can expect.`,
  },

  {
    id: "hashtag-strategy",
    name: "Hashtag Strategy",
    category: "social",
    categoryLabel: "Social Media",
    emoji: "#️⃣",
    agentId: "aria",
    description: "Build a complete, tiered hashtag strategy for any niche and platform.",
    fields: [
      { id: "niche", label: "Niche / Industry", type: "text", placeholder: "e.g. sustainable fashion, B2B SaaS, personal finance", required: true },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "LinkedIn", "Twitter/X", "All platforms"], defaultVal: "Instagram" },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. eco-conscious millennials", required: true },
      { id: "content", label: "Content Type / Themes", type: "textarea", placeholder: "What topics and content do you typically post about?", required: true },
    ],
    buildPrompt: (f) => `Build a complete ${f.platform} hashtag strategy for a ${f.niche} account.

Target audience: ${f.audience}
Content themes: ${f.content}

Deliver a comprehensive hashtag research document:

**STRATEGY OVERVIEW**
Explain the tiered hashtag approach and why it works for ${f.niche} on ${f.platform}.

**TIER 1 — MEGA HASHTAGS** (1M+ posts) — 10 hashtags
[List with estimated post counts and when to use]

**TIER 2 — LARGE HASHTAGS** (100K–1M posts) — 15 hashtags
[List with relevance notes]

**TIER 3 — NICHE HASHTAGS** (10K–100K posts) — 20 hashtags
[List — most powerful for targeted reach]

**TIER 4 — MICRO-NICHE HASHTAGS** (1K–10K posts) — 15 hashtags
[List — highest engagement rate, least competition]

**BRANDED HASHTAG SUGGESTIONS** — 5 options for creating your own branded hashtag

**CONTENT-SPECIFIC HASHTAG SETS**
For each content theme mentioned, provide a 15-hashtag set:
- Theme 1: [hashtags]
- Theme 2: [hashtags]
- Theme 3: [hashtags]

**BEST PRACTICES**
- Ideal number of hashtags for ${f.platform}
- Placement strategy (caption vs. comment vs. first comment)
- Rotation strategy to avoid shadow banning
- How to track which hashtags drive reach

**HASHTAGS TO AVOID** — Common mistakes and oversaturated hashtags in this niche`,
  },

  // ── SALES ──────────────────────────────────────────────────
  {
    id: "cold-email",
    name: "Cold Email Generator",
    category: "sales",
    categoryLabel: "Sales",
    emoji: "📧",
    agentId: "velo",
    description: "Write personalized, high-converting cold email sequences that get replies.",
    fields: [
      { id: "sender", label: "Sender Name & Company", type: "text", placeholder: "e.g. Alex from GrowthPulse", required: true },
      { id: "product", label: "Product / Service Being Sold", type: "text", placeholder: "e.g. AI-powered sales analytics platform", required: true },
      { id: "prospect", label: "Target Prospect", type: "text", placeholder: "e.g. VP of Sales at B2B SaaS companies with 50–200 employees", required: true },
      { id: "pain", label: "Key Pain Point You Solve", type: "text", placeholder: "e.g. sales reps wasting time on unqualified leads", required: true },
      { id: "result", label: "Specific Result / Social Proof", type: "text", placeholder: "e.g. helped Acme Corp increase qualified meetings by 40%", required: false },
      { id: "emails", label: "Sequence Length", type: "select", options: ["3 emails", "5 emails", "7 emails"], defaultVal: "5 emails" },
    ],
    buildPrompt: (f) => `Write a ${f.emails} cold email outreach sequence.

Sender: ${f.sender}
Product/Service: ${f.product}
Target prospect: ${f.prospect}
Pain point addressed: ${f.pain}
${f.result ? `Social proof/result: ${f.result}` : ""}

Write each email with:
- EMAIL NUMBER & SEND TIMING (e.g. Email 1 — Day 1, Email 2 — Day 3)
- SUBJECT LINE (3 options: curiosity, benefit, direct)
- PREVIEW TEXT
- EMAIL BODY (full copy)
- CTA (one clear, low-friction ask)

Email sequence strategy:
Email 1 (Day 1): Hook with a highly relevant, personalized opening referencing their specific situation. Lead with ${f.pain}. Soft ask.
Email 2 (Day 3): Follow-up from a different angle. Share ${f.result || "a relevant insight or case study"}. Reframe the value.
Email 3 (Day 7): Add value — share a relevant tip, resource, or insight with no strings attached. Subtle CTA.
${parseInt(f.emails) >= 5 ? `Email 4 (Day 12): Social proof-led email. Specific results + relevant customer story.
Email 5 (Day 18): "Last touch" breakup email — direct, honest, creates urgency.` : ""}
${parseInt(f.emails) >= 7 ? `Email 6 (Day 25): Re-engage with a new hook — updated offer, new insight, or changed context.
Email 7 (Day 35): Final attempt — brief, friendly, leaves door open.` : ""}

Cold email rules:
- Subject lines under 7 words, no clickbait
- First sentence must be about THEM, not you
- Under 150 words per email (except email 3)
- One CTA per email — low friction ask (15-min call, reply yes/no, etc.)
- Personalization placeholders: [Company], [First Name], [Specific trigger]`,
  },

  {
    id: "linkedin-outreach",
    name: "LinkedIn Outreach Messages",
    category: "sales",
    categoryLabel: "Sales",
    emoji: "🤝",
    agentId: "velo",
    description: "Write personalized LinkedIn connection requests and follow-up messages that get accepted.",
    fields: [
      { id: "sender", label: "Your Role & Company", type: "text", placeholder: "e.g. Account Executive at DataBridge", required: true },
      { id: "prospect", label: "Target Prospect Profile", type: "text", placeholder: "e.g. Head of Marketing at e-commerce brands", required: true },
      { id: "product", label: "What You're Offering", type: "text", placeholder: "e.g. Customer retention analytics platform", required: true },
      { id: "reason", label: "Reason for Reaching Out", type: "text", placeholder: "e.g. Saw their post about customer churn, mutual connection, their company just raised funding", required: true },
    ],
    buildPrompt: (f) => `Write a complete LinkedIn outreach sequence.

Sender: ${f.sender}
Prospect: ${f.prospect}
Offering: ${f.product}
Outreach trigger: ${f.reason}

Deliver:

**CONNECTION REQUEST NOTE** (max 300 characters — LinkedIn limit)
3 versions:
- Version A: Compliment/common ground angle
- Version B: Value proposition angle
- Version C: Mutual benefit / curiosity angle

**FOLLOW-UP MESSAGE 1** (Send 2 days after accepting — if they don't reply)
Full message, under 150 words. Transition from connection to conversation opener. Reference: ${f.reason}. End with an open question, not a pitch.

**FOLLOW-UP MESSAGE 2** (Send 5 days after Message 1 — if no reply)
Different angle. Add value (insight, resource, or observation). Soft ask.

**FOLLOW-UP MESSAGE 3** (Send 10 days after Message 2 — final)
Short, direct, respectful "breakup" message. Leave door open.

**WHEN THEY REPLY — RESPONSE TEMPLATES**
- If they say "not interested right now": [response]
- If they ask for more info: [response]
- If they agree to a call: [booking confirmation message]

Keep all messages conversational. No corporate speak. No instant pitch. Build rapport first.`,
  },

  {
    id: "sales-pitch",
    name: "Sales Pitch Script",
    category: "sales",
    categoryLabel: "Sales",
    emoji: "🎯",
    agentId: "velo",
    description: "Write a compelling sales pitch script for calls, demos, or in-person meetings.",
    fields: [
      { id: "product", label: "Product / Service", type: "text", placeholder: "e.g. HR automation software", required: true },
      { id: "prospect", label: "Prospect Type", type: "text", placeholder: "e.g. HR directors at mid-sized companies", required: true },
      { id: "pain", label: "Top 3 Pain Points You Solve", type: "textarea", placeholder: "List the main problems your product solves", required: true },
      { id: "differentiator", label: "Key Differentiator", type: "text", placeholder: "e.g. Only solution that integrates with all major ATS platforms", required: true },
      { id: "format", label: "Pitch Format", type: "select", options: ["Cold call script", "Discovery call", "Full demo script", "Elevator pitch (2 min)"], defaultVal: "Discovery call" },
    ],
    buildPrompt: (f) => `Write a complete ${f.format} script.

Product: ${f.product}
Prospect: ${f.prospect}
Pain points solved: ${f.pain}
Key differentiator: ${f.differentiator}

**FULL ${f.format.toUpperCase()} SCRIPT:**

OPENING (30 seconds):
[Exact script — how to open confidently, establish rapport, get permission to continue]

DISCOVERY QUESTIONS (if applicable):
[5–7 open-ended questions to uncover pain, priority, and buying power]
Include: situation questions, implication questions, pain-point questions

TRANSITION TO PITCH:
[Bridge from discovery to solution — use their own words]

PITCH (Features → Benefits → Proof):
For each pain point:
- "You mentioned [pain]…" → "Here's how we solve that…" → [Feature] → [Benefit] → [Proof/data point]

DIFFERENTIATION:
[How to address ${f.differentiator} naturally in conversation]

OBJECTION HANDLING (pre-empt top 3 objections):
- Price objection: [script]
- "We're happy with our current solution": [script]
- "Now isn't a good time": [script]

CLOSE:
[2 closing options: assumptive close and alternative close]

FOLLOW-UP CONFIRMATION:
[What to say/email immediately after the call]

Write word-for-word scripts, not bullet outlines. Include [PAUSE] and [LISTEN] cues.`,
  },

  {
    id: "follow-up-sequence",
    name: "Follow-Up Email Sequence",
    category: "sales",
    categoryLabel: "Sales",
    emoji: "🔄",
    agentId: "velo",
    description: "Write a multi-touch follow-up email sequence after a sales call or demo.",
    fields: [
      { id: "context", label: "What Happened (Call/Demo Summary)", type: "textarea", placeholder: "What was discussed? What were their pain points and objections? What was agreed next?", required: true },
      { id: "product", label: "Product / Service", type: "text", placeholder: "e.g. Marketing automation platform", required: true },
      { id: "prospect", label: "Prospect Name & Company", type: "text", placeholder: "e.g. John Smith at TechCorp", required: false },
      { id: "nextStep", label: "Desired Next Step", type: "text", placeholder: "e.g. Schedule a technical demo, send a proposal, get sign-off", required: true },
    ],
    buildPrompt: (f) => `Write a post-meeting follow-up email sequence.

Context from meeting: ${f.context}
Product: ${f.product}
Prospect: ${f.prospect || "the prospect"}
Desired next step: ${f.nextStep}

Write a 4-email follow-up sequence:

**EMAIL 1 — SAME DAY** (Send within 2 hours of call)
Subject: Thank you + [key takeaway from their specific situation]
- Personal thank you (reference something specific they said)
- Recap of pain points THEY mentioned (use their language)
- How ${f.product} addresses each pain point
- Clear next step: ${f.nextStep}
- Any materials/resources promised

**EMAIL 2 — DAY 3** (If no response or to maintain momentum)
Subject: [Follow up / add value angle]
- Brief recap of key value prop relevant to their situation
- Add a new piece of value: case study, relevant insight, ROI calculation
- Soft nudge toward ${f.nextStep}

**EMAIL 3 — DAY 7** (If still no decision)
Subject: [Urgency or question-based subject]
- Address the likely objection or hesitation directly
- Reframe the cost of inaction
- Give them an easy out or a clear yes/no

**EMAIL 4 — DAY 14** (Breakup email)
Subject: Should I close your file?
- Brief, respectful, no-pressure
- Leave door open for future
- Give them permission to say no

All emails should feel personal, not templated. Reference specific details from the meeting.`,
  },

  {
    id: "objection-handler",
    name: "Objection Handler",
    category: "sales",
    categoryLabel: "Sales",
    emoji: "🛡️",
    agentId: "velo",
    description: "Get proven scripts to handle any sales objection and move deals forward.",
    fields: [
      { id: "objection", label: "The Objection", type: "text", placeholder: "e.g. 'It's too expensive', 'We're not ready yet', 'I need to think about it'", required: true },
      { id: "product", label: "Your Product / Service", type: "text", placeholder: "e.g. B2B project management software", required: true },
      { id: "context", label: "Context (where/when does this objection come up?)", type: "text", placeholder: "e.g. During pricing discussion on discovery calls", required: false },
    ],
    buildPrompt: (f) => `Write a comprehensive objection handling guide for this specific objection.

Objection: "${f.objection}"
Product/Service: ${f.product}
${f.context ? `Context: ${f.context}` : ""}

Deliver:

**UNDERSTANDING THE OBJECTION**
Explain the 3 most common REAL reasons behind this objection. (People often say "too expensive" but mean something else.)

**THE WRONG WAY TO HANDLE IT**
Show what most salespeople do wrong when they hear this objection.

**PROVEN RESPONSE SCRIPTS — 5 approaches:**

Script 1: **Acknowledge + Clarify** (Understand the true objection first)
[Full word-for-word script]

Script 2: **Reframe the Cost** (ROI / cost of not solving the problem)
[Full script with ROI calculation framework]

Script 3: **Feel, Felt, Found** (Classic empathy approach)
[Full script]

Script 4: **Question-Based** (Let them talk themselves into it)
[Full script with follow-up questions]

Script 5: **Direct Close** (For when they just need a push)
[Full script]

**IF THEY STILL OBJECT**
What to say when none of the above works — the graceful exit that keeps the door open.

**BODY LANGUAGE & TONE NOTES**
How to physically/vocally deliver these responses with confidence.

**PREVENTION**
How to proactively address this objection BEFORE it comes up in a conversation.`,
  },

  {
    id: "proposal-template",
    name: "Proposal Template",
    category: "sales",
    categoryLabel: "Sales",
    emoji: "📋",
    agentId: "velo",
    description: "Write a professional sales proposal that wins clients and closes deals.",
    fields: [
      { id: "company", label: "Your Company Name", type: "text", placeholder: "e.g. Mobilions Agency", required: true },
      { id: "client", label: "Client Name & Company", type: "text", placeholder: "e.g. Jennifer Walsh at BlueWave Retail", required: true },
      { id: "project", label: "Project / Engagement", type: "text", placeholder: "e.g. 6-month SEO & content marketing retainer", required: true },
      { id: "scope", label: "Scope of Work", type: "textarea", placeholder: "List what's included: deliverables, timelines, responsibilities", required: true },
      { id: "investment", label: "Investment / Pricing", type: "text", placeholder: "e.g. $4,500/month, $18,000 flat fee — 3 payment milestones", required: true },
      { id: "outcomes", label: "Expected Outcomes / Results", type: "textarea", placeholder: "What results will the client achieve? Be specific.", required: true },
    ],
    buildPrompt: (f) => `Write a professional sales proposal.

From: ${f.company}
To: ${f.client}
Project: ${f.project}
Scope: ${f.scope}
Investment: ${f.investment}
Expected outcomes: ${f.outcomes}

Write a complete, persuasive proposal with these sections:

**COVER PAGE**
Proposal title, date, prepared for, prepared by

**EXECUTIVE SUMMARY** (100–150 words)
Briefly capture: their challenge, your solution, and the outcome they can expect. Written for a decision-maker who only reads the first page.

**UNDERSTANDING YOUR SITUATION**
Demonstrate you understand their specific challenges and goals. Show you listened. (2–3 paragraphs — use their language)

**OUR RECOMMENDED APPROACH**
How you'll solve their problem. Why this approach. The philosophy behind it. (Not just a list of services — tell the story of how you'll help them win.)

**SCOPE OF WORK & DELIVERABLES**
Clean, clear breakdown of everything included. Month-by-month or milestone-based. Be specific.

**INVESTMENT**
${f.investment}
- Payment terms
- What's included vs. what's not
- ROI framing: frame the investment against expected outcomes

**EXPECTED OUTCOMES & SUCCESS METRICS**
${f.outcomes}
Tie outcomes to measurable KPIs. Include a timeline expectation.

**WHY ${f.company.toUpperCase()}**
3–5 sentences of credibility. What makes your approach different.

**NEXT STEPS**
Clear 3-step process to get started. Make it easy to say yes.

**TERMS & CONDITIONS** (brief standard terms)

Write in a confident, client-focused tone. Lead with outcomes, not features.`,
  },

  // ── MARKETING ──────────────────────────────────────────────
  {
    id: "google-ad-copy",
    name: "Google Ad Copy",
    category: "marketing",
    categoryLabel: "Marketing",
    emoji: "🔍",
    agentId: "coda",
    description: "Write high-performing Google Search ad headlines and descriptions with keyword optimization.",
    fields: [
      { id: "product", label: "Product / Service", type: "text", placeholder: "e.g. Accounting software for small businesses", required: true },
      { id: "keyword", label: "Target Keyword", type: "text", placeholder: "e.g. accounting software small business", required: true },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. small business owners looking to simplify bookkeeping", required: true },
      { id: "usp", label: "Unique Selling Point", type: "text", placeholder: "e.g. Save 5 hours/week, free 30-day trial, no credit card required", required: true },
      { id: "url", label: "Display URL Path (optional)", type: "text", placeholder: "e.g. /small-business-accounting", required: false },
    ],
    buildPrompt: (f) => `Write complete Google Responsive Search Ad (RSA) copy.

Product/Service: ${f.product}
Target keyword: "${f.keyword}"
Target audience: ${f.audience}
USP: ${f.usp}
${f.url ? `Display URL: example.com${f.url}` : ""}

Deliver a complete RSA ad set:

**15 HEADLINES** (max 30 characters each — include character count)
Include:
- 3 keyword-inclusion headlines (exact or close match)
- 3 benefit-focused headlines
- 3 USP/differentiator headlines
- 3 social proof/authority headlines
- 3 urgency/CTA headlines

**4 DESCRIPTIONS** (max 90 characters each — include character count)
- Description 1: Feature + benefit focused
- Description 2: Pain point + solution focused
- Description 3: Social proof + outcome focused
- Description 4: Urgency/offer focused

**AD EXTENSIONS TO SET UP:**
- 4 Sitelink suggestions (title + 2-line descriptions)
- 6 Callout extension suggestions (25 chars max each)
- 3 Structured snippet suggestions

**QUALITY SCORE TIPS**
Note which headline/description combinations will score highest and why.

Character counts are STRICT — flag any that exceed the limit.`,
  },

  {
    id: "email-campaign",
    name: "Email Campaign",
    category: "marketing",
    categoryLabel: "Marketing",
    emoji: "📮",
    agentId: "mailo",
    description: "Design a full email marketing campaign with strategy, sequence, and complete copy.",
    fields: [
      { id: "goal", label: "Campaign Goal", type: "text", placeholder: "e.g. Launch a new product, promote a sale, re-engage inactive subscribers", required: true },
      { id: "product", label: "Product / Offer", type: "text", placeholder: "e.g. Summer sale — 30% off all courses", required: true },
      { id: "audience", label: "Email List Segment", type: "text", placeholder: "e.g. All subscribers, past customers, leads who haven't bought", required: true },
      { id: "emails", label: "Campaign Length", type: "select", options: ["3 emails (3 days)", "5 emails (7 days)", "7 emails (10 days)"], defaultVal: "5 emails (7 days)" },
      { id: "brand", label: "Brand Name & Voice", type: "text", placeholder: "e.g. Bloom Co. — warm, encouraging, never pushy", required: true },
    ],
    buildPrompt: (f) => `Design a complete email marketing campaign.

Goal: ${f.goal}
Product/Offer: ${f.product}
Audience: ${f.audience}
Campaign: ${f.emails}
Brand: ${f.brand}

**CAMPAIGN STRATEGY**
Briefly outline the narrative arc of this campaign — the emotional journey from first email to final CTA.

For each email, write:
- Email number and send day
- Subject line (3 variations: A/B/C test options)
- Preview text
- Full email body copy (complete, ready-to-send)
- CTA button text
- Post-click landing page headline suggestion

**EMAIL SEQUENCE:**

Email 1 — [Day/Timing]: Open with curiosity or a story. Introduce the opportunity. Low-pressure CTA.

Email 2 — [Day/Timing]: Expand the value. Share benefits + social proof. Medium-pressure CTA.

Email 3 — [Day/Timing]: Overcome objections. Address the "but what about…" hesitations. CTA.

${parseInt(f.emails) >= 5 ? `Email 4 — [Day/Timing]: Urgency builder. Deadline, scarcity, or FOMO. Strong CTA.
Email 5 — [Day/Timing]: Last chance. Direct, honest, deadline-focused. Final CTA.` : ""}

${parseInt(f.emails) >= 7 ? `Email 6 — [Day/Timing]: Thank you / post-purchase (for buyers) OR re-engagement (for non-buyers).
Email 7 — [Day/Timing]: Segmentation email — offer something different to non-buyers, upsell to buyers.` : ""}

Write in the ${f.brand} voice. Emails should feel like they come from a real person, not a marketing department.`,
  },

  {
    id: "ab-subject-lines",
    name: "A/B Subject Lines",
    category: "marketing",
    categoryLabel: "Marketing",
    emoji: "🧪",
    agentId: "mailo",
    description: "Generate 20+ A/B testable email subject lines with different psychological triggers.",
    fields: [
      { id: "email", label: "What Is the Email About?", type: "textarea", placeholder: "Describe the email content and offer briefly", required: true },
      { id: "audience", label: "Email Audience", type: "text", placeholder: "e.g. e-commerce customers, SaaS trial users, newsletter subscribers", required: true },
      { id: "goal", label: "Email Goal", type: "text", placeholder: "e.g. Get them to open and click the sale CTA", required: true },
    ],
    buildPrompt: (f) => `Generate 25 A/B testable email subject lines.

Email content: ${f.email}
Audience: ${f.audience}
Goal: ${f.goal}

Write 25 subject lines organized by psychological trigger (5 per category):

**CURIOSITY** (5) — Create information gaps that demand to be filled
- [subject line] — [why it works]

**BENEFIT/OUTCOME** (5) — Lead with the result or transformation
- [subject line] — [why it works]

**URGENCY/SCARCITY** (5) — Time pressure or limited availability
- [subject line] — [why it works]

**PERSONALIZATION** (5) — Feel uniquely targeted (use [First Name] where applicable)
- [subject line] — [why it works]

**PATTERN INTERRUPT** (5) — Unusual, unexpected, or bold subject lines that break the mold
- [subject line] — [why it works]

**TOP 5 RECOMMENDATIONS** — Pick your 5 highest-confidence recommendations with rationale.

**A/B TEST PAIRINGS** — Suggest 3 ideal head-to-head test pairings and what hypothesis each tests.

**PREVIEW TEXT PAIRINGS** — For the top 5 subject lines, write a matching preview text (90 chars max each).

Include character counts. Mark any over 50 chars as "long — monitor mobile truncation".`,
  },

  {
    id: "brand-tagline",
    name: "Brand Tagline",
    category: "marketing",
    categoryLabel: "Marketing",
    emoji: "💡",
    agentId: "coda",
    description: "Create memorable, differentiated brand taglines and positioning statements.",
    fields: [
      { id: "brand", label: "Brand / Company Name", type: "text", placeholder: "e.g. LightPath Studios", required: true },
      { id: "what", label: "What You Do", type: "text", placeholder: "e.g. We help eCommerce brands with video production", required: true },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. DTC brands doing $1M+ in revenue", required: true },
      { id: "differentiation", label: "What Makes You Different", type: "textarea", placeholder: "What's your unfair advantage? What do you do that others don't?", required: true },
      { id: "feeling", label: "How Should It Make People Feel?", type: "text", placeholder: "e.g. Inspired, confident, relieved, excited, premium", required: false },
    ],
    buildPrompt: (f) => `Create brand taglines and positioning statements for ${f.brand}.

What they do: ${f.what}
Target audience: ${f.audience}
Differentiators: ${f.differentiation}
${f.feeling ? `Desired feeling: ${f.feeling}` : ""}

Deliver:

**20 TAGLINE OPTIONS** organized by style:

Functional (5) — What you do, stated clearly and powerfully:
[taglines]

Emotional (5) — How it makes them feel / the outcome they desire:
[taglines]

Contrarian (3) — Challenge an industry assumption:
[taglines]

Aspirational (4) — The bigger mission/vision:
[taglines]

Punchy/Memorable (3) — Short, witty, quotable (under 5 words):
[taglines]

**TOP 5 RECOMMENDATIONS** with rationale

**POSITIONING STATEMENT** (Internal use — the "we help X do Y so they can Z" framework):
"${f.brand} helps [audience] [achieve what] by [how] so they can [ultimate outcome]."

**VALUE PROPOSITION** (External use — for homepage hero or sales deck):
One punchy paragraph that communicates who you serve, what you do, how you're different, and why it matters.

**BRAND MESSAGING PILLARS** (3 core messages to repeat across all marketing):
Pillar 1: [theme + sample messages]
Pillar 2: [theme + sample messages]
Pillar 3: [theme + sample messages]`,
  },

  {
    id: "value-proposition",
    name: "Value Proposition",
    category: "marketing",
    categoryLabel: "Marketing",
    emoji: "💎",
    agentId: "coda",
    description: "Craft a clear, compelling value proposition that instantly communicates your unique value.",
    fields: [
      { id: "product", label: "Product / Service", type: "text", placeholder: "e.g. AI-powered customer support platform", required: true },
      { id: "audience", label: "Ideal Customer", type: "text", placeholder: "e.g. e-commerce store owners with 100K+ monthly visitors", required: true },
      { id: "problem", label: "Problem You Solve", type: "textarea", placeholder: "What specific, painful problem does your product eliminate?", required: true },
      { id: "solution", label: "How You Solve It", type: "textarea", placeholder: "What's unique about your approach or solution?", required: true },
      { id: "result", label: "Measurable Outcomes / Results", type: "textarea", placeholder: "What specific, quantifiable results can customers expect?", required: true },
    ],
    buildPrompt: (f) => `Create a comprehensive value proposition framework.

Product: ${f.product}
Ideal customer: ${f.audience}
Problem solved: ${f.problem}
Solution: ${f.solution}
Results: ${f.result}

Deliver:

**CORE VALUE PROPOSITION** (The "golden sentence")
One sentence that answers: Who is this for? What does it do? What's the unique benefit?

**HERO SECTION COPY** (Website homepage)
Headline: (Under 10 words, specific, outcome-focused)
Sub-headline: (1–2 sentences expanding on the promise)
CTA button:

**VALUE PROPOSITION VARIATIONS** (5 versions for different contexts)
1. Elevator pitch (30 seconds / 75 words)
2. Twitter bio (160 chars)
3. Sales deck slide headline
4. Cold email opening line
5. LinkedIn About section opening

**BEFORE/AFTER FRAMEWORK**
Before: [The world without your product — specific pain state for ${f.audience}]
After: [The transformed state with your product — specific outcome]
Bridge: [How you get them there]

**UNIQUE VALUE DRIVERS** (What you have that competitors don't)
List 5 specific, defensible reasons to choose you over alternatives.

**COMPETITIVE DIFFERENTIATION TABLE**
You vs. [Alternative 1] vs. [Alternative 2] vs. [Do Nothing]
Across 6–8 key criteria relevant to ${f.audience}'s decision.`,
  },

  // ── SUPPORT ────────────────────────────────────────────────
  {
    id: "faq-generator",
    name: "FAQ Generator",
    category: "support",
    categoryLabel: "Customer Support",
    emoji: "❓",
    agentId: "kira",
    description: "Generate comprehensive FAQ documents that reduce support tickets and build trust.",
    fields: [
      { id: "product", label: "Product / Service", type: "text", placeholder: "e.g. SaaS accounting software, online fitness membership", required: true },
      { id: "audience", label: "Customer Type", type: "text", placeholder: "e.g. small business owners, first-time users", required: true },
      { id: "topics", label: "Key Areas to Cover", type: "textarea", placeholder: "e.g. Pricing, cancellation, integrations, getting started, data security…", required: true },
      { id: "questions", label: "Specific Questions You Want Answered", type: "textarea", placeholder: "Any specific questions customers already ask? Add them here.", required: false },
    ],
    buildPrompt: (f) => `Write a comprehensive FAQ document.

Product/Service: ${f.product}
Customer type: ${f.audience}
Coverage areas: ${f.topics}
${f.questions ? `Specific questions to include: ${f.questions}` : ""}

Write a complete FAQ with 25–30 questions and answers organized into clear sections.

Format:
## [Section Name]

**Q: [Question exactly as a customer would ask it]**
A: [Clear, helpful answer. Use plain language. Be specific. Include any next steps, links to mention, or caveats. 2–5 sentences per answer.]

Required sections:
- Getting Started / How It Works
- Pricing & Plans
- Billing & Payment
- Account Management
- [Most relevant technical sections based on the product]
- Cancellation & Refunds
- Security & Privacy
- Contact & Support

Writing rules:
- Questions should match how real customers phrase things (not formal/corporate)
- Answers should be warm, helpful, and never make customers feel stupid for asking
- Include any "if/then" scenarios where the answer depends on context
- End complex answers with "Still have questions? Contact us at [support email]"
- Add a "Quick Answers" summary section at the top with the 5 most common questions`,
  },

  {
    id: "support-response",
    name: "Customer Support Response",
    category: "support",
    categoryLabel: "Customer Support",
    emoji: "💬",
    agentId: "kira",
    description: "Write professional, empathetic support responses for any customer situation.",
    fields: [
      { id: "issue", label: "Customer Issue / Message", type: "textarea", placeholder: "Paste or describe what the customer said or their problem", required: true },
      { id: "context", label: "Product / Service Context", type: "text", placeholder: "e.g. SaaS tool, e-commerce store, mobile app", required: true },
      { id: "resolution", label: "Resolution / What Can You Offer?", type: "textarea", placeholder: "What's the solution? What can you do for them?", required: true },
      { id: "tone", label: "Support Tone", type: "select", options: ["Warm & Empathetic", "Professional & Formal", "Friendly & Casual", "Apologetic & Recovery-focused"], defaultVal: "Warm & Empathetic" },
    ],
    buildPrompt: (f) => `Write a professional customer support response.

Customer's issue: ${f.issue}
Product/Service: ${f.context}
Resolution available: ${f.resolution}
Tone: ${f.tone}

Write 3 response versions:

**VERSION 1 — Email Response** (for email ticket)
Subject line re: [their issue]
Full email with:
- Acknowledge their frustration/issue specifically (not generic "we're sorry")
- Show you understand what happened and that it matters
- Provide the resolution clearly (${f.resolution})
- Next steps — what happens now, what they need to do
- Offer further help
- Sign-off

**VERSION 2 — Live Chat Response** (short, conversational, broken into chat-friendly messages)
[Message 1]: Acknowledgment
[Message 2]: Explanation / context
[Message 3]: Resolution
[Message 4]: Confirmation + next steps

**VERSION 3 — Canned Response Template** (for saving in helpdesk for similar future issues)
Include placeholder variables: [Customer Name], [Product Feature], [Date], etc.

All versions should:
- HEAR the problem before jumping to solutions
- Never say "unfortunately" without immediately offering a solution
- Avoid: "per our policy", "I apologize for any inconvenience", "please be advised"
- Use ${f.tone.toLowerCase()} tone throughout`,
  },

  {
    id: "apology-email",
    name: "Apology / Service Recovery Email",
    category: "support",
    categoryLabel: "Customer Support",
    emoji: "🙏",
    agentId: "kira",
    description: "Write a sincere, professional apology email that recovers customer relationships.",
    fields: [
      { id: "incident", label: "What Went Wrong", type: "textarea", placeholder: "Describe the service failure, outage, error, or issue that occurred", required: true },
      { id: "impact", label: "How Customers Were Impacted", type: "textarea", placeholder: "What effect did this have on customers? How many were affected?", required: true },
      { id: "resolution", label: "What Has Been Fixed / What You're Doing", type: "textarea", placeholder: "What was the root cause? What have you done to fix it? What's being done to prevent it?", required: true },
      { id: "compensation", label: "Compensation / Gesture (optional)", type: "text", placeholder: "e.g. 1 month credit, 20% discount, extended trial", required: false },
      { id: "company", label: "Company / Sender Name", type: "text", placeholder: "e.g. The Mobilions AI Team", required: true },
    ],
    buildPrompt: (f) => `Write a sincere, professional service recovery apology email.

What went wrong: ${f.incident}
Customer impact: ${f.impact}
Resolution: ${f.resolution}
${f.compensation ? `Compensation offered: ${f.compensation}` : ""}
Sender: ${f.company}

Write the apology email:

**SUBJECT LINE** (3 options — direct, no clickbait)

**EMAIL BODY:**

Opening (2–3 sentences): Start with a direct, sincere apology. No corporate hedging. Name exactly what happened.

What Happened (2–3 sentences): Brief, honest explanation of the root cause without making excuses.

Impact Acknowledgment (2–3 sentences): Acknowledge specifically how this affected customers. Show you understand the disruption it caused.

What We've Done / Are Doing (bullet points):
- Immediate fix: [what's been resolved]
- Root cause: [what caused it — be honest]
- Prevention: [what you're doing to ensure it doesn't happen again]
- Timeline: [when things are fully back to normal]

${f.compensation ? `**Your ${f.compensation}:** [How they get it and when — make it easy and automatic if possible]` : ""}

Closing: Take full accountability. Express genuine regret. Commit to better. Keep it human.

Sign-off: ${f.company} (signed by a named person, not just "The Team")

Rules: No passive voice. No "we apologize for any inconvenience". No "please be advised". Sound like a human being taking responsibility, not a legal department.`,
  },

  {
    id: "onboarding-guide",
    name: "Customer Onboarding Guide",
    category: "support",
    categoryLabel: "Customer Support",
    emoji: "🗺️",
    agentId: "kira",
    description: "Write a step-by-step onboarding guide that gets customers to their first win fast.",
    fields: [
      { id: "product", label: "Product / Service Name", type: "text", placeholder: "e.g. ProjectHero task management app", required: true },
      { id: "audience", label: "New User Profile", type: "text", placeholder: "e.g. small business owner with no project management experience", required: true },
      { id: "goal", label: "User's Primary Goal / Success Moment", type: "text", placeholder: "e.g. Create their first project and invite their team within 10 minutes", required: true },
      { id: "steps", label: "Key Product Steps / Features to Cover", type: "textarea", placeholder: "List the main steps or features new users need to learn (in order)", required: true },
    ],
    buildPrompt: (f) => `Write a comprehensive customer onboarding guide.

Product: ${f.product}
New user profile: ${f.audience}
Success moment: ${f.goal}
Key steps/features:
${f.steps}

Write a complete onboarding guide:

**WELCOME MESSAGE** (email or in-app — 150 words max)
Warm, personal, excitement-building. Reference their goal. Tell them exactly what they'll accomplish today.

**GETTING STARTED GUIDE**

## Your First 10 Minutes with ${f.product}

**Step 1: [First Action]**
What to do: [Clear instruction]
Why this matters: [Brief context]
✅ You'll know you're done when: [Success signal]
💡 Pro tip: [One power user tip]

[Repeat for each step from the features list]

**YOUR FIRST WIN** — A specific milestone checklist:
☐ [Action 1]
☐ [Action 2]
☐ [Action 3]
☐ [Success moment — "${f.goal}"]

**WHAT TO EXPLORE NEXT** (after first win)
3 features to discover in your first week.

**COMMON FIRST-WEEK QUESTIONS**
5 FAQs specific to new users.

**GET HELP WHEN YOU NEED IT**
[Support channels, response times, community resources]

Write in simple, encouraging language. Assume zero technical knowledge. Use short sentences and numbered lists.`,
  },

  {
    id: "return-policy",
    name: "Return & Refund Policy",
    category: "support",
    categoryLabel: "Customer Support",
    emoji: "↩️",
    agentId: "kira",
    description: "Write a clear, customer-friendly return and refund policy that builds trust.",
    fields: [
      { id: "company", label: "Company / Brand Name", type: "text", placeholder: "e.g. BloomBotanicals", required: true },
      { id: "type", label: "Business Type", type: "select", options: ["E-commerce / Physical Products", "Digital Products / Downloads", "SaaS / Subscription", "Services / Consulting", "Mixed"], defaultVal: "E-commerce / Physical Products" },
      { id: "returnWindow", label: "Return Window", type: "text", placeholder: "e.g. 30 days from purchase, 14 days from delivery", required: true },
      { id: "conditions", label: "Return Conditions / Exceptions", type: "textarea", placeholder: "What conditions must be met? What's NOT eligible for return? Any restocking fees?", required: true },
      { id: "process", label: "How to Initiate a Return", type: "textarea", placeholder: "Step-by-step process: contact email, form link, RMA number process, etc.", required: false },
    ],
    buildPrompt: (f) => `Write a customer-friendly return and refund policy.

Company: ${f.company}
Business type: ${f.type}
Return window: ${f.returnWindow}
Conditions/exceptions: ${f.conditions}
Return process: ${f.process || "Contact customer support to initiate"}

Write a complete, clear, trust-building return policy:

**${f.company.toUpperCase()} RETURN & REFUND POLICY**
Last updated: [Current Date]

**OUR PROMISE** (2–3 sentences — set a positive, trust-building tone before the rules)

**RETURN WINDOW**
[${f.returnWindow} — be clear and specific]

**WHAT CAN BE RETURNED**
[Conditions for eligible returns — bullet list]

**WHAT CANNOT BE RETURNED**
[Exceptions and non-eligible items — be specific but not harsh]

**HOW TO RETURN**
Step-by-step numbered process:
1. [First step]
2. [...]

**REFUND PROCESS**
- Refund method: [original payment / store credit / etc.]
- Processing time: [X business days]
- Who pays return shipping: [customer / company / depends]

**EXCHANGES**
[Policy for exchanges if applicable]

**DAMAGED OR DEFECTIVE ITEMS**
[Special handling — usually more generous than standard returns]

**FREQUENTLY ASKED QUESTIONS**
5 Q&As covering common return scenarios

**CONTACT US**
[Support channels for return questions]

Write in plain English — no legal jargon. Make it scannable with headers. The goal is to build trust, not create legal protection at the expense of customer experience.`,
  },

  // ── SEO ────────────────────────────────────────────────────
  {
    id: "meta-tags",
    name: "Meta Title & Description",
    category: "seo",
    categoryLabel: "SEO",
    emoji: "🔖",
    agentId: "luma",
    description: "Generate SEO-optimized meta titles and descriptions for any page.",
    fields: [
      { id: "page", label: "Page Type / Name", type: "text", placeholder: "e.g. Homepage, About Us, Product: Blue Running Shoes, Blog Post: How to...", required: true },
      { id: "keyword", label: "Primary Keyword", type: "text", placeholder: "e.g. buy blue running shoes online", required: true },
      { id: "secondary", label: "Secondary Keywords (optional)", type: "text", placeholder: "e.g. lightweight running shoes, men's blue sneakers", required: false },
      { id: "business", label: "Business Name", type: "text", placeholder: "e.g. SpeedGear", required: true },
      { id: "usp", label: "Key Benefit / USP", type: "text", placeholder: "e.g. Free shipping, 30-day returns, Australia's best prices", required: true },
    ],
    buildPrompt: (f) => `Write SEO-optimized meta titles and descriptions.

Page: ${f.page}
Business: ${f.business}
Primary keyword: "${f.keyword}"
${f.secondary ? `Secondary keywords: ${f.secondary}` : ""}
USP: ${f.usp}

Deliver:

**META TITLES** (5 options — max 60 characters each, include character count)
Rules:
- Include primary keyword "${f.keyword}" naturally
- Put keyword near the beginning when possible
- Include brand name at the end after " | " or " — "
- Be compelling for humans, not just search engines
- No keyword stuffing

**META DESCRIPTIONS** (5 options — max 155 characters each, include character count)
Rules:
- Include primary keyword naturally
- ${f.secondary ? `Weave in a secondary keyword: ${f.secondary}` : ""}
- Highlight "${f.usp}" as a benefit
- End with a soft CTA (Shop now, Learn more, Get started, etc.)
- Be informative AND persuasive

**TOP RECOMMENDATION**
Pick the best title + description combination and explain why (keyword placement, click-through psychology, character efficiency).

**OPEN GRAPH / SOCIAL META**
og:title (can be longer/more engaging than SEO title): [option]
og:description (1–2 sentences, more casual): [option]

**SCHEMA MARKUP SUGGESTION**
What schema type is most relevant for this page type and what key properties to include.`,
  },

  {
    id: "content-brief",
    name: "Content Brief",
    category: "seo",
    categoryLabel: "SEO",
    emoji: "📋",
    agentId: "luma",
    description: "Create a detailed SEO content brief that writers can use to create search-ranking content.",
    fields: [
      { id: "keyword", label: "Target Keyword", type: "text", placeholder: "e.g. best CRM for small business", required: true },
      { id: "site", label: "Website / Brand", type: "text", placeholder: "e.g. SalesHero Blog — B2B SaaS tools", required: true },
      { id: "audience", label: "Target Reader", type: "text", placeholder: "e.g. small business owners comparing CRM options", required: true },
      { id: "intent", label: "Search Intent", type: "select", options: ["Informational", "Commercial / Comparison", "Transactional", "Navigational"], defaultVal: "Commercial / Comparison" },
    ],
    buildPrompt: (f) => `Create a comprehensive SEO content brief.

Target keyword: "${f.keyword}"
Website/Brand: ${f.site}
Target reader: ${f.audience}
Search intent: ${f.intent}

**CONTENT BRIEF**

**OVERVIEW**
Content type: [Article/Landing page/etc. based on intent]
Target keyword: ${f.keyword}
Search intent: ${f.intent}
Target word count: [recommended range based on keyword competition]
Target reader: ${f.audience}

**KEYWORD RESEARCH**
Primary keyword: ${f.keyword}
LSI keywords (10): [related terms that should appear naturally]
Long-tail variations (8): [specific longer phrases to target]
Questions to answer (from People Also Ask): [8 questions]
NLP/semantic keywords: [terms Google associates with this topic]

**SERP ANALYSIS** (What top-ranking content does)
Common content formats: [what types of pages rank]
Average word count: [estimate]
Featured snippet opportunity: [what format would capture it]
Topics all top results cover: [must-have sections]
Content gaps: [what top results miss — differentiation opportunity]

**RECOMMENDED ARTICLE STRUCTURE**
Title: [SEO-optimized H1 — include keyword]
Meta description: [150 chars]

Introduction: [What to cover in the opening — hook, problem, promise]

H2: [Section 1 title]
- Key points to cover
- Internal linking opportunity: [suggest]

H2: [Section 2 title] — [Continue for all sections]

Conclusion: [Summary + CTA]

**ON-PAGE SEO CHECKLIST**
☐ Keyword in title, H1, first 100 words, meta description
☐ Image alt text suggestions
☐ Internal link targets (3–5 suggested pages on the site)
☐ External authority links to include
☐ Schema markup recommendation`,
  },

  {
    id: "keyword-research",
    name: "Keyword Research",
    category: "seo",
    categoryLabel: "SEO",
    emoji: "🔎",
    agentId: "luma",
    description: "Build a comprehensive keyword strategy with clusters, intent mapping, and priorities.",
    fields: [
      { id: "niche", label: "Business / Niche", type: "text", placeholder: "e.g. online yoga studio, B2B invoicing software, luxury pet accessories", required: true },
      { id: "audience", label: "Target Audience", type: "text", placeholder: "e.g. stay-at-home moms aged 30–50, CFOs at mid-market companies", required: true },
      { id: "goal", label: "SEO Goal", type: "select", options: ["Drive traffic and awareness", "Generate leads", "Grow e-commerce sales", "Build authority in my niche"], defaultVal: "Generate leads" },
      { id: "stage", label: "Website Stage", type: "select", options: ["New site (Domain Authority 0–20)", "Growing site (DA 20–50)", "Established site (DA 50+)"], defaultVal: "New site (Domain Authority 0–20)" },
    ],
    buildPrompt: (f) => `Build a comprehensive keyword research strategy.

Business/Niche: ${f.niche}
Target audience: ${f.audience}
SEO goal: ${f.goal}
Website stage: ${f.stage}

Deliver a full keyword research report:

**KEYWORD UNIVERSE OVERVIEW**
How to approach keyword research for ${f.niche} given a ${f.stage}.

**SEED KEYWORDS** (10 broad topics to research)
[List with rationale for each]

**KEYWORD CLUSTERS** — Organize all keywords by topic cluster:

**Cluster 1: [Topic]**
Primary keyword | Est. Monthly Searches | Difficulty (Low/Med/High) | Intent | Priority
[10 keywords per cluster, 5+ clusters]

**Cluster 2: [Topic]** — [Continue]

**QUICK WINS** (Low difficulty, decent volume — target first)
[10 keywords ideal for a ${f.stage}]

**MONEY KEYWORDS** (Highest purchase intent — directly tied to ${f.goal})
[10 keywords with conversion potential]

**QUESTION KEYWORDS** (Great for FAQ, featured snippets, People Also Ask)
[15 "how to", "what is", "why does" keywords]

**CONTENT CALENDAR SUGGESTION** (First 3 months)
Month 1: [5 articles — start with these quick wins]
Month 2: [5 articles — build on first month's topics]
Month 3: [5 articles — start tackling medium difficulty terms]

**COMPETITOR KEYWORD GAPS**
Strategy for finding keywords your competitors rank for that you don't — step-by-step using free tools.

**TRACKING RECOMMENDATIONS**
Which 10 keywords to track weekly as your primary KPIs.`,
  },

  {
    id: "seo-audit-checklist",
    name: "SEO Audit Checklist",
    category: "seo",
    categoryLabel: "SEO",
    emoji: "✅",
    agentId: "luma",
    description: "Get a comprehensive SEO audit checklist tailored to your website type.",
    fields: [
      { id: "site", label: "Website URL / Name", type: "text", placeholder: "e.g. example.com — online furniture store", required: true },
      { id: "type", label: "Website Type", type: "select", options: ["E-commerce", "SaaS / B2B", "Blog / Content", "Local Business", "Agency / Service", "Portfolio"], defaultVal: "SaaS / B2B" },
      { id: "issues", label: "Known Issues (optional)", type: "textarea", placeholder: "Any issues you already know about: slow speed, thin content, manual penalty, etc.", required: false },
    ],
    buildPrompt: (f) => `Create a comprehensive SEO audit checklist for a ${f.type} website.

Site: ${f.site}
${f.issues ? `Known issues: ${f.issues}` : ""}

**COMPLETE SEO AUDIT CHECKLIST**

**SECTION 1: TECHNICAL SEO**
☐ Site crawlability (robots.txt, sitemap.xml status)
☐ Core Web Vitals (LCP, FID/INP, CLS targets)
☐ Page speed — desktop and mobile
☐ Mobile-friendliness
☐ HTTPS / SSL certificate
☐ Canonical tags (correct implementation, no conflicts)
☐ Redirect audit (301 vs 302, chains, loops)
☐ HTTP status codes (find 404s, 500s)
☐ XML sitemap (submitted, accurate, no blocked URLs)
☐ Structured data / Schema markup
☐ Hreflang tags (if multilingual)
☐ Duplicate content check
[Add 5 more ${f.type}-specific technical checks]

**SECTION 2: ON-PAGE SEO**
[20 checklist items covering: title tags, meta descriptions, H1-H6 structure, keyword optimization, image alt text, internal linking, content length, E-E-A-T signals]

**SECTION 3: CONTENT AUDIT**
[15 checklist items: thin content pages, keyword cannibalization, content freshness, pillar/cluster structure, topical authority gaps]

**SECTION 4: OFF-PAGE / AUTHORITY**
[10 checklist items: backlink profile, toxic links, brand mentions, competitor link gaps]

**SECTION 5: ${f.type.toUpperCase()}-SPECIFIC CHECKS**
[10 items specific to this website type — e.g. for e-commerce: product schema, faceted navigation, category page optimization]

**PRIORITIZATION GUIDE**
🔴 Critical (Fix immediately — blocking rankings)
🟡 Important (Fix this month)
🟢 Optimization (Fix when time allows)

**AUDIT TOOLS TO USE**
Free and paid tools for each section of the audit.

**HOW TO USE THIS CHECKLIST**
Step-by-step process for conducting the audit systematically.`,
  },

  // ── BUSINESS ───────────────────────────────────────────────
  {
    id: "swot-analysis",
    name: "SWOT Analysis",
    category: "business",
    categoryLabel: "Business Strategy",
    emoji: "🧩",
    agentId: "nexus",
    description: "Build a comprehensive SWOT analysis with strategic recommendations.",
    fields: [
      { id: "company", label: "Company / Product Name", type: "text", placeholder: "e.g. GreenBite — sustainable meal prep delivery", required: true },
      { id: "industry", label: "Industry / Market", type: "text", placeholder: "e.g. meal kit delivery, B2B software, retail", required: true },
      { id: "context", label: "Business Context", type: "textarea", placeholder: "Current stage, key facts, recent challenges, goals, competitive landscape", required: true },
    ],
    buildPrompt: (f) => `Conduct a comprehensive SWOT analysis.

Company/Product: ${f.company}
Industry: ${f.industry}
Context: ${f.context}

Deliver a thorough strategic analysis:

**SWOT ANALYSIS: ${f.company.toUpperCase()}**

**STRENGTHS** (Internal, positive)
For each strength (minimum 6):
• [Strength] — [Why it's a competitive advantage and how to leverage it]

**WEAKNESSES** (Internal, negative)
For each weakness (minimum 6):
• [Weakness] — [Business impact and how to address or mitigate it]

**OPPORTUNITIES** (External, positive)
For each opportunity (minimum 6):
• [Opportunity] — [How to capture it, timeline, investment required]

**THREATS** (External, negative)
For each threat (minimum 6):
• [Threat] — [Risk level, likelihood, and defensive strategy]

**SWOT MATRIX STRATEGIES**

SO Strategies (Strengths + Opportunities — Grow):
[3 specific strategies that use strengths to capture opportunities]

WO Strategies (Weaknesses + Opportunities — Improve):
[3 specific strategies to overcome weaknesses to seize opportunities]

ST Strategies (Strengths + Threats — Defend):
[3 specific strategies using strengths to counter threats]

WT Strategies (Weaknesses + Threats — Retreat/Protect):
[3 strategies to minimize weaknesses and avoid threats]

**STRATEGIC PRIORITIES** (Top 3 actions to take in the next 90 days based on this analysis)

**KEY METRICS TO TRACK** (How to measure progress on each strategic priority)`,
  },

  {
    id: "okr-framework",
    name: "OKR Framework",
    category: "business",
    categoryLabel: "Business Strategy",
    emoji: "🎯",
    agentId: "nexus",
    description: "Design a quarterly OKR framework with objectives, key results, and initiatives.",
    fields: [
      { id: "company", label: "Company / Team Name", type: "text", placeholder: "e.g. Acme Corp — Marketing Team", required: true },
      { id: "quarter", label: "Quarter / Period", type: "text", placeholder: "e.g. Q1 2025, H1 2025, FY 2025", required: true },
      { id: "goals", label: "Top-Level Goals / Priorities", type: "textarea", placeholder: "What are the most important things to achieve this period? Strategic priorities, challenges to solve, growth targets.", required: true },
      { id: "stage", label: "Company Stage", type: "select", options: ["Early-stage startup", "Growth stage", "Scale-up", "Enterprise / Large company"], defaultVal: "Growth stage" },
    ],
    buildPrompt: (f) => `Design a complete OKR framework.

Company/Team: ${f.company}
Period: ${f.quarter}
Strategic priorities: ${f.goals}
Stage: ${f.stage}

Deliver:

**OKR OVERVIEW**
Brief explanation of how to use this OKR framework and the principles behind it for ${f.company}.

**${f.quarter.toUpperCase()} OKRs**

Create 3–5 Objectives, each with 3–4 Key Results:

**OBJECTIVE 1: [Inspiring, qualitative objective]**
(Why this matters — 2 sentences)

Key Result 1.1: [Specific, measurable, time-bound — starts at X, ends at Y by Z date]
Key Result 1.2: [...]
Key Result 1.3: [...]
Key Result 1.4: [...]

Initiatives (how you'll achieve these KRs):
• [Specific project/action]
• [Specific project/action]
Owner: [Role responsible]
Check-in cadence: [Weekly/Bi-weekly]

[Repeat for Objectives 2–5]

**OKR SCORING GUIDE**
How to score OKRs at the end of the period (0.0–1.0 scale). What score is "good".

**COMMON OKR MISTAKES TO AVOID**
5 specific mistakes relevant to ${f.stage} companies.

**OKR TEMPLATES**
Weekly check-in template
Mid-quarter review template
End-of-quarter retrospective template

**RECOMMENDED TOOLS**
Best OKR tracking tools for ${f.stage} companies.`,
  },

  {
    id: "business-plan-outline",
    name: "Business Plan Outline",
    category: "business",
    categoryLabel: "Business Strategy",
    emoji: "📑",
    agentId: "nexus",
    description: "Generate a comprehensive business plan outline with key sections and content guidance.",
    fields: [
      { id: "business", label: "Business Name & Concept", type: "text", placeholder: "e.g. NutriAI — personalized nutrition coaching app", required: true },
      { id: "industry", label: "Industry / Market", type: "text", placeholder: "e.g. health tech, B2B SaaS, consumer retail", required: true },
      { id: "stage", label: "Business Stage", type: "select", options: ["Idea / Pre-revenue", "Early revenue", "Growth", "Seeking investment"], defaultVal: "Seeking investment" },
      { id: "details", label: "Business Details", type: "textarea", placeholder: "Product/service, target market, revenue model, current traction, funding ask if applicable", required: true },
    ],
    buildPrompt: (f) => `Create a comprehensive business plan outline.

Business: ${f.business}
Industry: ${f.industry}
Stage: ${f.stage}
Details: ${f.details}

Write a complete, investor-ready business plan outline with guidance for each section:

**EXECUTIVE SUMMARY** *(Write this last — summarizes everything)*
Key elements to include + a 200-word draft based on provided details.

**COMPANY OVERVIEW**
- Mission statement (draft one based on context)
- Vision statement
- Company history/founding story
- Legal structure
- Location

**PROBLEM & OPPORTUNITY**
- Problem statement (the pain point in the market)
- Market opportunity (TAM/SAM/SOM framework — how to calculate)
- Why now (market timing, trends, tailwinds)

**SOLUTION**
- Product/service description
- How it works
- Unique value proposition
- Technology/IP/moat

**MARKET ANALYSIS**
- Target market definition
- Market size (TAM/SAM/SOM with methodology)
- Customer persona(s)
- Competitive landscape
- Competitive advantage

**BUSINESS MODEL**
- Revenue streams
- Pricing strategy
- Unit economics (CAC, LTV, margins)
- Sales channels

**GO-TO-MARKET STRATEGY**
- Customer acquisition strategy
- Marketing channels
- Sales process
- Partnership opportunities

**TRACTION** *(especially important for ${f.stage})*
- Key metrics to date
- Growth rate
- Customer/user evidence

**TEAM**
- Founder bios
- Key hires needed
- Advisors

**FINANCIAL PROJECTIONS**
- 3-year P&L (structure + key assumptions)
- Key metrics dashboard
- Funding ask and use of funds (if applicable)

**APPENDIX**
What supporting documents to include.

For each section: provide specific guidance on what to write and what data/evidence will make it compelling.`,
  },

  {
    id: "meeting-agenda",
    name: "Meeting Agenda",
    category: "business",
    categoryLabel: "Business Strategy",
    emoji: "📅",
    agentId: "flow",
    description: "Create a structured, time-boxed meeting agenda that keeps teams focused and productive.",
    fields: [
      { id: "meeting", label: "Meeting Name / Purpose", type: "text", placeholder: "e.g. Q2 Marketing Strategy Review, Product Roadmap Planning, Weekly Team Standup", required: true },
      { id: "duration", label: "Meeting Duration", type: "select", options: ["30 minutes", "45 minutes", "1 hour", "90 minutes", "2 hours", "Half day"], defaultVal: "1 hour" },
      { id: "attendees", label: "Attendees / Roles", type: "text", placeholder: "e.g. CEO, Head of Marketing, Product Lead, 3 sales reps", required: true },
      { id: "goals", label: "Meeting Goals / Decisions Needed", type: "textarea", placeholder: "What must be accomplished by end of this meeting? What decisions need to be made?", required: true },
      { id: "topics", label: "Topics to Cover", type: "textarea", placeholder: "List all topics to discuss (one per line)", required: true },
    ],
    buildPrompt: (f) => `Create a comprehensive meeting agenda.

Meeting: ${f.meeting}
Duration: ${f.duration}
Attendees: ${f.attendees}
Goals: ${f.goals}
Topics: ${f.topics}

Deliver:

**PRE-MEETING SETUP**
- What to send participants 24 hours before
- Pre-read materials checklist
- What each attendee should prepare

**MEETING AGENDA: ${f.meeting.toUpperCase()}**

📅 Duration: ${f.duration}
👥 Attendees: ${f.attendees}
🎯 Goal: [One-sentence goal that defines success for this meeting]
📌 Decision Needed: [Specific decisions to be made]

---

Time-boxed agenda:

[TIME] — **OPENING** (X minutes)
- Welcome & purpose statement (facilitator script: "Today we're here to...")
- Quick check-in (optional — 1 word/emoji describing current status)
- Confirm agenda and parking lot process

[TIME] — **[TOPIC 1]** (X minutes)
- [Specific discussion point]
- [Question to answer]
- [Decision to make]
- Owner: [Role]

[Repeat for all topics from the input, time-boxed to fit ${f.duration}]

[TIME] — **DECISIONS & ACTIONS** (10 minutes)
- Recap all decisions made
- Assign action items (who + what + when)
- Address parking lot items

[TIME] — **CLOSE** (5 minutes)
- Meeting rating (1–5 scale)
- Confirm next meeting/check-in

---

**POST-MEETING: FOLLOW-UP TEMPLATE**
[Ready-to-send meeting summary email template]

**FACILITATION TIPS**
3 specific tips for running this meeting effectively given the goals and attendees.`,
  },

  {
    id: "market-research",
    name: "Market Research Report",
    category: "business",
    categoryLabel: "Business Strategy",
    emoji: "📈",
    agentId: "nexus",
    description: "Generate a structured market research framework and report outline for any industry.",
    fields: [
      { id: "market", label: "Market / Industry to Research", type: "text", placeholder: "e.g. Online fitness apps, B2B cybersecurity, sustainable packaging", required: true },
      { id: "purpose", label: "Research Purpose", type: "text", placeholder: "e.g. Deciding whether to enter this market, validating product idea, seeking investors", required: true },
      { id: "questions", label: "Key Questions to Answer", type: "textarea", placeholder: "What do you need to know? e.g. Market size, key players, pricing, customer pain points", required: true },
    ],
    buildPrompt: (f) => `Create a comprehensive market research report and research framework.

Market: ${f.market}
Research purpose: ${f.purpose}
Key questions: ${f.questions}

Deliver:

**MARKET RESEARCH REPORT OUTLINE**
**Market: ${f.market}**
**Purpose: ${f.purpose}**

**EXECUTIVE SUMMARY** (draft)
Key findings, market opportunity size, and top 3 strategic recommendations.

**MARKET OVERVIEW**
- Market definition and scope
- Market size estimation methodology (TAM → SAM → SOM)
- Market stage (emerging/growing/mature/declining) with evidence
- Key growth drivers and market tailwinds
- Key headwinds and risks

**CUSTOMER ANALYSIS**
- Primary customer segments (3–4 distinct personas)
- For each segment: demographics, psychographics, pain points, buying behavior, decision criteria
- Jobs to be done framework
- Customer acquisition channels in this market

**COMPETITIVE LANDSCAPE**
- Market map (tier 1, 2, 3 competitors)
- For each major player: positioning, pricing, strengths, weaknesses
- Competitive positioning matrix (across 5 key dimensions)
- White space / underserved segments

**MARKET DYNAMICS**
- Porter's Five Forces analysis for ${f.market}
- Key industry trends (3–5 trends shaping the next 3–5 years)
- Regulatory considerations
- Technology disruption threats

**PRICING ANALYSIS**
- Current pricing models in the market
- Pricing psychology and customer willingness to pay
- Recommended pricing approach

**GO-TO-MARKET INSIGHTS**
- How winners in this market acquire customers
- Best channels and marketing approaches
- Partnership and distribution opportunities

**PRIMARY RESEARCH PLAN**
- 10 customer interview questions to validate assumptions
- Survey template (15 questions)
- Where to find research participants

**STRATEGIC RECOMMENDATIONS**
Based on the research framework, specific recommendations addressing: ${f.questions}

**RESEARCH SOURCES TO USE**
[List 10+ specific free and paid sources for researching ${f.market}]`,
  },

  // ── HR ─────────────────────────────────────────────────────
  {
    id: "job-description",
    name: "Job Description",
    category: "hr",
    categoryLabel: "HR & Recruiting",
    emoji: "📋",
    agentId: "scout",
    description: "Write a compelling, inclusive job description that attracts high-quality candidates.",
    fields: [
      { id: "role", label: "Job Title / Role", type: "text", placeholder: "e.g. Senior Product Manager, Full-Stack Engineer, Head of Marketing", required: true },
      { id: "company", label: "Company Name & Brief Description", type: "text", placeholder: "e.g. Acme — Series B SaaS company building HR tools for enterprises", required: true },
      { id: "type", label: "Employment Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Remote", "Hybrid", "On-site"], defaultVal: "Full-time" },
      { id: "responsibilities", label: "Key Responsibilities", type: "textarea", placeholder: "List the main things this person will do (one per line)", required: true },
      { id: "requirements", label: "Requirements & Qualifications", type: "textarea", placeholder: "Must-have skills, experience, qualifications", required: true },
      { id: "niceToHave", label: "Nice-to-Have / Preferred", type: "textarea", placeholder: "Bonus skills or experience that's desirable but not required", required: false },
      { id: "compensation", label: "Compensation Range (optional)", type: "text", placeholder: "e.g. $120K–$150K + equity, DOE", required: false },
    ],
    buildPrompt: (f) => `Write a compelling job description.

Role: ${f.role}
Company: ${f.company}
Type: ${f.type}
Responsibilities: ${f.responsibilities}
Requirements: ${f.requirements}
${f.niceToHave ? `Nice-to-have: ${f.niceToHave}` : ""}
${f.compensation ? `Compensation: ${f.compensation}` : ""}

Write a job description that attracts top talent:

**JOB TITLE:** ${f.role}
**COMPANY:** [Company name]
**LOCATION/TYPE:** ${f.type}
${f.compensation ? `**COMPENSATION:** ${f.compensation}` : ""}

**THE OPPORTUNITY** (3–4 sentences — make them excited, not just informed)
Lead with what makes this role extraordinary. What will they build, lead, or achieve? Why does this role matter to the company's mission?

**ABOUT ${f.company.split("—")[0].trim().toUpperCase()}** (3–4 sentences)
Company description that makes the best candidates want to work there. Culture, stage, mission, what makes it special.

**WHAT YOU'LL DO**
(Action-verb led responsibilities — not just tasks, but impact)
• [Responsibility → Outcome/impact]
[8–10 bullets from the input, rewritten to be compelling]

**WHAT WE'RE LOOKING FOR**
Must-have:
• [Requirements rewritten to be necessary, not wish-list]
[5–7 must-haves]

${f.niceToHave ? `Nice-to-have (bonus points):
• [Nice-to-haves — clearly marked as optional]` : ""}

**WHAT WE OFFER**
[5–8 benefits — go beyond salary. Culture, growth, flexibility, mission, perks]

**OUR HIRING PROCESS**
[4-step transparent process — reduces anxiety, increases applications]

**EQUAL OPPORTUNITY STATEMENT** (inclusive, genuine — not boilerplate)

DEI Note: Review all requirements — flag any that may exclude qualified candidates (degree requirements, years of experience minimums).`,
  },

  {
    id: "interview-questions",
    name: "Interview Questions",
    category: "hr",
    categoryLabel: "HR & Recruiting",
    emoji: "🎤",
    agentId: "scout",
    description: "Create a structured interview guide with behavioral, situational, and technical questions.",
    fields: [
      { id: "role", label: "Role Being Interviewed For", type: "text", placeholder: "e.g. Senior Marketing Manager, DevOps Engineer", required: true },
      { id: "skills", label: "Key Skills / Competencies to Assess", type: "textarea", placeholder: "What are the most important skills, traits, or competencies for this role?", required: true },
      { id: "culture", label: "Company Culture Values", type: "text", placeholder: "e.g. ownership mentality, customer-first, collaborative, moves fast", required: false },
      { id: "stage", label: "Interview Stage", type: "select", options: ["Phone screen (20–30 min)", "First round (45–60 min)", "Final round (90 min)", "Panel interview"], defaultVal: "First round (45–60 min)" },
    ],
    buildPrompt: (f) => `Create a complete structured interview guide.

Role: ${f.role}
Key competencies to assess: ${f.skills}
${f.culture ? `Company values: ${f.culture}` : ""}
Interview stage: ${f.stage}

**INTERVIEW GUIDE: ${f.role.toUpperCase()}**
**Stage:** ${f.stage}

**BEFORE THE INTERVIEW**
- Review checklist (what to read before the candidate arrives)
- What to have ready
- How to open the interview (script for welcome + agenda)

**SECTION 1: OPENING (5 min)**
Ice-breaker questions (2 options):
[Questions that put candidates at ease and reveal communication style]

**SECTION 2: BEHAVIORAL QUESTIONS** (STAR format expected)

For each key competency in "${f.skills}", provide 2 behavioral questions:
"Tell me about a time when…" / "Describe a situation where…"

[Generate questions for each skill/competency — minimum 10 behavioral questions total]

**SECTION 3: SITUATIONAL QUESTIONS**
"What would you do if…" scenarios:
[5 role-specific scenarios that reveal decision-making and judgment]

**SECTION 4: ROLE-SPECIFIC / TECHNICAL**
[5 questions testing specific knowledge, skills, or expertise for ${f.role}]

**SECTION 5: CULTURE FIT**
${f.culture ? `Based on values (${f.culture}):` : "General culture questions:"}
[5 questions that assess alignment with company values]

**SECTION 6: CANDIDATE'S QUESTIONS** (5 min)
Top 5 questions candidates often ask — with notes on ideal vs. red flag responses.

**SCORING RUBRIC**
For each competency: What a 1/2/3/4/5 answer looks like.

**RED FLAGS TO WATCH FOR**
5 warning signs specific to this role.

**CLOSING SCRIPT**
What to say at the end of the interview — next steps, timeline, expectations.`,
  },

  {
    id: "performance-review",
    name: "Performance Review",
    category: "hr",
    categoryLabel: "HR & Recruiting",
    emoji: "⭐",
    agentId: "bloom",
    description: "Write a constructive performance review with balanced feedback and development plans.",
    fields: [
      { id: "employee", label: "Employee Name & Role", type: "text", placeholder: "e.g. Sarah Chen — Marketing Manager", required: true },
      { id: "period", label: "Review Period", type: "text", placeholder: "e.g. Q4 2024, Annual 2024, H1 2025", required: true },
      { id: "strengths", label: "Key Strengths & Achievements", type: "textarea", placeholder: "What did they do well? Specific accomplishments, projects, results", required: true },
      { id: "development", label: "Areas for Growth / Improvement", type: "textarea", placeholder: "What needs improvement? Be specific about behaviors and impact", required: true },
      { id: "goals", label: "Goals for Next Period", type: "textarea", placeholder: "What should they focus on in the next review period?", required: true },
      { id: "rating", label: "Overall Performance Rating", type: "select", options: ["Exceptional", "Exceeds Expectations", "Meets Expectations", "Needs Improvement", "Unsatisfactory"], defaultVal: "Meets Expectations" },
    ],
    buildPrompt: (f) => `Write a comprehensive, constructive performance review.

Employee: ${f.employee}
Review period: ${f.period}
Rating: ${f.rating}
Strengths/achievements: ${f.strengths}
Development areas: ${f.development}
Next period goals: ${f.goals}

**PERFORMANCE REVIEW**
**Employee:** ${f.employee}
**Review Period:** ${f.period}
**Overall Rating:** ${f.rating}

**EXECUTIVE SUMMARY** (3–4 sentences)
An honest, balanced overview of the employee's performance this period.

**STRENGTHS & ACHIEVEMENTS**
For each strength/achievement from the input:
- [Achievement with specific impact — quantify where possible]
- [What behavior led to this success — what to continue/amplify]

[Write 4–6 well-developed strength paragraphs]

**AREAS FOR DEVELOPMENT**
(Constructive, specific, actionable — not vague criticism)
For each development area:
- **[Area]:** [Specific observation about the behavior/gap] → [Impact on team/business] → [What improvement looks like]

[Write 2–4 development areas with SBI model: Situation, Behavior, Impact]

**PERFORMANCE HIGHLIGHTS TABLE**
| Goal Set Last Period | Result Achieved | Rating |
[Fill in key goals vs. actuals]

**GOALS FOR ${f.period.includes("Q") ? "NEXT QUARTER" : "NEXT YEAR"}**
SMART goals based on the input:

Goal 1: [Specific, Measurable, Achievable, Relevant, Time-bound]
- Success metric: [How we'll know this is achieved]
- Support needed: [What the manager will provide]

[3–5 SMART goals]

**DEVELOPMENT PLAN**
Specific actions to address development areas:
- Training/learning: [specific courses, resources, experiences]
- On-the-job practice: [projects, stretch assignments]
- Mentorship/coaching: [who and how often]

**MANAGER COMMITMENTS**
What the manager commits to doing to support this employee's growth.

**OVERALL COMMENTS**
Closing paragraph: acknowledge the whole person, express confidence, look forward.`,
  },

  {
    id: "onboarding-checklist",
    name: "Employee Onboarding Checklist",
    category: "hr",
    categoryLabel: "HR & Recruiting",
    emoji: "✅",
    agentId: "scout",
    description: "Create a comprehensive employee onboarding checklist for a smooth first 90 days.",
    fields: [
      { id: "role", label: "New Hire Role", type: "text", placeholder: "e.g. Sales Development Representative, Software Engineer", required: true },
      { id: "company", label: "Company Name", type: "text", placeholder: "e.g. GrowthPath Inc.", required: true },
      { id: "type", label: "Work Arrangement", type: "select", options: ["In-office", "Remote", "Hybrid"], defaultVal: "Hybrid" },
      { id: "tools", label: "Key Tools & Systems They'll Use", type: "textarea", placeholder: "e.g. Salesforce, Slack, GitHub, Jira, G Suite, Notion", required: false },
      { id: "team", label: "Team / Department", type: "text", placeholder: "e.g. Sales team of 8, Engineering team, Marketing department", required: false },
    ],
    buildPrompt: (f) => `Create a comprehensive employee onboarding checklist.

Role: ${f.role}
Company: ${f.company}
Work type: ${f.type}
${f.tools ? `Tools to learn: ${f.tools}` : ""}
${f.team ? `Team: ${f.team}` : ""}

**EMPLOYEE ONBOARDING PROGRAM: ${f.role.toUpperCase()}**
**Company:** ${f.company}

**PRE-START (1 week before Day 1)**
☐ Send welcome email with Day 1 logistics
☐ Set up all accounts: email, Slack, ${f.tools || "core systems"}
☐ Prepare workstation / ${f.type === "Remote" ? "ship equipment" : "set up desk"}
☐ Schedule 30-min check-in with manager for Day 1
☐ Send "What to expect" document
☐ Assign onboarding buddy
☐ Add to team calendar, Slack channels, email groups
☐ Complete HR paperwork digitally

**DAY 1: WELCOME & ORIENTATION**
Morning:
☐ Welcome from manager (30 min)
☐ Office/virtual tour
☐ Introductions to immediate team
☐ IT setup and tool access verification
☐ Review first-week schedule

Afternoon:
☐ HR orientation: benefits, policies, culture
☐ Read company handbook
☐ Set up communication tools (Slack, email signature)
☐ Lunch with manager or buddy
☐ Day 1 reflection check-in (10 min with manager)

**WEEK 1: FOUNDATIONS**
☐ Meet with each direct team member (15–30 min each)
☐ [Tools list] — complete setup and basic training for each
☐ Review: company mission, values, strategy, roadmap
☐ Shadow 3 relevant team processes/meetings
☐ Review key existing projects and context
☐ Complete compliance training (security, HR policies)
☐ First 1:1 with manager: set 30-60-90 goals
☐ End-of-week check-in: questions? blockers?

**WEEKS 2–4: DEEP DIVE**
☐ Take ownership of first small project/task
☐ Meet with 5 cross-functional stakeholders
☐ Deep dive into [relevant systems/tools]
☐ Understand team KPIs and how role contributes
☐ Learn customer stories (read 5 case studies, join 1 customer call)
☐ Mid-month check-in: How are you feeling? Any gaps?

**DAYS 30–60: CONTRIBUTING**
☐ Lead first project independently
☐ Present something to the team
☐ Identify one process improvement opportunity
☐ 30-day review: formal check-in on progress vs. goals
☐ Get feedback from 3 peers

**DAYS 60–90: FULL PRODUCTIVITY**
☐ Take on full role responsibilities
☐ Mentor/help next new hire if applicable
☐ 90-day review: goals achieved, development plan for next quarter
☐ Contribute to onboarding improvement (feedback on this program)

**ROLE-SPECIFIC TRAINING CHECKLIST** (${f.role})
☐ [Role-specific skill 1]
☐ [Role-specific skill 2]
☐ [Role-specific certification/training]
☐ Shadow 5 relevant [calls/sessions/processes]

**ONBOARDING SUCCESS METRICS**
How to know onboarding was successful:
- By Day 30: [milestone]
- By Day 60: [milestone]
- By Day 90: [milestone]

**MANAGER'S ONBOARDING CHECKLIST**
What the manager must do during each phase.`,
  },
];

// Build lookup map
export const POWERUPS_MAP = Object.fromEntries(POWERUPS.map(p => [p.id, p]));

export const POWERUP_CATEGORIES = [
  { id: "all",       label: "All Power-Ups" },
  { id: "content",   label: "Content Writing" },
  { id: "social",    label: "Social Media" },
  { id: "sales",     label: "Sales" },
  { id: "marketing", label: "Marketing" },
  { id: "support",   label: "Customer Support" },
  { id: "seo",       label: "SEO" },
  { id: "business",  label: "Business Strategy" },
  { id: "hr",        label: "HR & Recruiting" },
];
