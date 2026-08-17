// Celyn V1.0 — local persistence for conversation history & analytics.
// Everything lives in localStorage; this is an MVP trial with no user accounts.

const HISTORY_KEY = "celyn.history"; // per-mode chat transcripts
const STATS_KEY = "celyn.stats"; // aggregated analytics

const DEFAULT_STATS = {
  sessions: [], // [{date: 'YYYY-MM-DD', mode, turns}]
  corrections: { Grammar: 0, Tense: 0, Vocabulary: 0, Pronunciation: 0 },
  totalTurns: 0,
  wordsSpoken: 0,
  firstUse: null,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return structuredClone(DEFAULT_STATS);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATS), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATS);
  }
}

export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordTurn({ mode, userText, correction }) {
  const stats = loadStats();
  const today = todayISO();

  if (!stats.firstUse) stats.firstUse = today;

  let todaySession = stats.sessions.find((s) => s.date === today && s.mode === mode);
  if (!todaySession) {
    todaySession = { date: today, mode, turns: 0 };
    stats.sessions.push(todaySession);
  }
  todaySession.turns += 1;

  stats.totalTurns += 1;
  stats.wordsSpoken += userText.trim().split(/\s+/).filter(Boolean).length;

  if (correction && correction.hasError && correction.category) {
    if (!(correction.category in stats.corrections)) {
      stats.corrections[correction.category] = 0;
    }
    stats.corrections[correction.category] += 1;
  }

  saveStats(stats);
  return stats;
}

export function computeStreak(stats) {
  const days = new Set(stats.sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (days.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function last7DaysActivity(stats) {
  const result = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const turns = stats.sessions
      .filter((s) => s.date === iso)
      .reduce((sum, s) => sum + s.turns, 0);
    result.push({ date: iso, turns });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export function loadHistory(mode) {
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY}.${mode}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendHistory(mode, message) {
  const history = loadHistory(mode);
  history.push(message);
  const trimmed = history.slice(-30); // keep last 30 turns per mode
  localStorage.setItem(`${HISTORY_KEY}.${mode}`, JSON.stringify(trimmed));
  return trimmed;
}

export function clearHistory(mode) {
  localStorage.removeItem(`${HISTORY_KEY}.${mode}`);
}
