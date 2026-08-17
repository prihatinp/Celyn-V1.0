// Celyn V1.0 — app shell: sidebar navigation, settings modal, backend status.
import { APP_NAME, APP_VERSION, getBackendUrl, setBackendUrl, hasBackendUrl } from "./config.js";
import { pingBackend } from "./api.js";
import { renderFreeTalk } from "./views/freeTalk.js";
import { renderGrammarVocab } from "./views/grammarVocab.js";
import { renderToeflBooster } from "./views/toeflBooster.js";
import { renderProgressAnalytics } from "./views/progressAnalytics.js";

const VIEWS = {
  "free-talk": { label: "Free Talk (Alexa Mode)", icon: "🗨️", render: renderFreeTalk },
  "grammar-vocab": { label: "Grammar & Vocab (Zero)", icon: "🎒", render: renderGrammarVocab },
  "toefl-booster": { label: "TOEFL Booster", icon: "🏆", render: renderToeflBooster },
  progress: { label: "Progress & Analytics", icon: "📊", render: renderProgressAnalytics },
};

const state = { currentView: "free-talk", activeInstance: null };

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function elFragment(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

function buildShell() {
  const app = document.getElementById("app");
  app.appendChild(
    elFragment(`
    <div class="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <aside class="w-64 shrink-0 bg-[#1A365D] text-white flex flex-col">
        <div class="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <span class="text-2xl">🗣️</span>
          <span class="font-bold text-lg">${APP_NAME}</span>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1" data-role="nav"></nav>
        <div class="px-4 py-4 border-t border-white/10 space-y-2">
          <div class="flex items-center gap-2 text-xs text-white/60">
            <span data-role="status-dot" class="h-2 w-2 rounded-full bg-slate-400"></span>
            <span data-role="status-text">Checking backend...</span>
          </div>
          <button data-role="settings-btn" class="w-full text-left text-xs text-white/70 hover:text-white transition flex items-center gap-1.5">
            ⚙️ Settings
          </button>
          <p class="text-[10px] text-white/30">v${APP_VERSION}</p>
        </div>
      </aside>
      <main class="flex-1 min-w-0 flex flex-col">
        <div class="flex-1 min-h-0" data-role="view-root"></div>
      </main>
    </div>
    <div data-role="settings-modal" class="hidden fixed inset-0 bg-black/40 items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-[90vw] max-w-md p-6">
        <h3 class="text-lg font-semibold text-[#1A365D] mb-1">Backend Settings</h3>
        <p class="text-sm text-slate-500 mb-4">Paste your deployed Google Apps Script Web App URL. See <code>backend/README.md</code> for deployment steps.</p>
        <input data-role="backend-input" type="text" placeholder="https://script.google.com/macros/s/.../exec"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#3182CE]" />
        <div class="flex justify-end gap-2">
          <button data-role="settings-cancel" class="px-4 py-2 text-sm rounded-lg text-slate-500 hover:bg-slate-100">Cancel</button>
          <button data-role="settings-save" class="px-4 py-2 text-sm rounded-lg bg-[#3182CE] text-white hover:bg-[#2B6CB0]">Save</button>
        </div>
      </div>
    </div>
  `)
  );
}

function renderNav() {
  const nav = document.querySelector('[data-role="nav"]');
  nav.innerHTML = "";
  Object.entries(VIEWS).forEach(([key, v]) => {
    const btn = el(`
      <button data-nav="${key}" class="nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        key === state.currentView ? "bg-[#3182CE] text-white" : "text-white/80 hover:bg-white/10"
      }">
        <span>${v.icon}</span><span>${v.label}</span>
      </button>
    `);
    btn.addEventListener("click", () => switchView(key));
    nav.appendChild(btn);
  });
}

function switchView(key) {
  if (state.currentView === key && state.activeInstance) return;
  state.activeInstance?.destroy?.();
  state.currentView = key;
  renderNav();
  const root = document.querySelector('[data-role="view-root"]');
  root.innerHTML = "";
  state.activeInstance = VIEWS[key].render(root);
}

async function refreshBackendStatus() {
  const dot = document.querySelector('[data-role="status-dot"]');
  const text = document.querySelector('[data-role="status-text"]');
  if (!hasBackendUrl()) {
    dot.className = "h-2 w-2 rounded-full bg-slate-400";
    text.textContent = "Backend not configured";
    return;
  }
  text.textContent = "Checking backend...";
  const ok = await pingBackend();
  dot.className = `h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`;
  text.textContent = ok ? "Connected to GAS Backend" : "Backend unreachable";
}

function wireSettings() {
  const modal = document.querySelector('[data-role="settings-modal"]');
  const input = document.querySelector('[data-role="backend-input"]');
  const open = () => {
    input.value = getBackendUrl();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };
  const close = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };
  document.querySelector('[data-role="settings-btn"]').addEventListener("click", open);
  document.querySelector('[data-role="settings-cancel"]').addEventListener("click", close);
  document.querySelector('[data-role="settings-save"]').addEventListener("click", () => {
    setBackendUrl(input.value);
    close();
    refreshBackendStatus();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  if (!hasBackendUrl()) setTimeout(open, 400);
}

function init() {
  buildShell();
  renderNav();
  wireSettings();
  refreshBackendStatus();
  state.activeInstance = VIEWS[state.currentView].render(document.querySelector('[data-role="view-root"]'));
}

document.addEventListener("DOMContentLoaded", init);
