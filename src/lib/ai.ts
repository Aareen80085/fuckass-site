import OpenAI from 'openai';

interface ProfileData {
  displayName: string;
  bio: string;
  niche: string;
  skills: Array<{ name: string; level: string }>;
  portfolio: Array<{ title: string; description: string }>;
  socialLinks: Array<{ platform: string; followers?: number; engagementRate?: number }>;
}

interface GigData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  packages: Record<string, { price: number; deliveryDays: number }>;
}

export interface AuditResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    bioRewrite: string;
    missingSkills: string[];
    portfolioTips: string[];
    gigOptimizations: string[];
    quickWins: string[];
  };
}

export interface ContentStrategy {
  weeklyPlan: Array<{ day: string; platform: string; type: string; idea: string; hook: string }>;
  platformStrategies: Record<string, { tips: string[]; bestTime: string; frequency: string }>;
  contentIdeas: Array<{ title: string; description: string; estimatedViews: string }>;
  trendingTopics: string[];
  growthTips: string[];
  captionTemplates: string[];
}

export interface GigOptimization {
  improvedTitle: string;
  improvedDescription: string;
  suggestedTags: string[];
  pricingStrategy: string;
  competitorInsights: string[];
}

// ─── MOCK RESPONSES ─────────────────────────────────────────────────────────

export function getMockAudit(profile: ProfileData): AuditResult {
  const score = Math.min(95, 40 +
    (profile.bio.length > 80 ? 10 : 0) +
    (profile.skills.length * 5) +
    (profile.portfolio.length * 8) +
    (profile.socialLinks.length * 6) +
    (profile.niche ? 10 : 0));

  return {
    score,
    strengths: [
      profile.skills.length > 2 ? `Strong skill set with ${profile.skills.length} listed skills` : null,
      profile.portfolio.length > 0 ? 'Portfolio presence helps build credibility' : null,
      profile.socialLinks.length > 0 ? `Active on ${profile.socialLinks.length} social platform(s)` : null,
      profile.bio.length > 50 ? 'Bio is well-written and descriptive' : null,
    ].filter(Boolean) as string[],
    weaknesses: [
      profile.bio.length < 80 ? 'Bio is too short — clients need more context' : null,
      profile.skills.length < 3 ? 'Too few skills listed — add more relevant tags' : null,
      profile.portfolio.length < 2 ? 'Portfolio is sparse — add more work samples' : null,
      !profile.niche ? 'Niche is unclear — define your specialty' : null,
      profile.socialLinks.length < 2 ? 'Missing social proof — link more platforms' : null,
    ].filter(Boolean) as string[],
    suggestions: {
      bioRewrite: `I'm a ${profile.niche || 'content creator'} specializing in helping brands and creators achieve breakthrough growth. With expertise in ${profile.skills.map(s => s.name).slice(0, 3).join(', ')}, I deliver results that convert viewers into loyal fans. Let's build your audience together.`,
      missingSkills: ['YouTube SEO', 'Content Calendar Planning', 'Analytics & Data', 'Brand Storytelling'].filter(
        s => !profile.skills.some(sk => sk.name.toLowerCase().includes(s.toLowerCase()))
      ).slice(0, 3),
      portfolioTips: [
        'Add 3–5 case studies with before/after metrics (subscriber growth, CTR improvements)',
        'Include a show-reel or compilation video of your best work',
        'Add client testimonials with specific results achieved',
      ],
      gigOptimizations: [
        'Use numbers in your gig title (e.g., "10M+ views client" or "7-day delivery")',
        'Add a video gig intro — gigs with videos get 220% more orders',
        'Use all 5 available gig images with data-driven thumbnail previews',
      ],
      quickWins: [
        'Add a professional profile photo with a clean background',
        'Request reviews from past clients immediately',
        'Enable "Online" status to appear higher in search results',
      ],
    },
  };
}

export function getMockStrategy(profile: ProfileData): ContentStrategy {
  const niche = profile.niche || 'content creation';
  return {
    weeklyPlan: [
      { day: 'Monday', platform: 'YouTube', type: 'Long-form', idea: `Deep-dive: "${niche} mistakes beginners make"`, hook: 'I spent 3 years making these mistakes...' },
      { day: 'Tuesday', platform: 'TikTok', type: 'Short-form', idea: `Quick tip: ${niche} hack in 60 seconds`, hook: 'This one trick changed everything...' },
      { day: 'Wednesday', platform: 'Instagram', type: 'Carousel', idea: `5 ${niche} tools you need in 2025`, hook: 'Save this before you start your next project!' },
      { day: 'Thursday', platform: 'YouTube', type: 'Tutorial', idea: `Step-by-step ${niche} for beginners`, hook: 'By the end of this video, you will...' },
      { day: 'Friday', platform: 'TikTok', type: 'Trend', idea: `POV: Becoming a ${niche} professional`, hook: 'Day 1 vs Day 365...' },
      { day: 'Saturday', platform: 'Instagram', type: 'Story', idea: `Behind the scenes: ${niche} workflow`, hook: 'What my day actually looks like...' },
      { day: 'Sunday', platform: 'YouTube', type: 'Community', idea: `Q&A: Everything about ${niche}`, hook: 'You asked, I answer everything...' },
    ],
    platformStrategies: {
      YouTube: {
        tips: ['Post 2–3x per week for algorithm momentum', 'Use chapters to boost watch time', 'Reply to every comment in the first 24 hours', 'End screens to linked videos boost retention'],
        bestTime: 'Monday, Thursday, Saturday – 2–4 PM EST',
        frequency: '2–3 videos/week',
      },
      Instagram: {
        tips: ['Reels get 3x more reach than static posts', 'Use 3–5 niche-specific hashtags (not mega ones)', 'Stories daily to stay top-of-mind', 'Collab posts with micro-influencers'],
        bestTime: 'Tuesday, Wednesday, Friday – 11 AM–1 PM, 7–9 PM',
        frequency: '4–5 posts/week + Daily stories',
      },
      TikTok: {
        tips: ['First 3 seconds must hook viewers instantly', 'Post 1–3x daily for maximum algorithm exposure', 'Use trending audio with your educational content', 'Duet viral videos in your niche'],
        bestTime: '7–9 AM, 12–3 PM, 7–11 PM (all days)',
        frequency: '1–2 videos/day',
      },
    },
    contentIdeas: [
      { title: `I tried every ${niche} tool for 30 days — here's the truth`, description: 'Honest review format, great for SEO', estimatedViews: '10K–50K' },
      { title: `How I went from 0 to 10K in ${niche} (full breakdown)`, description: 'Success story with actionable steps', estimatedViews: '25K–100K' },
      { title: `The ${niche} strategy nobody talks about`, description: 'Contrarian take on common advice', estimatedViews: '15K–80K' },
      { title: `Day in the life of a ${niche} professional`, description: 'Relatable, behind-the-scenes format', estimatedViews: '8K–40K' },
    ],
    trendingTopics: ['AI in content creation', 'Faceless channel strategies', 'Short-form to long-form funnel', 'Authenticity over production value', 'Creator economy 2.0', 'Revenue diversification'],
    growthTips: [
      'Collab with 3 creators in adjacent niches each month for cross-pollination',
      'Create a content flywheel: Long video → Clips → Stories → Emails',
      'Build an email list from day 1 — you own that audience',
      'Respond to every comment for 48h after posting (algorithm signal)',
      'Pin your best-performing comment to guide new viewers',
    ],
    captionTemplates: [
      '🔥 [BOLD STATEMENT]. Here\'s what they don\'t tell you: [VALUE]. Save this for later! 🔖 #[niche] #[platform]',
      'POV: You just discovered [RESULT]. The secret? [TEASER]. Full video in bio 👆 #[niche]',
      'Stop doing [WRONG THING] and start doing [RIGHT THING] instead. Trust me on this one 💡 Drop a 🙋 if you\'ve been making this mistake',
    ],
  };
}

export function getMockGigOptimization(gig: GigData): GigOptimization {
  return {
    improvedTitle: `I will professionally ${gig.category.toLowerCase()} that ${gig.tags[0] || 'drives results'} for your brand | ${new Date().getFullYear()} Strategy`,
    improvedDescription: `⭐ TOP-RATED ${gig.category.toUpperCase()} SERVICE ⭐\n\nAre you struggling with ${gig.tags[0] || 'your content'}? I'll deliver professional results that actually move the needle.\n\n✅ What you get:\n${gig.tags.map(t => `• Expert ${t} optimization`).join('\n')}\n\n🏆 Why choose me:\n• 100% satisfaction guarantee\n• Fast turnaround\n• Unlimited revisions until perfect\n\nReady to level up? Order now or message me with your project! 🚀`,
    suggestedTags: [
      ...gig.tags.slice(0, 2),
      gig.category.toLowerCase().replace(/\s+/g, '-'),
      `${gig.category.toLowerCase()}-service`,
      'professional',
      'fast-delivery',
      'high-quality',
    ].slice(0, 7),
    pricingStrategy: `Your basic package at $${gig.packages.basic?.price} is competitive. Consider a "starter" package at $15–20 to attract first-time buyers and collect reviews. Premium should be 5–8x your basic price to anchor value.`,
    competitorInsights: [
      'Top performers in this category average 4.9★ with 50+ reviews',
      'Gigs with video introductions get 3x more impressions',
      'Adding "same-day delivery" option for basic can increase conversion by 40%',
    ],
  };
}

// ─── OPENAI API CALLS ─────────────────────────────────────────────────────────

export async function auditProfile(profile: ProfileData, apiKey: string): Promise<AuditResult> {
  try {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = `You are an expert content creator coach. Audit this creator profile and return a JSON object with exactly this structure:
{
  "score": <0-100>,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": {
    "bioRewrite": "...",
    "missingSkills": ["..."],
    "portfolioTips": ["..."],
    "gigOptimizations": ["..."],
    "quickWins": ["..."]
  }
}

Profile:
- Name: ${profile.displayName}
- Niche: ${profile.niche}
- Bio: ${profile.bio}
- Skills: ${profile.skills.map(s => `${s.name} (${s.level})`).join(', ')}
- Portfolio: ${profile.portfolio.length} items
- Social: ${profile.socialLinks.map(s => `${s.platform}@${s.followers || 0} followers`).join(', ')}

Return ONLY valid JSON, no markdown.`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    return JSON.parse(resp.choices[0].message.content || '{}') as AuditResult;
  } catch {
    return getMockAudit(profile);
  }
}

export async function generateContentStrategy(profile: ProfileData, apiKey: string): Promise<ContentStrategy> {
  try {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = `You are a content strategist. Generate a detailed content strategy for a ${profile.niche} creator. Return a JSON object matching this structure exactly (no markdown):
{
  "weeklyPlan": [{"day":"Monday","platform":"YouTube","type":"Long-form","idea":"...","hook":"..."},...7 days],
  "platformStrategies": {
    "YouTube": {"tips":["..."],"bestTime":"...","frequency":"..."},
    "Instagram": {"tips":["..."],"bestTime":"...","frequency":"..."},
    "TikTok": {"tips":["..."],"bestTime":"...","frequency":"..."}
  },
  "contentIdeas": [{"title":"...","description":"...","estimatedViews":"..."},...4 items],
  "trendingTopics": ["...",...6 items],
  "growthTips": ["...",...5 items],
  "captionTemplates": ["...",...3 items]
}`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    return JSON.parse(resp.choices[0].message.content || '{}') as ContentStrategy;
  } catch {
    return getMockStrategy(profile);
  }
}

export async function optimizeGig(gig: GigData, apiKey: string): Promise<GigOptimization> {
  try {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = `You are a Fiverr optimization expert. Improve this gig and return JSON only:
{
  "improvedTitle": "...",
  "improvedDescription": "...",
  "suggestedTags": ["...",...7],
  "pricingStrategy": "...",
  "competitorInsights": ["...",...3]
}
Gig: ${JSON.stringify(gig)}`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    return JSON.parse(resp.choices[0].message.content || '{}') as GigOptimization;
  } catch {
    return getMockGigOptimization(gig);
  }
}

export async function chatWithAI(messages: Array<{ role: 'user' | 'assistant'; content: string }>, profile: ProfileData, apiKey: string): Promise<string> {
  if (!apiKey) {
    // Smart demo responses
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    if (lastMsg.includes('thumbnail')) return 'Great question about thumbnails! The key to a viral thumbnail is the "3-second test" — it needs to communicate value in under 3 seconds. Use contrasting colors, faces with emotion, and bold text (max 5 words). Want me to audit your current thumbnails?';
    if (lastMsg.includes('grow') || lastMsg.includes('subscriber')) return 'Growing your channel comes down to 3 things: **Consistency** (post schedule), **Discoverability** (SEO titles/tags), and **Retention** (hook + pacing). Which area is your biggest challenge right now?';
    if (lastMsg.includes('tiktok')) return 'TikTok rewards velocity — the algorithm requires you to post 1–3x daily to gain traction. Your first 3 seconds are everything. Use trending audio (browse Creative Center for trending sounds), and always end with a CTA. Want a 30-day TikTok growth plan?';
    if (lastMsg.includes('instagram')) return 'Instagram in 2025 is all about Reels. The algorithm prioritizes Reels that get watched 3+ times. Focus on loops — content that makes people re-watch automatically. Carousels also hit above their weight for saves. What\'s your current posting frequency?';
    if (lastMsg.includes('price') || lastMsg.includes('rate')) return 'Pricing as a creator: Start at market rate for your skill level, then raise prices 20–30% after every 10 reviews. The "decoy pricing" strategy — offering 3 tiers — works best. Your premium tier anchors value and often makes your mid tier the bestseller. What services are you pricing?';
    return `Thanks for your message! I'm CreatorAI, your personal content strategist. I can help you with:\n\n• **Profile audits** — Get a score and actionable improvements\n• **Content strategies** — Weekly plans for YouTube, Instagram, TikTok\n• **Gig optimization** — Better titles, descriptions, pricing\n• **Growth tactics** — Proven methods to grow your audience\n\nWhat would you like to focus on? You can also click the buttons above to get a full AI audit or content strategy!`;
  }

  try {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const system = `You are CreatorAI, an expert content creator coach on the Creatify platform. You specialize in YouTube, Instagram, TikTok, and content monetization. The user's profile: niche="${profile.niche}", skills=[${profile.skills.map(s => s.name).join(', ')}]. Be concise, actionable, and specific. Use markdown formatting.`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
      temperature: 0.75,
      max_tokens: 600,
    });

    return resp.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
  } catch (err: any) {
    return `There was an error with the AI: ${err?.message || 'Unknown error'}. Make sure your API key is valid.`;
  }
}
