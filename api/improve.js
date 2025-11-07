// api/improve.js
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*'; // change '*' to your site domain for security

export default async function handler(req, res) {
  // ✅ Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    // ✅ Read JSON body from request
    const body = await readJson(req);
    const { fields } = body || {};
    if (!fields) {
      res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
      return res.status(400).json({ error: 'Missing fields' });
    }

    // ✅ Build draft prompt from user inputs
    const draft = buildPromptFromFields(fields);

    // ✅ Call OpenAI API
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (!process.env.OPENAI_API_KEY) {
      res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' });
    }

    const system = `You are a prompt engineer. Rewrite the user's draft prompt into a
clear, concise, high-impact prompt that:
- states role and exact task
- includes only essential context and constraints
- specifies format/tone/length if provided
- avoids revealing private reasoning
Return only the improved prompt.`;

    const user = `Draft prompt to improve:\n\n${draft}`;

    const resp = await client.chat.completions.create({
      model: 'gpt-5-nano',  // can change to gpt-4o if you have access
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    });

    const improved = resp.choices?.[0]?.message?.content?.trim() || '';

    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    return res.status(200).json({ improved });

  } catch (err) {
    console.error(err);
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* ---------- helpers ---------- */
function buildPromptFromFields(v) {
  const lines = [];
  if (v.persona) lines.push(`# Role\nYou are ${v.persona}.`);
  if (v.goal) lines.push(`\n# Task\n${v.goal}`);
  if (v.context) lines.push(`\n# Context\n${v.context}`);
  const req = [];
  if (v.format && v.format !== 'Free form') req.push(`Output format: ${v.format}.`);
  if (v.tone) req.push(`Tone/style: ${v.tone}.`);
  if (v.length) req.push(`Length: ${v.length}.`);
  if (v.constraints) {
    req.push(...v.constraints.split(/\n+/).map(s => s.replace(/^•\s*/, '').trim()).filter(Boolean));
  }
  if (req.length) lines.push(`\n# Requirements\n- ${req.join('\n- ')}`);
  lines.push(`\n# Guidance\n- Ask up to 3 clarifying questions only if needed.\n- Give brief justifications, no private reasoning.\n- State assumptions first if you must make any.`);
  if (v.examples) lines.push(`\n# Examples\n${v.examples}`);
  return lines.join('\n');
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (e) { reject(e); }
    });
  });
}
