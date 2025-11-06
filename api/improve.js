// api/improve.js  (Vercel serverless function)
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      goal = "", context = "", persona = "", format = "Free form",
      tone = "", length = "", constraints = "", examples = "", draft = ""
    } = req.body || {};

    const system = `You are a prompt-improvement assistant. Rewrite the user's draft into a crisp, complete prompt.
- Include role, task, context, constraints, output format, tone, length guidance.
- If facts are missing, add 2–3 clearly labeled assumptions.
- Provide brief rationales only when explicitly asked.`;

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
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.3
    });

    const improved = resp.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ improved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
