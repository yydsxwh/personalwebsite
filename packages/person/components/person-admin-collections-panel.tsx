"use client";

import { useEffect, useState } from "react";
import {
  type PersonCollectionPayload,
  type PersonEntryKind,
} from "@andyyyds/person/lib/person-site";
import {
  createPersonAdminCollection,
  deletePersonAdminCollection,
  fetchPersonAdminCollections,
  savePersonAdminCollection,
} from "@andyyyds/person/lib/person-site-client";
import { PersonImageField } from "@andyyyds/person/components/person-image-field";

function emptyDraft(kind: PersonEntryKind): Partial<PersonCollectionPayload> {
  return {
    kind,
    title: "",
    summary: "",
    coverUrl: "",
    published: true,
    sortOrder: 0,
  };
}

export function PersonAdminCollectionsPanel({
  kind,
  label,
  onChange,
}: {
  kind: PersonEntryKind;
  label: string;
  onChange?: (items: PersonCollectionPayload[]) => void;
}) {
  const [items, setItems] = useState<PersonCollectionPayload[]>([]);
  const [draft, setDraft] = useState<Partial<PersonCollectionPayload>>(emptyDraft(kind));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    const next = await fetchPersonAdminCollections(kind);
    setItems(next);
    onChange?.(next);
  };

  useEffect(() => {
    setDraft(emptyDraft(kind));
    setEditingId(null);
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "加载合集失败");
    });
  }, [kind]);

  const persist = async (next: Partial<PersonCollectionPayload>) => {
    const payload = { ...next, kind };
    if (editingId) await savePersonAdminCollection(editingId, payload);
    else await createPersonAdminCollection(payload);
    await load();
    setDraft(emptyDraft(kind));
    setEditingId(null);
  };

  const onSave = async () => {
    setError("");
    setStatus("保存中…");
    try {
      await persist(draft);
      setStatus("合集已保存");
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "保存合集失败");
    }
  };

  const move = async (index: number, to: number) => {
    const current = items[index];
    const target = items[to];
    if (!current || !target) return;
    setError("");
    try {
      await savePersonAdminCollection(current.id, { ...current, sortOrder: target.sortOrder });
      await savePersonAdminCollection(target.id, { ...target, sortOrder: current.sortOrder });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "调整顺序失败");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("删除这个合集？里面的笔记不会删，只是不再属于这个合集。")) return;
    try {
      await deletePersonAdminCollection(id);
      await load();
      if (editingId === id) {
        setEditingId(null);
        setDraft(emptyDraft(kind));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };

  return (
    <section className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 sm:p-5">
      <div>
        <h3 className="text-base font-semibold">合集</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          给「{label}」建合集，再把笔记放进去。比如简历可以分成教培、运营、金融；作品集可以分成美食、游戏集锦。
        </p>
      </div>
      <label className="block text-xs text-[var(--muted)]">
        合集名称
        <input
          className="field mt-1 min-h-11 w-full rounded-xl px-3 text-sm"
          value={draft.title || ""}
          onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
          placeholder="例如：美食集"
        />
      </label>
      <label className="block text-xs text-[var(--muted)]">
        合集介绍
        <textarea
          className="field mt-1 min-h-20 w-full rounded-xl px-3 py-2 text-sm"
          value={draft.summary || ""}
          onChange={(e) => setDraft((current) => ({ ...current, summary: e.target.value }))}
        />
      </label>
      <PersonImageField
        label="合集封面"
        value={draft.coverUrl || ""}
        onChange={(url) => setDraft((current) => ({ ...current, coverUrl: url }))}
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.published !== false}
          onChange={(e) => setDraft((current) => ({ ...current, published: e.target.checked }))}
        />
        发布到前台
      </label>
      {error ? <p className="text-sm text-[var(--fire)]">{error}</p> : null}
      {status ? <p className="text-sm text-[var(--brand-strong)]">{status}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary min-h-11 px-4 text-sm" onClick={() => void onSave()}>
          {editingId ? "保存合集" : "新增合集"}
        </button>
        {editingId ? (
          <button
            type="button"
            className="btn btn-secondary min-h-11 px-4 text-sm"
            onClick={() => {
              setEditingId(null);
              setDraft(emptyDraft(kind));
            }}
          >
            取消
          </button>
        ) : null}
      </div>
      <ul className="grid gap-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--line)] p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {item.entryCount} 条笔记 · {item.published ? "已发布" : "未发布"}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary min-h-11 px-3 text-sm"
              disabled={index === 0}
              onClick={() => void move(index, index - 1)}
            >
              上移
            </button>
            <button
              type="button"
              className="btn btn-secondary min-h-11 px-3 text-sm"
              disabled={index === items.length - 1}
              onClick={() => void move(index, index + 1)}
            >
              下移
            </button>
            <button
              type="button"
              className="btn btn-secondary min-h-11 px-3 text-sm"
              onClick={() => {
                setEditingId(item.id);
                setDraft(item);
              }}
            >
              编辑
            </button>
            <button
              type="button"
              className="btn btn-secondary min-h-11 px-3 text-sm"
              onClick={() => void onDelete(item.id)}
            >
              删除
            </button>
          </li>
        ))}
        {!items.length ? <li className="text-sm text-[var(--muted)]">还没有合集。</li> : null}
      </ul>
    </section>
  );
}
