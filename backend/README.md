# Celyn V1.0 — Backend Deployment (Google Apps Script)

The backend is a single Apps Script file (`Code.gs`) that acts as a serverless
API proxy: it hides your OpenAI/Gemini API key, applies Celyn's system prompt,
and returns a small JSON contract the front-end renders directly.

## 1. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Rename the project to `Celyn V1.0 Backend`.
3. Delete the default `Code.gs` contents and paste in this repo's
   `backend/Code.gs`.
4. Click the gear icon (**Project Settings**) → check **"Show appsscript.json
   manifest file in editor"**, then replace its contents with this repo's
   `backend/appsscript.json`.

## 2. Add your API key as a Script Property

**Project Settings → Script Properties → Add script property**:

| Property | Value |
|---|---|
| `PROVIDER` | `openai` (or `gemini`) |
| `OPENAI_API_KEY` | your `sk-...` key (if using OpenAI) |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` (optional) |
| `GEMINI_API_KEY` | your Gemini key (if using Gemini) |
| `GEMINI_MODEL` | e.g. `gemini-1.5-flash` (optional) |

Never paste API keys into the script source — Script Properties keeps them
out of version control and out of the client.

## 3. Deploy as a Web App

1. **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, authorize the requested permissions, and copy the
   **Web app URL** (ends in `/exec`).

## 4. Connect the front-end

Open the deployed Celyn app, click **⚙️ Settings** in the sidebar, and paste
the Web app URL. It's stored in the browser's `localStorage` — no rebuild or
redeploy needed on the front-end.

## Updating the backend later

Every time you edit `Code.gs` in the Apps Script editor, use
**Deploy → Manage deployments → edit (pencil) → New version** to publish the
change to the same `/exec` URL. Editing the code alone does not update the
live endpoint.

## Notes

- Requests are sent from the browser as `Content-Type: text/plain` (even
  though the body is JSON) specifically to avoid a CORS preflight `OPTIONS`
  request, which Apps Script Web Apps do not support. `Code.gs` parses the
  raw body as JSON regardless of the declared content type.
- `doGet` returns a small health-check JSON payload — useful for the
  "Connected to GAS Backend" status indicator in the sidebar.
