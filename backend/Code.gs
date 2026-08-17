/**
 * Celyn V1.0 — Google Apps Script backend proxy.
 *
 * Deployed as a Web App, this hides the OpenAI/Gemini API key from the
 * static GitHub Pages front-end, applies Celyn's persona/system prompt,
 * and returns a small structured JSON contract the UI renders directly
 * (reply text + an optional grammar/vocab correction callout).
 *
 * Setup: Project Settings > Script Properties, add:
 *   PROVIDER        "openai" or "gemini"        (default: "openai")
 *   OPENAI_API_KEY  sk-...                        (required if PROVIDER=openai)
 *   OPENAI_MODEL    e.g. "gpt-4o-mini"             (optional, has a default)
 *   GEMINI_API_KEY  ...                            (required if PROVIDER=gemini)
 *   GEMINI_MODEL    e.g. "gemini-1.5-flash"        (optional, has a default)
 *
 * Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 */

var CORE_PERSONA = [
  "Role: You are Celyn, an expert Native English Speaker and Assistant English Teacher.",
  "",
  "Behavior & Tone:",
  "1. Speak in natural, engaging, and polite English (Alexa-style conversation).",
  "2. Active Correction: If the user makes a grammar, verb-tense, or vocabulary error, provide a gentle, brief correction first.",
  "3. TOEFL Mastery: Break down complex sentence structures, explain verb transformations, and introduce academic vocabulary relevant to TOEFL.",
  "4. Keep conversations flowing by ending responses with an encouraging follow-up question.",
].join("\n");

var MODE_INSTRUCTIONS = {
  "free-talk":
    "Current mode: Free Talk (hands-free, Alexa-style). Have a natural open conversation. Correct errors as they come up, but keep the overall tone casual and encouraging.",
  grammar:
    "Current mode: Grammar & Vocab practice. Adjust your vocabulary and sentence complexity to the student's level (given below). Be extra patient and explicit about *why* a correction is needed — this is a guided lesson, not free chat.",
  toefl:
    "Current mode: TOEFL Booster. Respond with exam-appropriate rigor: academic vocabulary, complex sentence structures, and TOEFL-relevant feedback. Point out anything that would cost points in an actual TOEFL speaking/writing response.",
};

var OUTPUT_CONTRACT = [
  "You MUST respond with ONLY a single valid JSON object (no markdown fences, no prose outside the JSON) matching exactly this shape:",
  "{",
  "  \"reply\": string,               // Celyn's natural spoken reply, ending with an encouraging follow-up question",
  "  \"hasError\": boolean,           // true if the user's last message had a grammar/tense/vocabulary/pronunciation issue worth flagging",
  "  \"category\": string|null,       // one of \"Grammar\", \"Tense\", \"Vocabulary\", \"Pronunciation\" — or null if hasError is false",
  "  \"original\": string|null,       // the exact problematic phrase from the user, or null",
  "  \"corrected\": string|null,      // the corrected version of that phrase, or null",
  "  \"explanation\": string|null     // one short, friendly sentence explaining the fix, or null",
  "}",
].join("\n");

function buildSystemPrompt_(mode, level) {
  var parts = [CORE_PERSONA, "", MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS["free-talk"]];
  if (level) {
    parts.push("Student level: " + level + ". Calibrate vocabulary and grammar complexity accordingly.");
  }
  parts.push("", OUTPUT_CONTRACT);
  return parts.join("\n");
}

function doGet(e) {
  return jsonOutput_({ status: "ok", service: "Celyn V1.0 Backend", time: new Date().toISOString() });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput_({ error: "Empty request body." });
    }
    var body = JSON.parse(e.postData.contents);
    var mode = body.mode || "free-talk";
    var level = body.level || null;
    var history = Array.isArray(body.history) ? body.history : [];
    var message = String(body.message || "").trim();

    if (!message) {
      return jsonOutput_({ error: "Missing 'message' in request." });
    }

    var systemPrompt = buildSystemPrompt_(mode, level);
    var provider = (getProp_("PROVIDER") || "openai").toLowerCase();

    var raw =
      provider === "gemini"
        ? callGemini_(systemPrompt, history, message)
        : callOpenAI_(systemPrompt, history, message);

    var parsed = parseModelJson_(raw);
    return jsonOutput_({
      reply: parsed.reply || raw,
      correction: {
        hasError: !!parsed.hasError,
        category: parsed.category || null,
        original: parsed.original || null,
        corrected: parsed.corrected || null,
        explanation: parsed.explanation || null,
      },
    });
  } catch (err) {
    return jsonOutput_({ error: "Backend error: " + err.message });
  }
}

function parseModelJson_(raw) {
  try {
    // Defensively strip markdown code fences if the model added them anyway.
    var cleaned = String(raw).trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "");
    return JSON.parse(cleaned);
  } catch (e) {
    return { reply: raw, hasError: false };
  }
}

function callOpenAI_(systemPrompt, history, message) {
  var apiKey = getProp_("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set in Script Properties.");
  var model = getProp_("OPENAI_MODEL") || "gpt-4o-mini";

  var messages = [{ role: "system", content: systemPrompt }];
  history.forEach(function (turn) {
    messages.push({ role: turn.role === "user" ? "user" : "assistant", content: String(turn.text || "") });
  });
  messages.push({ role: "user", content: message });

  var res = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + apiKey },
    muteHttpExceptions: true,
    payload: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  var data = JSON.parse(res.getContentText());
  if (data.error) throw new Error(data.error.message || "OpenAI API error");
  return data.choices[0].message.content;
}

function callGemini_(systemPrompt, history, message) {
  var apiKey = getProp_("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in Script Properties.");
  var model = getProp_("GEMINI_MODEL") || "gemini-1.5-flash";

  var contents = [];
  history.forEach(function (turn) {
    contents.push({ role: turn.role === "user" ? "user" : "model", parts: [{ text: String(turn.text || "") }] });
  });
  contents.push({ role: "user", parts: [{ text: message }] });

  var url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    model +
    ":generateContent?key=" +
    apiKey;

  var res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: contents,
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
    }),
  });

  var data = JSON.parse(res.getContentText());
  if (data.error) throw new Error(data.error.message || "Gemini API error");
  return data.candidates[0].content.parts[0].text;
}

function getProp_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
