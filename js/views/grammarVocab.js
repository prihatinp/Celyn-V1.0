// Celyn V1.0 — "Grammar & Vocab (Zero)" view: leveled curriculum + guided practice.
import { LEVELS, getLevel } from "../data/curriculum.js";
import { createChatPanel } from "../chatPanel.js";

const LEVEL_KEY = "celyn.currentLevel";

export function renderGrammarVocab(root) {
  let currentLevelId = localStorage.getItem(LEVEL_KEY) || "zero";
  let panel = null;

  function layout() {
    const level = getLevel(currentLevelId);
    root.innerHTML = `
      <div class="flex h-full">
        <div class="w-full md:w-[380px] shrink-0 border-r border-slate-200 overflow-y-auto p-5 space-y-5">
          <div>
            <h2 class="text-lg font-semibold text-[#1A365D]">Grammar &amp; Vocab</h2>
            <p class="text-sm text-slate-500">Structured lessons from absolute beginner to TOEFL-level.</p>
          </div>

          <div class="flex flex-wrap gap-2" data-role="level-tabs">
            ${LEVELS.map(
              (l) => `
              <button data-level="${l.id}"
                class="level-tab px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  l.id === currentLevelId
                    ? "text-white border-transparent"
                    : "text-slate-600 border-slate-300 hover:border-slate-400"
                }"
                style="${l.id === currentLevelId ? `background:${l.color}` : ""}"
              >${l.label}</button>`
            ).join("")}
          </div>

          <div class="rounded-xl bg-white border border-slate-200 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Grammar Notes</p>
            <div class="space-y-3">
              ${level.grammarNotes
                .map(
                  (g) => `
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="font-semibold text-sm text-[#1A365D]">${g.title}</p>
                  <p class="text-xs text-slate-600 mt-0.5">${g.explanation}</p>
                  <ul class="mt-1.5 space-y-0.5">
                    ${g.examples.map((e) => `<li class="text-xs text-slate-500 italic">"${e}"</li>`).join("")}
                  </ul>
                </div>`
                )
                .join("")}
            </div>
          </div>

          <div class="rounded-xl bg-white border border-slate-200 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Vocabulary</p>
            <div class="grid grid-cols-1 gap-2">
              ${level.vocab
                .map(
                  (v) => `
                <div class="rounded-lg border border-slate-100 p-2.5">
                  <p class="text-sm font-semibold text-slate-800">${v.word}</p>
                  <p class="text-xs text-slate-500">${v.meaning}</p>
                  <p class="text-xs text-[#3182CE] italic mt-0.5">"${v.example}"</p>
                </div>`
                )
                .join("")}
            </div>
          </div>

          <button data-role="practice-btn" class="w-full rounded-full bg-[#3182CE] text-white text-sm font-semibold py-2.5 hover:bg-[#2B6CB0] transition">
            Practice this level with Celyn
          </button>
        </div>

        <div class="flex-1 min-h-0 flex-col hidden md:flex" data-role="panel-wrap">
          <div class="px-6 pt-6 pb-3">
            <h2 class="text-lg font-semibold text-[#1A365D]">Practice — ${level.label}</h2>
            <p class="text-sm text-slate-500">${level.tagline}</p>
          </div>
          <div class="flex-1 min-h-0" data-role="panel"></div>
        </div>
      </div>
    `;

    root.querySelectorAll(".level-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentLevelId = btn.dataset.level;
        localStorage.setItem(LEVEL_KEY, currentLevelId);
        panel?.destroy();
        layout();
      });
    });

    root.querySelector('[data-role="practice-btn"]').addEventListener("click", () => {
      const panelWrap = root.querySelector('[data-role="panel-wrap"]');
      panelWrap.classList.remove("hidden");
      panelWrap.scrollIntoView({ behavior: "smooth" });
    });

    mountPanel(level);
  }

  function mountPanel(level) {
    panel = createChatPanel({
      mode: "grammar",
      level: level.id,
      openingLine: level.starterPrompt,
      container: root.querySelector('[data-role="panel"]'),
    });
  }

  layout();

  return {
    destroy: () => panel?.destroy(),
  };
}
