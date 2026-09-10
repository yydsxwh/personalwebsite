"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DEFAULT_SECTION_LABELS,
  personPublicNavLinks,
  type PersonProfilePayload,
} from "@andyyyds/person/lib/person-site";
import "./person-site.css";

function navCurrent(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") {
    const path = href.split("#")[0] || href;
    return pathname === path;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  profile: PersonProfilePayload;
  children: React.ReactNode;
  showAdmin?: boolean;
};

export function PersonSiteChrome({ profile, children, showAdmin }: Props) {
  const pathname = usePathname() || "/about/person";
  const [open, setOpen] = useState(false);
  const name = profile.displayName || "个人展示";
  const onHome = pathname === "/about/person";
  const nav = personPublicNavLinks(
    profile.sectionLabels || DEFAULT_SECTION_LABELS,
    onHome ? "home" : "pages",
    profile.navOrder,
  );

  return (
    <div className="person-site">
      <header className="person-top">
        <div className="container person-top-inner">
          <Link href="/about/person" className="person-brand">
            <span className="person-brand-mark" aria-hidden />
            <span>{name}</span>
          </Link>
          <button
            type="button"
            className="person-nav-btn"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "收起菜单" : "菜单"}
          </button>
          <nav
            className={`person-nav${open ? " is-open" : ""}`}
            aria-label="个人展示导航"
          >
            {nav.map((item) => (
              <Link
                key={`${item.match}-${item.href}`}
                href={item.href}
                aria-current={navCurrent(pathname, item.href, item.match) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {showAdmin ? (
              <Link href="/person-admin" onClick={() => setOpen(false)}>
                管理
              </Link>
            ) : null}
          </nav>
        </div>
      </header>
      <div className="container py-6 sm:py-10">{children}</div>
      <footer className="container person-footer">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {name} · 个人展示</p>
          <Link href="/" className="min-h-11 inline-flex items-center">
            返回主站
          </Link>
        </div>
      </footer>
    </div>
  );
}
