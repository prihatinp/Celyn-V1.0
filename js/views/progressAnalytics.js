// Celyn V1.0 — "Progress & Analytics" view: stats + charts from local session data.
import { loadStats, computeStreak, last7DaysActivity } from "../store.js";

// Categorical palette (validated, fixed adjacent order) — see dataviz skill.
const CATEGORY_COLOR = {
  Grammar: "#2a78d6", // slot 1 blue
  Tense: "#eb6834", // slot 2 orange
  Vocabulary: "#1baf7a", // slot 3 aqua
  Pronunciation: "#eda100", // slot 4 yellow
};
const SEQUENTIAL_BLUE = "#3987e5"; // step 400
const INK_PRIMARY = "#0b0b0b";
const INK_SECONDARY = "#52514e";
const INK_MUTED = "#898781";
const GRIDLINE = "#e1e0d9";

function fmtDay(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
}

function statTile(label, value, sub) {
  return `
    <div class="rounded-xl bg-white border border-slate-200 p-4">
      <p class="text-xs font-medium text-slate-400">${label}</p>
      <p class="text-2xl font-bold text-[#1A365D] mt-1">${value}</p>
      ${sub ? `<p class="text-xs text-slate-400 mt-0.5">${sub}</p>` : ""}
    </div>`;
}

function activityChart(days) {
  const w = 560, h = 180, padL = 28, padB = 24, padT = 12, padR = 12;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const max = Math.max(1, ...days.map((d) => d.turns));
  const barW = plotW / days.length;
  const gap = 6;

  const bars = days
    .map((d, i) => {
      const barH = (d.turns / max) * plotH;
      const x = padL + i * barW + gap / 2;
      const y = padT + plotH - barH;
      const bw = barW - gap;
      return `
        <g class="bar-group" data-tip="${fmtDay(d.date)}: ${d.turns} turn${d.turns === 1 ? "" : "s"}">
          <rect x="${x}" y="${y}" width="${bw}" height="${Math.max(barH, d.turns > 0 ? 3 : 0)}" rx="4" fill="${SEQUENTIAL_BLUE}" />
          <text x="${x + bw / 2}" y="${h - padB + 14}" text-anchor="middle" font-size="10" fill="${INK_MUTED}">${fmtDay(d.date)}</text>
        </g>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-auto" role="img" aria-label="Practice turns over the last 7 days">
      <line x1="${padL}" y1="${padT + plotH}" x2="${w - padR}" y2="${padT + plotH}" stroke="${GRIDLINE}" stroke-width="1" />
      ${bars}
    </svg>`;
}

function categoryChart(corrections) {
  const entries = Object.entries(corrections).filter(([, v]) => v >= 0);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const rowH = 34;
  const w = 560, h = entries.length * rowH + 10;
  const labelW = 110, padR = 40;

  const rows = entries
    .map(([cat, val], i) => {
      const barMaxW = w - labelW - padR;
      const barW = (val / max) * barMaxW;
      const y = i * rowH + 8;
      const color = CATEGORY_COLOR[cat] || "#4a3aa7";
      return `
        <g>
          <text x="${labelW - 10}" y="${y + 14}" text-anchor="end" font-size="12" fill="${INK_SECONDARY}">${cat}</text>
          <rect x="${labelW}" y="${y}" width="${Math.max(barW, val > 0 ? 4 : 0)}" height="16" rx="4" fill="${color}" />
          <text x="${labelW + barW + 8}" y="${y + 13}" font-size="12" fill="${INK_PRIMARY}" font-weight="600">${val}</text>
        </g>`;
    })
    .join("");

  return `<svg viewBox="0 0 ${w} ${h}" class="w-full h-auto" role="img" aria-label="Corrections by category">${rows}</svg>`;
}

export function renderProgressAnalytics(root) {
  const stats = loadStats();
  const streak = computeStreak(stats);
  const days = last7DaysActivity(stats);
  const totalCorrections = Object.values(stats.corrections).reduce((a, b) => a + b, 0);
  const totalSessions = stats.sessions.length;

  root.innerHTML = `
    <div class="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h2 class="text-lg font-semibold text-[#1A365D]">Progress &amp; Analytics</h2>
        <p class="text-sm text-slate-500">Your practice activity, tracked locally on this device.</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        ${statTile("Practice Streak", `${streak} day${streak === 1 ? "" : "s"}`, streak > 0 ? "Keep it up!" : "Start today")}
        ${statTile("Total Turns", stats.totalTurns, "conversation exchanges")}
        ${statTile("Corrections Given", totalCorrections, "instant feedback moments")}
        ${statTile("Words Spoken", stats.wordsSpoken, "in your responses")}
      </div>

      <div class="rounded-xl bg-white border border-slate-200 p-5">
        <p class="text-sm font-semibold text-[#1A365D] mb-1">Last 7 Days</p>
        <p class="text-xs text-slate-400 mb-3">Turns practiced per day, across all modes.</p>
        ${totalSessions ? activityChart(days) : emptyState("No sessions yet — start a conversation with Celyn to see activity here.")}
      </div>

      <div class="rounded-xl bg-white border border-slate-200 p-5">
        <p class="text-sm font-semibold text-[#1A365D] mb-1">Corrections by Category</p>
        <p class="text-xs text-slate-400 mb-3">Where Celyn is helping you improve most.</p>
        ${totalCorrections ? categoryChart(stats.corrections) : emptyState("No corrections recorded yet — great job, or just getting started!")}
        ${totalCorrections ? legend() : ""}
      </div>

      <details class="text-xs text-slate-400">
        <summary class="cursor-pointer select-none">View as table</summary>
        <table class="mt-2 w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="py-1 pr-4">Category</th><th class="py-1">Count</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(stats.corrections)
              .map(([k, v]) => `<tr class="border-b border-slate-100"><td class="py-1 pr-4">${k}</td><td class="py-1">${v}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </details>
    </div>
  `;

  function emptyState(text) {
    return `<p class="text-sm text-slate-400 py-8 text-center">${text}</p>`;
  }

  function legend() {
    const items = Object.keys(stats.corrections)
      .map(
        (cat) => `
        <span class="inline-flex items-center gap-1.5 text-xs text-slate-500 mr-4">
          <span class="inline-block h-2.5 w-2.5 rounded-full" style="background:${CATEGORY_COLOR[cat] || "#4a3aa7"}"></span>${cat}
        </span>`
      )
      .join("");
    return `<div class="mt-3 flex flex-wrap">${items}</div>`;
  }

  return { destroy() {} };
}
