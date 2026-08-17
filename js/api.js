// Celyn V1.0 — client for the Google Apps Script backend proxy.
import { getBackendUrl } from "./config.js";

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("Backend URL is not configured. Open Settings and paste your GAS Web App URL.");
    this.name = "BackendNotConfiguredError";
  }
}

/**
 * Sends a chat turn to the GAS proxy.
 * @param {{mode: string, level?: string, history: Array<{role:string, text:string}>, message: string}} payload
 * @returns {Promise<{reply: string, correction: {hasError: boolean, category: ?string, original: ?string, corrected: ?string, explanation: ?string}}>}
 */
export async function sendTurn(payload) {
  const url = getBackendUrl();
  if (!url) throw new BackendNotConfiguredError();

  // Sent as text/plain to avoid a CORS preflight (Google Apps Script Web
  // Apps do not implement OPTIONS), the body is still JSON on the wire.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Backend responded with HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return {
    reply: data.reply || "",
    correction: data.correction || { hasError: false, category: null, original: null, corrected: null, explanation: null },
  };
}

export async function pingBackend() {
  const url = getBackendUrl();
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
