import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, profile, apiKey: clientApiKey } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is missing. Add it to .env.local or settings.' },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    // AI strict instruction for formatting
    const systemInstruction = `You are CreatorAI, an expert content creator coach on the Facet platform. You specialize in YouTube, Instagram, TikTok, and content monetization. The user's profile: niche="${profile.niche}", skills=[${profile.skills?.map((s: any) => s.name).join(', ') || ''}]. Be concise, actionable, and specific. Return ONLY valid JSON matching this structure exactly:
{
  "score": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": {
    "bioRewrite": string,
    "missingSkills": string[],
    "portfolioTips": string[],
    "gigOptimizations": string[],
    "quickWins": string[]
  }
}`;

    const prompt = `${systemInstruction}\n\nAnalyze this profile:
Display Name: ${profile.displayName}
Bio: ${profile.bio}
Niche: ${profile.niche}
Skills: ${JSON.stringify(profile.skills || [])}
Portfolio: ${JSON.stringify(profile.portfolio || [])}
Social Links: ${JSON.stringify(profile.socialLinks || [])}

Provide your comprehensive audit inside the strict JSON format.`;

    const result = await model.generateContent(prompt);
    const resultText = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const auditResult = JSON.parse(resultText);

    // If Firebase Admin is configured, persist the audit to Firestore
    if (userId) {
      const db = getAdminDb();
      if (db) {
        await db.collection('users').doc(userId).collection('audits').add({
          audit: auditResult,
          createdAt: new Date()
        });
      }
    }

    return NextResponse.json(auditResult);

  } catch (error: any) {
    console.error('Audit API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
