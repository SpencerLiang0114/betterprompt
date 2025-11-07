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
   - The prompt sent to **OpenAI API** is:
   ```bash
cat <<'PROMPT'
You are a prompt engineer. Rewrite the user's draft prompt into a clear, concise, high-impact prompt that:
- states role and exact task
- includes only essential context and constraints
- specifies format/tone/length if provided
- avoids revealing private reasoning
Return only the improved prompt.
PROMPT
   ``` 
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

```

## Sequence Diagram
sequenceDiagram
    autonumber

    actor U as User
    participant F as Browser (Better Prompt UI)
    participant API as /api/improve (Serverless)
    participant OA as OpenAI API

    %% --- Live typing preview (local, free) ---
    U->>F: Type into fields (goal/context/persona/…)
    Note right of F: Debounced input handler
    F->>F: buildPrompt() → local draft
    F-->>U: Show local draft in Output

    %% --- Improve (AI call) ---
    U->>F: Click "Improve Prompt"
    F->>F: preview() (optimistic local draft)
    alt Cross-origin (e.g., GitHub Pages → Vercel)
        F->>API: OPTIONS /api/improve (CORS preflight)
        API-->>F: 200 + CORS headers
    end
    F->>API: POST /api/improve { fields }

    %% --- Server work ---
    API->>API: readJson(req)
    API->>API: buildPromptFromFields(fields) → draft
    API->>API: Validate OPENAI_API_KEY
    API->>OA: chat.completions.create(system + user(draft))
    OA-->>API: 200 { improved }

    %% --- Response to client ---
    API-->>F: 200 { improved } (+ CORS if needed)
    F->>F: Replace Output with improved prompt
    F-->>U: Show AI-revised prompt

    %% --- Error / fallback path ---
    opt Error (network, missing key, 500, etc.)
        API-->>F: Error JSON
        F->>F: Keep local draft; toast("AI service error")
        F-->>U: Local draft remains visible
    end
