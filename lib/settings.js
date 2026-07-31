// lib/settings.js
// Watermark settings are stored in a small JSON blob in Vercel Blob so every
// employee sees the same watermark style (set once on the /admin page).

import { list, put } from "@vercel/blob";

const SETTINGS_PATH = "furd-watermark/settings.json";

const DEFAULTS = {
  text: "FURD Machinery",
  sizePct: 0.024,
  opacity: 0.09,
  density: 0.4,
  angle: -30,
  color: [255, 255, 255],
};

function cleanColor(c) {
  if (!Array.isArray(c)) return DEFAULTS.color;
  const nums = c.map(Number);
  if (nums.length !== 3 || nums.some((n) => isNaN(n))) return DEFAULTS.color;
  return nums.map((n) => Math.max(0, Math.min(255, Math.round(n))));
}

export function normalizeSettings(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  const s = {
    text: typeof raw.text === "string" && raw.text.trim() ? raw.text.trim() : DEFAULTS.text,
    sizePct: isFinite(Number(raw.sizePct)) ? Math.min(0.1, Math.max(0.005, Number(raw.sizePct))) : DEFAULTS.sizePct,
    opacity: isFinite(Number(raw.opacity)) ? Math.min(0.9, Math.max(0.01, Number(raw.opacity))) : DEFAULTS.opacity,
    density: isFinite(Number(raw.density)) ? Math.min(1, Math.max(0.05, Number(raw.density))) : DEFAULTS.density,
    angle: isFinite(Number(raw.angle)) ? Math.min(0, Math.max(-60, Number(raw.angle))) : DEFAULTS.angle,
    color: cleanColor(raw.color),
  };
  return s;
}

export async function getSettings() {
  try {
    const { blobs } = await list({ prefix: SETTINGS_PATH });
    if (!blobs.length) return { ...DEFAULTS };
    const res = await fetch(blobs[0].url);
    if (!res.ok) return { ...DEFAULTS };
    const raw = await res.json();
    return normalizeSettings(raw);
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings) {
  const s = normalizeSettings(settings);
  const blob = await put(SETTINGS_PATH, JSON.stringify(s), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
  return { ok: true, url: blob.url, settings: s };
}
