// app/api/gallery/route.js
// GET: list all processed images. DELETE: remove one by pathname.

import { listGallery, deleteGalleryItem } from "@/lib/blob";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await listGallery();
    return Response.json({ items });
  } catch (err) {
    return Response.json({ error: err.message || "读取失败" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return Response.json({ error: "缺少 id" }, { status: 400 });
    await deleteGalleryItem(id);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message || "删除失败" }, { status: 500 });
  }
}
