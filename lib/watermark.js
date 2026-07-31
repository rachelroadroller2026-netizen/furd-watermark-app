// Client-side watermark rendering on a <canvas>, then upload the result to
// Vercel Blob via our API route. Kept as a plain JS module used only in
// browser code ("use client" components).

/**
 * Draw a tiled, translucent, rotated watermark onto an image.
 * Returns a Promise<{ blob, type, ext }>.
 *
 * @param {HTMLImageElement} img
 * @param {object} s  settings
 */
export function watermarkImage(img, s) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  // Tile size scales with density: higher density -> smaller tile -> denser repeat.
  const tileW = Math.max(140, Math.round(W * (0.6 - 0.5 * s.density)));
  const tileH = tileW * 0.5;
  const off = document.createElement("canvas");
  off.width = Math.round(tileW);
  off.height = Math.round(tileH);
  const octx = off.getContext("2d");

  // Font size derived from tile height and the size slider.
  const fs = Math.max(10, Math.round(tileH * 0.3 * (0.6 + s.sizePct * 2.4)));
  octx.translate(off.width / 2, off.height / 2);
  octx.rotate((s.angle * Math.PI) / 180);
  octx.fillStyle = `rgba(${s.color.join(",")},${s.opacity})`;
  octx.font = `600 ${fs}px 'PingFang SC','Microsoft YaHei',Arial,sans-serif`;
  octx.textAlign = "center";
  octx.textBaseline = "middle";
  octx.fillText(s.text, 0, 0);

  const pat = ctx.createPattern(off, "repeat");
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("图片编码失败"));
        resolve({ blob, type: "image/jpeg", ext: "jpg" });
      },
      "image/jpeg",
      0.92
    );
  });
}

/**
 * Upload a processed image blob to Vercel Blob via our API route.
 * @returns {Promise<{ url: string, filename: string }>}
 */
export async function uploadImage(blob, filename) {
  let data;
  try {
    const res = await fetch("/api/save", {
      method: "POST",
      body: blob,
      headers: { "x-file-name": encodeURIComponent(filename) },
    });
    data = await res.json();
    if (!res.ok) throw new Error(data.error || `上传失败 (HTTP ${res.status})`);
  } catch (err) {
    if (err.message && err.message.startsWith("上传失败")) throw err;
    throw new Error(`网络错误：${err.message}`);
  }
  return { url: data.url, filename: data.filename };
}
