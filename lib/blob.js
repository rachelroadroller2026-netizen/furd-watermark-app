// lib/blob.js
// Helpers for working with the processed-image blobs in Vercel Blob.

import { list, del } from "@vercel/blob";

export const PREFIX = "furd-watermark/gallery/";

export function blobToGalleryItem(b) {
  const fileName = b.pathname.split("/").pop() || "image.jpg";
  return {
    id: b.pathname,
    url: b.url,
    filename: fileName,
    size: b.size,
    uploadedAt: b.uploadedAt ? new Date(b.uploadedAt).toISOString() : null,
  };
}

export async function listGallery() {
  const { blobs } = await list({ prefix: PREFIX });
  return blobs
    .map(blobToGalleryItem)
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export async function deleteGalleryItem(id) {
  await del(id);
  return { ok: true };
}
