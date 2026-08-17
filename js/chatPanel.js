// Celyn V1.0 — reusable chat + voice panel, shared by Free Talk, Grammar & Vocab,
// and TOEFL Booster. Renders into a container and wires mic, TTS, and the backend.
import { VoiceEngine, speechSupported } from "./voice.js";
import { sendTurn, BackendNotConfiguredError } from "./api.js";
import { loadHistory, appendHistory, clearHistory, recordTurn } from "./store.js";

const CATEGORY_ICON = {
  Grammar: "📘",
  Tense: "⏱️",
  Vocabulary: "📚",
  Pronunciation: "🗣️",
};

export function createChatPanel({ mode, level = null, openingLine, container }) {
  let busy = false;
  let voice = null;
  // History is scoped per level/section too, so switching a level doesn't
  // resurrect a different level's transcript under the same top-level mode.
  const historyKey = level ? `${mode}:${level}` : mode;

  container.innerHTML = `
    <div class="flex flex-col h-full">
      <div class="chat-scroll flex-1 overflow-y-auto px-4 py-4 space-y-3" data-role="messages"></div>
      <div class="border-t border-slate-200 bg-white px-4 py-3">
        <div class="flex items-center gap-2">
          <input
            data-role="text-input"
            type="text"
            placeholder="Type a message, or tap the mic and speak..."
            class="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3182CE]"
          />
          <button
            data-role="mic-btn"
            title="${speechSupported.stt ? 'Speak now' : 'Voice input not supported in this browser'}"
            class="shrink-0 h-11 w-11 rounded-full bg-[#3182CE] text-white flex items-center justify-center hover:bg-[#2B6CB0] transition disabled:opacity-40 disabled:cursor-not-allowed"
            ${speechSupported.stt ? "" : "disabled"}
          >🎙️</button>
          <button
            data-role="send-btn"
            class="shrink-0 h-11 w-11 rounded-full bg-[#1A365D] text-white flex items-center justify-center hover:opacity-90 transition"
          >➤</button>
        </div>
        <p data-role="status-line" class="mt-2 text-xs text-slate-400 h-4"></p>
      </div>
    </div>
  `;

  const messagesEl = container.querySelector('[data-role="messages"]');
  const inputEl = container.querySelector('[data-role="text-input"]');
  const micBtn = container.querySelector('[data-role="mic-btn"]');
  const sendBtn = container.querySelector('[data-role="send-btn"]');
  const statusLine = container.querySelector('[data-role="status-line"]');

  function setStatus(text) {
    statusLine.textContent = text;
  }

  function bubble(role, text) {
    const wrap = document.createElement("div");
    if (role === "user") {
      wrap.className = "flex justify-end";
      wrap.innerHTML = `
        <div class="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#3182CE] text-white px-4 py-2.5 text-sm shadow-sm">
          <p class="font-semibold text-xs text-blue-100 mb-0.5">You</p>
          <p>${escapeHtml(text)}</p>
        </div>`;
    } else {
      wrap.className = "flex justify-start";
      wrap.innerHTML = `
        <div class="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-2.5 text-sm shadow-sm">
          <p class="font-semibold text-xs text-[#1A365D] mb-0.5">Celyn (AI Teacher)</p>
          <p class="text-slate-700">${escapeHtml(text)}</p>
        </div>`;
    }
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function correctionCallout(correction) {
    if (!correction || !correction.hasError) return;
    const wrap = document.createElement("div");
    wrap.className = "flex justify-start";
    wrap.innerHTML = `
      <div class="max-w-[80%] rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm shadow-sm">
        <p class="font-semibold text-xs uppercase tracking-wide text-amber-700 mb-1">
          ${CATEGORY_ICON[correction.category] || "✏️"} Grammar Tip${correction.category ? " — " + escapeHtml(correction.category) : ""}
        </p>
        ${correction.original ? `<p class="text-slate-500 line-through text-xs mb-0.5">${escapeHtml(correction.original)}</p>` : ""}
        ${correction.corrected ? `<p class="text-slate-800 font-medium mb-1">${escapeHtml(correction.corrected)}</p>` : ""}
        ${correction.explanation ? `<p class="text-slate-600 text-xs">${escapeHtml(correction.explanation)}</p>` : ""}
      </div>`;
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
    micBtn.disabled = state || !speechSupported.stt;
    inputEl.disabled = state;
  }

  async function handleUserText(text) {
    if (!text.trim() || busy) return;
    inputEl.value = "";
    bubble("user", text);
    appendHistory(historyKey, { role: "user", text });
    setBusy(true);
    setStatus("Celyn is thinking...");

    try {
      const history = loadHistory(historyKey).slice(0, -1); // exclude the turn just sent
      const { reply, correction } = await sendTurn({ mode, level, history, message: text });
      appendHistory(historyKey, { role: "assistant", text: reply });
      correctionCallout(correction);
      bubble("assistant", reply);
      recordTurn({ mode, userText: text, correction });
      setStatus("Speaking...");
      voice?.speak(reply, { onEnd: () => setStatus("") });
    } catch (err) {
      const msg =
        err instanceof BackendNotConfiguredError
          ? err.message
          : `Something went wrong talking to Celyn's backend: ${err.message}`;
      setStatus("");
      bubble("assistant", `⚠️ ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  voice = new VoiceEngine({
    onResult: (transcript) => handleUserText(transcript),
    onListeningChange: (listening) => {
      micBtn.classList.toggle("mic-active", listening);
      setStatus(listening ? "Listening... speak now" : "");
    },
    onError: (err) => setStatus(err === "not-allowed" ? "Microphone access denied." : `Voice error: ${err}`),
  });

  micBtn.addEventListener("click", () => {
    if (voice.listening) voice.stop();
    else voice.start();
  });

  sendBtn.addEventListener("click", () => handleUserText(inputEl.value));
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUserText(inputEl.value);
  });

  // Replay existing history for this mode, or seed with an opening line.
  const history = loadHistory(historyKey);
  if (history.length) {
    history.forEach((m) => bubble(m.role === "user" ? "user" : "assistant", m.text));
  } else if (openingLine) {
    bubble("assistant", openingLine);
    appendHistory(historyKey, { role: "assistant", text: openingLine });
  }

  return {
    reset() {
      clearHistory(historyKey);
      messagesEl.innerHTML = "";
      if (openingLine) {
        bubble("assistant", openingLine);
        appendHistory(historyKey, { role: "assistant", text: openingLine });
      }
    },
    sendText: handleUserText,
    destroy() {
      voice?.cancelSpeak();
    },
  };
}
