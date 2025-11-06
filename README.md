# 🌟 Better Prompt

**Better Prompt** helps you turn rough ideas into clear, structured, and high-impact prompts for ChatGPT and other AI models.  
It’s a lightweight web app built with pure **HTML + CSS + JavaScript** — no frameworks, no build tools.

🟢 **Live demo:** (https://betterprompt-ten.vercel.app)
🟣 **Powered by:** [OpenAI API](https://platform.openai.com/docs)

---

## 🚀 Features
- ✍️ **Prompt Refinement** – transforms messy text into structured, actionable prompts  
- 🎛️ **Smart Inputs** – goal, context, persona, tone, output format, and constraints  
- ⚙️ **AI Integration** – optional backend using your ChatGPT API key (via Vercel serverless function)  
- 💾 **Copy / Download** – instantly copy or export the improved prompt  
- 🌗 **Modern UI** – clean, responsive, and privacy-safe (no tracking)

---

## 🧭 How it works
1. Fill out the fields on the left (Goal, Context, Persona, etc.).  
2. Click **Improve Prompt**.  
3. The app either:
   - Builds a better prompt locally (if no API connected), or  
   - Sends your data to `/api/improve`, which calls the **OpenAI API** to rewrite it intelligently.  
4. Copy or download the improved prompt.

---

## 🛠️ Local Setup
```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/better-prompt.git
cd better-prompt

# 2. (Optional) serve locally
python3 -m http.server 8080
# then open http://localhost:8080
