# Celyn V1.0 — Native English AI Teacher & Conversational Assistant

Celyn is an AI-powered English learning app that acts as a native-speaking
English teacher: hands-free voice conversation (Alexa-style), active grammar
correction, a leveled curriculum from **Zero** to **Advanced/TOEFL**, and a
dedicated **TOEFL Booster** module — plus local progress analytics.

This is the MVP V1.0 trial build described in the project PRD, implemented
as a lightweight serverless stack:

| Layer | Technology | Role |
|---|---|---|
| Front-end | Static HTML5 + Tailwind CSS (CDN) + vanilla JS (ES modules) | UI, routing, chat rendering |
| Voice engine | Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) | Speech-to-text input, text-to-speech replies |
| Backend proxy | Google Apps Script (`doPost`/`doGet`) | Hides the AI API key, builds the system prompt, calls the LLM |
| AI intelligence | OpenAI API or Gemini API (switchable) | Conversation + grammar correction |

## Project structure

```
index.html                 App shell (loaded by GitHub Pages)
css/styles.css              Small CSS overrides on top of Tailwind
js/
  app.js                     Sidebar nav, view router, settings modal, backend status
  config.js                  Backend URL persisted in localStorage
  store.js                   Chat history + analytics persisted in localStorage
  voice.js                   Web Speech API wrapper (STT + TTS)
  api.js                     fetch() client for the GAS backend
  chatPanel.js                Shared chat+mic UI used by 3 of the 4 views
  data/curriculum.js          Zero -> Advanced grammar & vocab lessons
  data/toefl.js               TOEFL Booster task bank
  views/
    freeTalk.js                "Free Talk (Alexa Mode)"
    grammarVocab.js             "Grammar & Vocab (Zero)"
    toeflBooster.js              "TOEFL Booster"
    progressAnalytics.js         "Progress & Analytics" (charts)
backend/
  Code.gs                     Google Apps Script API proxy + Celyn's system prompt
  appsscript.json              Apps Script manifest (Web App config)
  README.md                    Step-by-step GAS deployment guide
```

## Running locally

No build step — it's static files. Serve the repo root with any static
server, e.g.:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Voice input (`SpeechRecognition`) requires Chrome/Edge and a secure context
(`https://` or `localhost`).

## Deploying

1. **Backend first** — follow `backend/README.md` to deploy the Apps Script
   Web App and get its `/exec` URL.
2. **Front-end** — push this repo to GitHub and enable **GitHub Pages**
   (Settings → Pages → deploy from the branch/root). No build step needed.
3. Open the deployed site, click **⚙️ Settings** in the sidebar, and paste
   the GAS Web App URL. The sidebar status dot turns green once connected.

## How correction works

Every backend reply is a structured JSON object:

```json
{
  "reply": "Great effort! What specific section of TOEFL did you study there?",
  "hasError": true,
  "category": "Tense",
  "original": "I am go to the library yesterday",
  "corrected": "I went to the library yesterday",
  "explanation": "Since you mentioned \"yesterday\", use the past tense."
}
```

The front-end renders `reply` as Celyn's chat bubble and, when `hasError` is
true, a **Grammar Tip** callout above it — matching the PRD mockup — then
speaks `reply` aloud via `SpeechSynthesis`. Every turn is also logged locally
(`js/store.js`) to power the **Progress & Analytics** charts (practice streak,
turns per day, corrections by category).

## Persona / system prompt

Locked server-side in `backend/Code.gs` per the PRD:

> Role: You are Celyn, an expert Native English Speaker and Assistant English
> Teacher. Speak naturally (Alexa-style), actively correct grammar/tense/
> vocabulary errors with a gentle brief correction first, break down complex
> structures and introduce TOEFL-relevant academic vocabulary, and always end
> with an encouraging follow-up question.

Each of the three practice modes (Free Talk, Grammar & Vocab, TOEFL Booster)
layers a mode-specific instruction on top of this core persona — see
`MODE_INSTRUCTIONS` in `backend/Code.gs`.

## Roadmap status (per PRD §5)

- [x] Phase 1 — Front-end prototype with Web Speech API integration
- [x] Phase 2 — GAS backend `doPost(e)` proxy to OpenAI/Gemini
- [x] Phase 3 — Correction rules + Zero→TOEFL curriculum modules
- [ ] Phase 4 — Integration & real-world latency/accuracy testing (do this
      after deploying your own API key — see "Deploying" above)
