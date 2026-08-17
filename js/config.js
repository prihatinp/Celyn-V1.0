// Celyn V1.0 — runtime configuration
// The GAS Web App URL is not baked in at build time (there is no build step —
// this is a static GitHub Pages site) so it is stored in localStorage and can
// be set from the in-app Settings panel (gear icon, bottom of the sidebar).

const STORAGE_KEY = "celyn.backendUrl";

export function getBackendUrl() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setBackendUrl(url) {
  localStorage.setItem(STORAGE_KEY, url.trim());
}

export function hasBackendUrl() {
  return getBackendUrl().length > 0;
}

export const APP_NAME = "Celyn AI";
export const APP_VERSION = "1.0.0-mvp";
