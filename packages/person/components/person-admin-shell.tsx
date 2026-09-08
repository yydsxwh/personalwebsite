"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DEFAULT_SECTION_LABELS,
  personAdminNavLinks,
  type PersonSectionLabels,
} from "@andyyyds/person/lib/person-site";
import "./person-site.css";

export function PersonAdminShell({
  children,
  labels = DEFAULT_SECTION_LABELS,
}: {
  children: React.ReactNode;
  labels?: PersonSectionLabels;
}) {
  const pathname = usePathname() || "/person-admin";
  const [open, setOpen] = useState(false);
  const links = personAdminNavLinks(labels);

  return (
    <div className="person-admin container py-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs tracking-[0.16em] text-[var(--ps-gold)] uppercase">
            Person site
          </p>
          <h1 className="mt-1 text-2xl font-semibold">个人展示后台</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            只管个人展示站。以后换域名时，这一套页面和数据可以整包迁走。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/about/person" className="btn btn-secondary min-h-11 px-4 text-sm">
            查看前台
          </Link>
          <Link href="/studio" className="btn btn-secondary min-h-11 px-4 text-sm">
            全站后台
          </Link>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-secondary mb-3 min-h-11 px-4 text-sm sm:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "收起栏目" : "后台栏目"}
      </button>
      <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
        <nav
          className={`person-admin-nav${open ? " is-open" : ""}`}
          aria-label="个人展示后台导航"
        >
          {links.map((link) => {
            const current = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className="min-h-11 rounded-xl px-3 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
