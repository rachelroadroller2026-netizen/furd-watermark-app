"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import { watermarkImage, uploadImage } from "@/lib/watermark";

const COLORS = {
  white: [255, 255, 255],
  black: [0, 0, 0],
};

export default function HomePage() {
  const [settings, setSettings] = useState({
    text: "FURD Machinery",
    sizePct: 0.024,
    opacity: 0.09,
    density: 0.4,
    angle: -30,
    color: [255, 255, 255],
  });
  const [loaded, setLoaded] = useState(false);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const inputRef = useRef(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));

  function addFiles(list) {
    const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setFiles((prev) => prev.concat(arr));
  }

  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function onDrop(e) {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }

  async function processAll() {
    if (busy || !files.length) return;
    setBusy(true);
    setMsg({ type: "", text: "" });
    let ok = 0,
      fail = 0;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setProgress(`正在处理 ${i + 1} / ${files.length}：${f.name}`);
      try {
        const url = URL.createObjectURL(f);
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = () => rej(new Error("图片读取失败"));
          img.src = url;
        });
        const { blob } = await watermarkImage(img, settings);
        URL.revokeObjectURL(url);
        const base = f.name.replace(/\.[^.]+$/, "") || "image";
        await uploadImage(blob, `${base}_watermarked.jpg`);
        ok++;
      } catch (err) {
        fail++;
        console.error(err);
      }
    }
    setBusy(false);
    setProgress("");
    setMsg(
      fail
        ? { type: "err", text: `完成：成功 ${ok} 张，失败 ${fail} 张` }
        : { type: "ok", text: `完成：${ok} 张图片已加水印并保存到云端图库` }
    );
    setFiles([]);
  }

  return (
    <main>
      <Nav />
      <div className="wrap">
        <div className="page-title">图片批量加水印</div>
        <div className="page-sub">上传图片 → 预览水印效果 → 一键处理并保存到云端共享图库</div>

        <div
          className="drop"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="icon">🖼</div>
          <div className="t">把图片拖到这里，或点击选择</div>
          <div className="s">支持 JPG / PNG 等格式，可一次选多张 · 每张 ≤ 4MB</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {files.length > 0 && (
          <div className="strip">
            {files.map((f, i) => (
              <div className="thumb" key={i}>
                <img src={URL.createObjectURL(f)} alt={f.name} />
                <span className="num">{i + 1}</span>
                <button className="rm" onClick={() => removeFile(i)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {files.length > 0 && (
          <p style={{ fontSize: 12, color: "var(--mid)", marginTop: 10 }}>
            已选择 {files.length} 张
          </p>
        )}

        <div className="card" style={{ marginTop: 22 }}>
          <div className="page-title" style={{ fontSize: 16, marginBottom: 16 }}>
            水印样式（公司统一设置，在「设置」页修改）
          </div>
          {!loaded ? (
            <p style={{ fontSize: 13, color: "var(--mid)" }}>加载中…</p>
          ) : (
            <div className="grid2">
              <div className="field">
                <label>水印文字</label>
                <input
                  type="text"
                  value={settings.text}
                  onChange={(e) => set({ text: e.target.value })}
                />
              </div>
              <div className="field">
                <label>颜色</label>
                <div className="seg">
                  {Object.entries(COLORS).map(([name, c]) => (
                    <button
                      key={name}
                      className={settings.color.join(",") === c.join(",") ? "active" : ""}
                      onClick={() => set({ color: c })}
                    >
                      {name === "white" ? "白色" : "黑色"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>透明度（当前 {(settings.opacity * 100).toFixed(0)}%）</label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={Math.round(settings.opacity * 100)}
                  onChange={(e) => set({ opacity: Number(e.target.value) / 100 })}
                />
              </div>
              <div className="field">
                <label>字号</label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={settings.sizePct * 100}
                  onChange={(e) => set({ sizePct: Number(e.target.value) / 100 })}
                />
              </div>
              <div className="field">
                <label>密度</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={Math.round(settings.density * 100)}
                  onChange={(e) => set({ density: Number(e.target.value) / 100 })}
                />
              </div>
              <div className="field">
                <label>倾斜角度（{settings.angle}°）</label>
                <input
                  type="range"
                  min={-60}
                  max={0}
                  value={settings.angle}
                  onChange={(e) => set({ angle: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <button className="btn" disabled={busy || !files.length} onClick={processAll}>
            {busy ? <span className="spinner" /> : null}
            {busy ? "处理中…" : "开始加水印并保存"}
          </button>
          {progress && <span className="status">{progress}</span>}
          {msg.text && <span className={`status ${msg.type === "ok" ? "ok" : "err"}`}>{msg.text}</span>}
        </div>
      </div>
    </main>
  );
}
