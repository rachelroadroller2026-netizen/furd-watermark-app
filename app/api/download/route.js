// app/api/download/route.js
// Server-side download: fetch a blob by pathname and return it with a
// Content-Disposition header so the browser always saves the file, regardless
// of whether the store is public or private.

import { getDownloadUrl } from "@vercel/blob";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const pathname = url.searchParams.get("path");
    const name = url.searchParams.get("name") || "image.jpg";
    if (!pathname) return Response.json({ error: "缺少 path 参数" }, { status: 400 });

    // Signed download URL from the SDK (works for both public and private stores).
    const downloadUrl = await getDownloadUrl(pathname);

    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`获取文件失败 (HTTP ${res.status})`);

    const buf = await res.arrayBuffer();
    const safeName = name.replace(/[^a-zA-Z0-9._\-一-龥]/g, "_");

    return new Response(buf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return Response.json({ error: err.message || "下载失败" }, { status: 500 });
  }
}
