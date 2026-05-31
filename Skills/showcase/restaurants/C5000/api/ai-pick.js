// =====================================================================
//  Vercel Edge Function — /api/ai-pick
//  ---------------------------------------------------------------------
//  Server-side proxy for Gemini so the API key never leaves your account.
//
//  - Reads GEMINI_API_KEY from Vercel env vars (set in dashboard).
//  - Accepts POST { query, candidates } from the browser.
//  - Builds the prompt server-side (clients can't inject system text).
//  - Calls Gemini 1.5 Flash with JSON mode.
//  - Returns { channel_number, reason } back to the client.
//
//  Defense-in-depth:
//    * CORS restricted to the same Vercel deployment (plus *.vercel.app
//      preview deployments). Local dev allowed via ALLOWED_ORIGINS env.
//    * Input size limits (query ≤ 500 chars, ≤ 10 candidates).
//    * No client-supplied prompt text passes through to the model raw.
// ===================================================================*/

export const config = { runtime: 'edge' };

// Allow same-origin + previews; extend via ALLOWED_ORIGINS="a,b,c" env var
function corsHeaders(req) {
  const origin = req.headers.get('origin') || '';
  const allow = new Set([
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    ...(process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  ]);
  // Always allow *.vercel.app (your own deployments + previews)
  const ok = allow.has(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export default async function handler(req) {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405, cors);

  const apiKey = process.env.GEMINI_API_KEY;
  const model  = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  if (!apiKey) {
    return json({
      error: 'GEMINI_API_KEY not configured on the server.',
      hint:  'Add it to .env.local (then `vercel --prod`) or set it in Vercel dashboard → Settings → Environment Variables.',
    }, 500, cors);
  }

  // --- Parse + validate input -------------------------------------------------
  let body;
  try { body = await req.json(); }
  catch { return json({ error: 'Invalid JSON body' }, 400, cors); }

  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  const candidates = Array.isArray(body?.candidates) ? body.candidates.slice(0, 10) : [];

  if (!query || query.length > 500) {
    return json({ error: 'Query must be 1–500 chars.' }, 400, cors);
  }
  if (!candidates.length) {
    return json({ error: 'No candidates supplied.' }, 400, cors);
  }

  // Whitelist candidate fields → defense against prompt injection in metadata
  const safe = candidates.map(c => ({
    number:      Number(c?.number) || 0,
    name:        String(c?.name || '').slice(0, 120),
    category:    String(c?.category || '').slice(0, 60),
    tags:        Array.isArray(c?.tags) ? c.tags.slice(0, 20).map(t => String(t).slice(0, 40)) : [],
    description: String(c?.description || '').slice(0, 300),
  })).filter(c => c.number > 0);

  if (!safe.length) return json({ error: 'No valid candidates.' }, 400, cors);

  // --- Build the prompt (server controls all instructions) --------------------
  const ctx = safe.map((c, i) =>
    `[${i + 1}] number=${c.number} | "${c.name}" (${c.category})\n` +
    `    tags: ${c.tags.join(', ')}\n` +
    `    about: ${c.description}`
  ).join('\n');

  const prompt =
`You are the AI inside a Samsung C5000 LCD TV connected via HDMI 3 to a DishTV set-top box. The user just said:
"${query.replace(/[\r\n]+/g, ' ')}"

Below are the top channels retrieved from the DishTV channel guide. Pick the SINGLE best match.

Channels:
${ctx}

Reply with STRICT JSON ONLY, no markdown:
{"channel_number": <number>, "reason": "<one short sentence, in the user's language>"}`;

  // --- Call Gemini ------------------------------------------------------------
  // Model is configurable via GEMINI_MODEL env var (defaults to 2.5-flash-lite).
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  let upstream;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });
  } catch (e) {
    return json({ error: 'Upstream fetch failed', detail: String(e).slice(0, 200) }, 502, cors);
  }

  if (!upstream.ok) {
    const detail = (await upstream.text()).slice(0, 300);
    return json({ error: `Gemini API ${upstream.status}`, detail }, 502, cors);
  }

  const data = await upstream.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

  let parsed;
  try { parsed = JSON.parse(text); }
  catch { parsed = { channel_number: safe[0].number, reason: 'Fallback (model returned non-JSON).' }; }

  // Validate the pick
  const validNum = Number(parsed?.channel_number);
  if (!safe.find(c => c.number === validNum)) {
    parsed = { channel_number: safe[0].number, reason: 'Fallback (model returned unknown channel).' };
  }
  parsed.reason = String(parsed.reason || '').slice(0, 240);
  parsed.via    = 'server';
  parsed.model  = model;       // helpful for the client-side console log

  return json(parsed, 200, cors);
}
