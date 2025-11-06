// api/improve.js
// CommonJS to avoid ESM setup issues
const OpenAI = require("openai");

function setCors(res) {
  // Same-origin on Vercel doesn't need CORS. Keep if you might call from another domain later.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // --- Parse body defensively (Vercel usually parses JSON, but we handle strings too)
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  // --- Validate env
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY on server" });
  }

  const {
    goal = "", context = "", persona = "", format = "Free form",
    tone = "", length = "", constraints = "", examples = "", draft = ""
  } = body;

  // Fast fail if nothing was sent
  if (!draft && !goal && !context) {
    return res.status(400).json({ error: "Empty input. Provide at least 'goal' or 'draft'." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are a prompt-improvement assistant. Rewrite the user's draft into a crisp, complete prompt.
- Include role, task, context, constraints, output format, tone, and length guidance.
- If details are missing, add 2–3 clearly labeled assumptions.
- Provide brief rationales only if explicitly asked. Output ONLY the improved prompt.`;

    const user = `
DRAFT PROMPT:
${draft}

STRUCTURED FIELDS:
- Goal: ${goal}
- Context: ${context}
- Persona: ${persona}
- Format: ${format}
- Tone: ${tone}
- Length: ${length}
- Constraints: ${constraints}
- Examples: ${examples}
`.trim();

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.3
    });

    const improved = resp.choices?.[0]?.message?.content?.trim();
    if (!improved) {
      return res.status(502).json({ error: "Empty response from model" });
    }

    return res.status(200).json({ improved });
  } catch (err) {
    console.error("API error:", err?.message || err);
    // Surface a short, useful error back to the browser
    return res.status(500).json({ error: String(err?.message || err) });
  }
};
