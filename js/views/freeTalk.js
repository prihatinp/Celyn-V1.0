// Celyn V1.0 — "Free Talk (Alexa Mode)" view: hands-free open conversation.
import { createChatPanel } from "../chatPanel.js";

export function renderFreeTalk(root) {
  root.innerHTML = `
    <div class="flex flex-col h-full">
      <div class="px-6 pt-6 pb-3">
        <h2 class="text-lg font-semibold text-[#1A365D]">Active Session: Daily Conversation &amp; Instant Correction</h2>
        <p class="text-sm text-slate-500">Tap the mic and talk to Celyn like Alexa — she listens, replies out loud, and gently corrects your English along the way.</p>
      </div>
      <div class="flex-1 min-h-0" data-role="panel"></div>
    </div>
  `;

  const panel = createChatPanel({
    mode: "free-talk",
    openingLine: "Hello! How was your day today? Are you ready to practice for your TOEFL exam?",
    container: root.querySelector('[data-role="panel"]'),
  });

  return { destroy: () => panel.destroy() };
}
