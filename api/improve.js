// api/improve.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  try {
    const body = await readJson(req);
    const { fields } = body || {};
    if (!fields) return res.status(400).json({ error: 'Missing fields' });

    // Build your instruction (you can reuse your buildPrompt result as "draft")
    const draft = buildPromptFromFields(fields);

    // Call OpenAI (Chat Completions). Install: `npm i openai`
    // IMPORTANT: Set OPENAI_API_KEY in your Vercel project settings.
    const { OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are a prompt engineer. Rewrite the user's draft prompt into a
clear, concise, high-impact prompt that:
- states role and exact task
- includes only essential context/constraints
- specifies format/tone/length if provided
- avoids revealing chain-of-thought
Return only the improved prompt.`;

    const user = `Draft prompt to improve:\n\n${draft}`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini', // pick any current text-capable model
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.4
    });

    const improved = resp.choices?.[0]?.message?.content?.trim() || '';
    return res.status(200).json({ improved });
  } catch (err) {
    console.error(err);
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
  lines.push(`\n# Guidance\n- Ask up to 3 clarifying questions only if needed.\n- Give brief justifications, no private chain-of-thought.\n- State assumptions first if you must make any.`);
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
