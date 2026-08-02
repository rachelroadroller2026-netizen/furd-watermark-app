// lib/blob.js
// Helpers for working with the processed-image blobs in Vercel Blob.

import { list, del, getDownloadUrl } from "@vercel/blob";

export const PREFIX = "furd-watermark/gallery/";

function publicUrl(b) {
  // For a public store the blob URL works directly.
  return b.url;
}

export async function blobToGalleryItem(b) {
  const fileName = b.pathname.split("/").pop() || "image.jpg";
  return {
    id: b.pathname,
    url: publicUrl(b),
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

/**
 * Resolve a signed download URL for a blob. If the store is private, the raw
 * blob URL will 404 for anonymous browsers, so we issue a temporary signed URL
 * via the server-side SDK. If the blob is already public this falls back to the
 * plain URL.
 */
export async function resolveBlobUrl(pathname) {
  try {
    const downloadUrl = await getDownloadUrl(pathname);
    return downloadUrl;
  } catch {
    return pathname;
  }
}
