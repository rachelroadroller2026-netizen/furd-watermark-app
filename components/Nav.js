"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const items = [
    { href: "/", label: "加水印" },
    { href: "/gallery", label: "图库" },
    { href: "/admin", label: "设置" },
  ];
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="mark">F</span>
        FURD Watermark
      </Link>
      <nav>
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={path === it.href ? "active" : ""}>
            {it.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
