// app/api/save/route.js
// Receives a processed image body (binary) and stores it in Vercel Blob.

import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const filename = decodeURIComponent(req.headers.get("x-file-name") || "image.jpg");
    const safe = filename.replace(/[^a-zA-Z0-9._\-一-龥]/g, "_");
    const body = await req.arrayBuffer();
    const bytes = Buffer.from(body);

    const { url, pathname } = await put(`furd-watermark/gallery/${safe}`, bytes, {
      access: "public",
      addRandomSuffix: true,
      contentType: req.headers.get("content-type") || "image/jpeg",
    });

    return Response.json({ url, pathname, filename: safe });
  } catch (err) {
    return Response.json({ error: err.message || "上传失败" }, { status: 500 });
  }
}
