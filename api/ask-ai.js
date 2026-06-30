// Vercel Serverless Function — POST /api/ask-ai
// Proxies requests to the Groq API using a server-side-only API key.
// The key (GROQ_API_KEY) is read from Vercel's environment variables
// and is NEVER sent to or visible from the browser.

const SYSTEM_PROMPT = `You are the PGB AI Platform Assistant — an expert on PGB (Primary Group of Builders), a Philippine conglomerate with 10 subsidiaries across 4 SBUs: Construction & Manufacturing (AAC, CSI, PSC), Maritime (AMICI), Real Estate (PHI, PPC), and Human Capital Development (SEAMAN, SKILLS, PSEFI, PSI).

PGB is building its own enterprise AI platform — NOT using Blue Yonder or C3 AI licenses. The platform has 3 layers:
- Layer 1: NetSuite ERP (active, licensed) — single source of truth
- Layer 2: PGB Supply Chain Engine (in-house build) — demand forecasting, warehouse optimization, vessel routing, freight reconciliation, recommendation engine
- Layer 3: PGB AI Intel (in-house build) — predictive maintenance, skills analytics, STEP UP recommender, cross-layer risk aggregator, executive KPI dashboard

Key people: Business Integrator (JR) owns the platform. COO approves budget and go-live. Philippine peso (PHP) is the currency.

Be specific, practical, and reference actual PGB entities (AMICI, AAC, PSC, etc.) when relevant. Keep answers concise and actionable. Use Filipino business context where appropriate.`;

// Simple in-memory rate limiter
const requestLog = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestLog.get(ip) || [];
  const recent = entry.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests — please wait a moment and try again.' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing or invalid prompt.' });
  }
  const safePrompt = prompt.slice(0, 4000);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is not configured with an API key. Contact the facilitator.' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: safePrompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return res.status(502).json({ error: 'AI service returned an error. Please try again.' });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || 'No response received.';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Failed to reach AI service. Please try again.' });
  }
}
