// Celyn V1.0 — "TOEFL Booster" view: exam-style task bank + guided AI practice.
import { TOEFL_SECTIONS } from "../data/toefl.js";
import { createChatPanel } from "../chatPanel.js";

export function renderToeflBooster(root) {
  let panel = null;
  let activeSectionId = TOEFL_SECTIONS[0].id;

  root.innerHTML = `
    <div class="flex h-full">
      <div class="w-full md:w-[380px] shrink-0 border-r border-slate-200 overflow-y-auto p-5 space-y-4">
        <div>
          <h2 class="text-lg font-semibold text-[#1A365D]">TOEFL Booster</h2>
          <p class="text-sm text-slate-500">Exam-style drills across speaking, structure, and academic vocabulary.</p>
        </div>
        <div class="space-y-2" data-role="sections"></div>
      </div>
      <div class="flex-1 min-h-0 flex flex-col">
        <div class="px-6 pt-6 pb-3">
          <h2 class="text-lg font-semibold text-[#1A365D]" data-role="section-title"></h2>
          <p class="text-sm text-slate-500" data-role="section-desc"></p>
        </div>
        <div class="flex-1 min-h-0" data-role="panel"></div>
      </div>
    </div>
  `;

  const sectionsEl = root.querySelector('[data-role="sections"]');

  function renderSections() {
    sectionsEl.innerHTML = TOEFL_SECTIONS.map(
      (s) => `
      <button data-section="${s.id}" class="section-btn w-full text-left rounded-xl border p-3 transition ${
        s.id === activeSectionId ? "border-[#3182CE] bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
      }">
        <p class="text-sm font-semibold text-[#1A365D]">${s.title}</p>
        <p class="text-xs text-slate-500 mt-0.5">${s.description}</p>
      </button>`
    ).join("");

    sectionsEl.querySelectorAll(".section-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSectionId = btn.dataset.section;
        renderSections();
        mountSection();
      });
    });
  }

  function mountSection() {
    const section = TOEFL_SECTIONS.find((s) => s.id === activeSectionId);
    root.querySelector('[data-role="section-title"]').textContent = section.title;
    root.querySelector('[data-role="section-desc"]').textContent = section.description;

    const task = section.tasks[Math.floor(Math.random() * section.tasks.length)];
    const opening = `Let's work on ${section.title}. Here's your task: "${task}" Take your time and respond whenever you're ready.`;

    panel?.destroy();
    panel = createChatPanel({
      mode: "toefl",
      level: section.id,
      openingLine: opening,
      container: root.querySelector('[data-role="panel"]'),
    });
  }

  renderSections();
  mountSection();

  return { destroy: () => panel?.destroy() };
}
