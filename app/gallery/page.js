"use client";

import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/Nav";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "读取失败");
      setItems(data.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id) {
    if (!confirm("确定删除这张图片？")) return;
    const res = await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    } else {
      alert(data.error || "删除失败");
    }
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  function fmtTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <main>
      <Nav />
      <div className="wrap">
        <div className="page-title">云端图库</div>
        <div className="page-sub">所有已加水印的图片都会出现在这里，点开即可查看和下载</div>

        {loading && <p style={{ color: "var(--mid)", fontSize: 14 }}>加载中…</p>}
        {!loading && err && <p className="status err">{err}</p>}

        {!loading && !err && items.length === 0 && (
          <div className="empty">
            <div className="big">🖼</div>
            还没有图片，去「加水印」页处理一批吧。
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <p style={{ fontSize: 12, color: "var(--mid)", marginBottom: 16 }}>
              共 {items.length} 张
            </p>
            <div className="gallery">
              {items.map((it) => (
                <div className="gcard" key={it.id}>
                  <div className="imgwrap">
                    <img src={it.url} alt={it.filename} loading="lazy" />
                  </div>
                  <div className="meta">
                    <div className="row">
                      <span className="time">{fmtTime(it.uploadedAt)}</span>
                      <span className="size">{fmtSize(it.size)}</span>
                    </div>
                    <div className="row">
                      <a href={it.url} target="_blank" rel="noreferrer" download={it.filename}>
                        打开 / 下载
                      </a>
                      <button
                        className="btn small secondary"
                        onClick={() => remove(it.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
