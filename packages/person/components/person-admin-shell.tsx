"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SECTION_LABELS,
  navOrderFromAdminColumns,
  normalizeAdminColumnOrder,
  personAdminColumnHref,
  personAdminColumnLabel,
  personAdminPinnedLinks,
  type PersonAdminColumnKey,
  type PersonSectionLabels,
} from "@andyyyds/person/lib/person-site";
import { savePersonAdminProfile } from "@andyyyds/person/lib/person-site-client";
import "./person-site.css";

function moveColumn(order: PersonAdminColumnKey[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) {
    return order;
  }
  const next = [...order];
  const [item] = next.splice(from, 1);
  if (!item) return order;
  next.splice(to, 0, item);
  return next;
}

export function PersonAdminShell({
  children,
  labels = DEFAULT_SECTION_LABELS,
  adminColumnOrder,
  navOrder,
}: {
  children: React.ReactNode;
  labels?: PersonSectionLabels;
  adminColumnOrder?: readonly string[];
  navOrder?: readonly string[];
}) {
  const pathname = usePathname() || "/person-admin";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState(() => normalizeAdminColumnOrder(adminColumnOrder));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const columnsRef = useRef(columns);
  const listRef = useRef<HTMLDivElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const pinned = personAdminPinnedLinks(labels);
  const orderKey = normalizeAdminColumnOrder(adminColumnOrder).join(",");

  columnsRef.current = columns;

  useEffect(() => {
    setColumns(normalizeAdminColumnOrder(adminColumnOrder));
  }, [orderKey, adminColumnOrder]);

  const persistColumns = async (nextOrder: PersonAdminColumnKey[]) => {
    const ordered = normalizeAdminColumnOrder(nextOrder);
    setColumns(ordered);
    columnsRef.current = ordered;
    setSaving(true);
    setError("");
    try {
      await savePersonAdminProfile({
        adminColumnOrder: ordered,
        navOrder: navOrderFromAdminColumns(ordered, navOrder),
      });
      router.refresh();
    } catch (caught) {
      setColumns(normalizeAdminColumnOrder(adminColumnOrder));
      setError(caught instanceof Error ? caught.message : "栏目顺序保存失败");
    } finally {
      setSaving(false);
    }
  };

  const reorder = (from: number, to: number) => {
    const next = moveColumn(columnsRef.current, from, to);
    if (next === columnsRef.current) return;
    void persistColumns(next);
  };
  const reorderRef = useRef(reorder);
  reorderRef.current = reorder;

  useEffect(() => {
    if (dragIndex == null) return;

    const rowAtPoint = (clientY: number) => {
      const rows = listRef.current?.querySelectorAll<HTMLElement>("[data-admin-column]");
      if (!rows?.length) return dragIndex;
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) {
          return Number(row.dataset.adminColumn);
        }
      }
      const first = rows[0]?.getBoundingClientRect();
      const last = rows[rows.length - 1]?.getBoundingClientRect();
      if (first && clientY < first.top) return 0;
      if (last && clientY > last.bottom) return rows.length - 1;
      return dragIndex;
    };

    const onMove = (event: PointerEvent) => {
      event.preventDefault();
      const nextOver = rowAtPoint(event.clientY);
      if (Number.isFinite(nextOver)) setOverIndex(nextOver);
    };

    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const onUp = (event: PointerEvent) => {
      document.body.style.userSelect = previousUserSelect;
      const from = dragIndexRef.current;
      const to = rowAtPoint(event.clientY);
      dragIndexRef.current = null;
      setDragIndex(null);
      setOverIndex(null);
      if (from != null && Number.isFinite(to)) reorderRef.current(from, to);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragIndex]);

  return (
    <div className="person-admin container py-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs tracking-[0.16em] text-[var(--ps-gold)] uppercase">
            Person site
          </p>
          <h1 className="mt-1 text-2xl font-semibold">个人展示后台</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            左侧内容栏目按住手柄就能拖。顺序会同步到前台顶栏和首页。
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
          {pinned.map((link) => {
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
          <p className="person-admin-nav-hint">按住左侧手柄拖动，前台顶栏和首页会跟着变。</p>
          <div
            className={`person-admin-columns${dragIndex != null ? " is-sorting" : ""}`}
            ref={listRef}
          >
            {columns.map((column, index) => {
              const href = personAdminColumnHref(column);
              const current = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <div
                  key={column}
                  data-admin-column={index}
                  className={`person-admin-column-row${dragIndex === index ? " is-dragging" : ""}${overIndex === index ? " is-over" : ""}`}
                  onDragStart={(event) => event.preventDefault()}
                >
                  <button
                    type="button"
                    className="person-admin-column-handle"
                    aria-label={`拖动${personAdminColumnLabel(labels, column)}`}
                    disabled={saving}
                    onDragStart={(event) => event.preventDefault()}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return;
                      event.preventDefault();
                      dragIndexRef.current = index;
                      setDragIndex(index);
                      setOverIndex(index);
                    }}
                  >
                    ⋮⋮
                  </button>
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className="min-h-11 rounded-xl px-3 py-2 text-sm"
                    onClick={() => setOpen(false)}
                  >
                    {personAdminColumnLabel(labels, column)}
                  </Link>
                </div>
              );
            })}
          </div>
          {saving ? <p className="person-admin-nav-status">正在保存栏目顺序…</p> : null}
          {error ? <p className="person-admin-nav-error">{error}</p> : null}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
