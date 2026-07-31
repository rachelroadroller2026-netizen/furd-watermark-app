"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

const COLORS = {
  white: [255, 255, 255],
  black: [0, 0, 0],
};

export default function AdminPage() {
  const [s, setS] = useState({
    text: "FURD Machinery",
    sizePct: 0.024,
    opacity: 0.09,
    density: 0.4,
    angle: -30,
    color: [255, 255, 255],
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setS(d.settings);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));

  async function save() {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setMsg({ type: "ok", text: "已保存，所有员工下次加水印时会使用新样式" });
    } catch (e) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <Nav />
      <div className="wrap">
        <div className="page-title">水印设置</div>
        <div className="page-sub">在这里设置统一的水印样式，保存后所有员工使用同一个样式</div>

        <div className="card">
          {!loaded ? (
            <p style={{ fontSize: 13, color: "var(--mid)" }}>加载中…</p>
          ) : (
            <div className="grid2">
              <div className="field">
                <label>水印文字</label>
                <input type="text" value={s.text} onChange={(e) => set({ text: e.target.value })} />
              </div>
              <div className="field">
                <label>颜色</label>
                <div className="seg">
                  {Object.entries(COLORS).map(([name, c]) => (
                    <button
                      key={name}
                      className={s.color.join(",") === c.join(",") ? "active" : ""}
                      onClick={() => set({ color: c })}
                    >
                      {name === "white" ? "白色" : "黑色"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>透明度（当前 {(s.opacity * 100).toFixed(0)}%）</label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={Math.round(s.opacity * 100)}
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
                  value={s.sizePct * 100}
                  onChange={(e) => set({ sizePct: Number(e.target.value) / 100 })}
                />
              </div>
              <div className="field">
                <label>密度</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={Math.round(s.density * 100)}
                  onChange={(e) => set({ density: Number(e.target.value) / 100 })}
                />
              </div>
              <div className="field">
                <label>倾斜角度（{s.angle}°）</label>
                <input
                  type="range"
                  min={-60}
                  max={0}
                  value={s.angle}
                  onChange={(e) => set({ angle: Number(e.target.value) })}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
            <button className="btn" onClick={save} disabled={saving || !loaded}>
              {saving ? <span className="spinner" /> : null}
              {saving ? "保存中…" : "保存水印设置"}
            </button>
            {msg.text && <span className={`status ${msg.type === "ok" ? "ok" : "err"}`}>{msg.text}</span>}
          </div>
        </div>

        <div className="card" style={{ background: "var(--light)" }}>
          <div style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.8 }}>
            <strong style={{ color: "var(--navy)" }}>提示：</strong>
            水印样式是公司统一的，任何员工保存设置都会全局生效。建议管理员保存一次后，其他员工无需再修改。
            <br />
            当前所有处理后的图片都保存在 Vercel 免费云存储里（免费额度约 10GB，超出后可升级）。
          </div>
        </div>
      </div>
    </main>
  );
}
