"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_PERSON_PROFILE,
  DEFAULT_SECTION_LABELS,
  PERSON_ADMIN_NAV_KEYS,
  PERSON_ENTRY_KINDS,
  PERSON_HOME_TITLE_KEYS,
  PERSON_LABEL_MAX,
  normalizeNavOrder,
  type PersonAdminNavKey,
  type PersonHomeTitleKey,
  type PersonProfilePayload,
  type PersonPublicNavKey,
  type PersonSectionLabels,
} from "@andyyyds/person/lib/person-site";
import {
  fetchPersonAdminProfile,
  savePersonAdminProfile,
} from "@andyyyds/person/lib/person-site-client";

const ADMIN_HINT: Record<PersonAdminNavKey, string> = {
  overview: "后台总览",
  profile: "档案页",
  sections: "本页",
  social: "自媒体同步",
};

const NAV_HINT: Record<PersonPublicNavKey, string> = {
  about: "前台顶栏",
  resume: "前台顶栏",
  intro: "前台顶栏",
  projects: "前台顶栏",
  blog: "前台顶栏",
  portfolio: "前台顶栏",
  honors: "前台顶栏",
  life: "前台顶栏",
  photos: "前台顶栏",
  social: "前台顶栏",
};

const HOME_HINT: Record<PersonHomeTitleKey, string> = {
  aboutMe: "首页区块",
  featured: "首页区块",
  contact: "首页区块",
  social: "首页区块",
  honorsGroup: "成绩 + 荣誉合并标题",
  lifeGroup: "实践 + 活动合并标题",
};

function moveNavItem(order: PersonPublicNavKey[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) {
    return order;
  }
  const next = [...order];
  const [item] = next.splice(from, 1);
  if (!item) return order;
  next.splice(to, 0, item);
  return next;
}

function LabelField({
  label,
  hint,
  value,
  saving,
  onChange,
  onSave,
}: {
  label: string;
  hint?: string;
  value: string;
  saving?: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="block text-xs text-[var(--muted)]">
      {label}
      {hint ? <span className="ml-2 text-[11px] opacity-70">{hint}</span> : null}
      <div className="mt-1 flex gap-2">
        <input
          className="field min-h-11 w-full rounded-xl px-3 text-sm text-[var(--ink)]"
          value={value}
          maxLength={PERSON_LABEL_MAX}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="btn btn-secondary min-h-11 shrink-0 px-3 text-sm"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "保存中" : "保存"}
        </button>
      </div>
    </div>
  );
}

export function PersonAdminSectionLabelsForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<PersonProfilePayload>(DEFAULT_PERSON_PROFILE);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    void fetchPersonAdminProfile()
      .then((next) => {
        setProfile(next);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "加载失败");
        setLoading(false);
      });
  }, []);

  const labels = profile.sectionLabels || DEFAULT_SECTION_LABELS;
  const navOrder = normalizeNavOrder(profile.navOrder);
  const navOrderRef = useRef(navOrder);
  navOrderRef.current = navOrder;
  const listRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const setLabels = (next: PersonSectionLabels) => {
    setProfile((current) => ({ ...current, sectionLabels: next }));
  };

  const persistLabels = async (patch: unknown, key: string, message: string) => {
    setError("");
    setSavingKey(key);
    setStatus("保存中…");
    try {
      const saved = await savePersonAdminProfile({ sectionLabels: patch as PersonSectionLabels });
      setProfile(saved);
      router.refresh();
      setStatus(message);
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSavingKey("");
    }
  };

  const onSave = async () => {
    await persistLabels(labels, "all", "已保存，侧栏和前台名称会马上更新");
  };

  const saveAdmin = (key: PersonAdminNavKey) =>
    persistLabels(
      { admin: { [key]: labels.admin[key] } },
      `admin.${key}`,
      `已单独保存「${labels.admin[key] || DEFAULT_SECTION_LABELS.admin[key]}」`,
    );

  const saveKind = (kind: (typeof PERSON_ENTRY_KINDS)[number]) =>
    persistLabels(
      { kinds: { [kind]: labels.kinds[kind] } },
      `kinds.${kind}`,
      `已单独保存「${labels.kinds[kind] || DEFAULT_SECTION_LABELS.kinds[kind]}」`,
    );

  const saveNav = (key: PersonPublicNavKey) =>
    persistLabels(
      { nav: { [key]: labels.nav[key] } },
      `nav.${key}`,
      `已单独保存「${labels.nav[key] || DEFAULT_SECTION_LABELS.nav[key]}」`,
    );

  const saveHome = (key: PersonHomeTitleKey) =>
    persistLabels(
      { home: { [key]: labels.home[key] } },
      `home.${key}`,
      `已单独保存「${labels.home[key] || DEFAULT_SECTION_LABELS.home[key]}」`,
    );

  const persistNavOrder = async (nextOrder: PersonPublicNavKey[]) => {
    const ordered = normalizeNavOrder(nextOrder);
    setError("");
    setSavingKey("navOrder");
    setStatus("保存顺序中…");
    try {
      const saved = await savePersonAdminProfile({ navOrder: ordered });
      setProfile((current) => ({
        ...saved,
        navOrder: navOrderRef.current,
        sectionLabels: current.sectionLabels,
      }));
      setStatus("前台导航和首页栏目顺序已保存");
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "保存顺序失败");
    } finally {
      setSavingKey("");
    }
  };

  const scheduleNavOrderSave = (next: PersonPublicNavKey[]) => {
    navOrderRef.current = next;
    setProfile((current) => ({ ...current, navOrder: next }));
    setStatus("顺序已改，正在保存…");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void persistNavOrder(navOrderRef.current);
    }, 400);
  };

  const reorderNav = (from: number, to: number) => {
    const next = moveNavItem(navOrderRef.current, from, to);
    if (next === navOrderRef.current) return;
    scheduleNavOrderSave(next);
  };
  const reorderNavRef = useRef(reorderNav);
  reorderNavRef.current = reorderNav;

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (dragIndex == null) return;

    const rowAtPoint = (clientY: number) => {
      const rows = listRef.current?.querySelectorAll<HTMLElement>("[data-nav-index]");
      if (!rows?.length) return dragIndex;
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) {
          return Number(row.dataset.navIndex);
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
      if (from != null && Number.isFinite(to)) reorderNavRef.current(from, to);
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

  if (loading) return <p className="text-sm text-[var(--muted)]">加载栏目名称…</p>;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold">{labels.admin.sections}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          每个名称都可以单独改、单独保存。空着则回退默认名。前台顶栏可以拖动改顺序，首页栏目会跟着变。
        </p>
      </div>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">后台侧栏</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {PERSON_ADMIN_NAV_KEYS.map((key) => (
            <LabelField
              key={key}
              label={DEFAULT_SECTION_LABELS.admin[key]}
              hint={ADMIN_HINT[key]}
              value={labels.admin[key]}
              saving={savingKey === `admin.${key}`}
              onChange={(value) =>
                setLabels({ ...labels, admin: { ...labels.admin, [key]: value } })
              }
              onSave={() => void saveAdmin(key)}
            />
          ))}
          {PERSON_ENTRY_KINDS.map((kind) => (
            <LabelField
              key={kind}
              label={DEFAULT_SECTION_LABELS.kinds[kind]}
              hint="后台栏目"
              value={labels.kinds[kind]}
              saving={savingKey === `kinds.${kind}`}
              onChange={(value) =>
                setLabels({ ...labels, kinds: { ...labels.kinds, [kind]: value } })
              }
              onSave={() => void saveKind(kind)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">前台导航顺序</h3>
        <p className="text-sm text-[var(--muted)]">
          按住左边拖动，或用上移 / 下移。这里的顺序同时作用于前台顶栏和首页栏目。想把自媒体靠前，抓住「自媒体」往上拖即可。「管理」始终在最后，不能拖。
        </p>
        <div className={`person-nav-order${dragIndex != null ? " is-sorting" : ""}`} ref={listRef}>
          {navOrder.map((key, index) => (
            <div
              key={key}
              data-nav-index={index}
              className={`person-nav-order-row${dragIndex === index ? " is-dragging" : ""}${overIndex === index ? " is-over" : ""}`}
              onDragStart={(event) => event.preventDefault()}
            >
              <button
                type="button"
                className="person-nav-order-handle"
                aria-label={`拖动调整「${labels.nav[key] || DEFAULT_SECTION_LABELS.nav[key]}」顺序`}
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
              <LabelField
                label={`${index + 1}. ${DEFAULT_SECTION_LABELS.nav[key]}`}
                hint={NAV_HINT[key]}
                value={labels.nav[key]}
                saving={savingKey === `nav.${key}`}
                onChange={(value) =>
                  setLabels({ ...labels, nav: { ...labels.nav, [key]: value } })
                }
                onSave={() => void saveNav(key)}
              />
              <div className="person-nav-order-move">
                <button
                  type="button"
                  className="btn btn-secondary min-h-11 px-3 text-sm"
                  disabled={index === 0}
                  onClick={() => reorderNav(index, index - 1)}
                >
                  上移
                </button>
                <button
                  type="button"
                  className="btn btn-secondary min-h-11 px-3 text-sm"
                  disabled={index === navOrder.length - 1}
                  onClick={() => reorderNav(index, index + 1)}
                >
                  下移
                </button>
              </div>
            </div>
          ))}
        </div>
        {savingKey === "navOrder" || status.includes("顺序") ? (
          <p className="text-sm text-[var(--brand-strong)]">{status || "保存顺序中…"}</p>
        ) : null}
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">首页区块</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {PERSON_HOME_TITLE_KEYS.map((key) => (
            <LabelField
              key={key}
              label={DEFAULT_SECTION_LABELS.home[key]}
              hint={HOME_HINT[key]}
              value={labels.home[key]}
              saving={savingKey === `home.${key}`}
              onChange={(value) =>
                setLabels({ ...labels, home: { ...labels.home, [key]: value } })
              }
              onSave={() => void saveHome(key)}
            />
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-[var(--fire-strong)]">{error}</p> : null}
      {status ? <p className="text-sm text-[var(--brand-strong)]">{status}</p> : null}
      <button type="button" className="btn btn-primary min-h-11 w-fit px-5" onClick={() => void onSave()}>
        保存栏目名称
      </button>
    </div>
  );
}
