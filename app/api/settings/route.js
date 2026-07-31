// app/api/settings/route.js
// GET: current shared watermark settings. POST: update them.

import { getSettings, saveSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getSettings();
  return Response.json({ settings });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await saveSettings(body);
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message || "保存失败" }, { status: 500 });
  }
}
