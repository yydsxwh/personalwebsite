"use client";

import { useRef, useState } from "react";
import { uploadPersonAdminImage } from "@andyyyds/person/lib/person-site-client";

export function PersonImageField({
  label,
  value,
  onChange,
  saveLabel = "保存",
  saving = false,
  saved = false,
  onSave,
  onUploaded,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  saveLabel?: string;
  saving?: boolean;
  saved?: boolean;
  onSave?: () => void;
  onUploaded?: (url: string) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadPersonAdminImage(file);
      onChange(url);
      if (onUploaded) await onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="block text-xs text-[var(--muted)]">
      {label}
      <div className="mt-1 flex gap-2">
        <input
          className="field min-h-11 w-full rounded-xl px-3 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSave) {
              e.preventDefault();
              onSave();
            }
          }}
          placeholder="图片地址或点下方上传"
        />
        {onSave ? (
          <button
            type="button"
            className="btn btn-secondary min-h-11 shrink-0 px-3 text-sm"
            disabled={saving || busy}
            onClick={onSave}
          >
            {saving ? "保存中" : saveLabel}
          </button>
        ) : null}
        {onSave ? (
          <span
            className={`min-h-11 shrink-0 self-center text-xs ${
              saved ? "text-[var(--brand-strong)]" : "invisible"
            }`}
          >
            已保存
          </span>
        ) : null}
      </div>
      <button
        type="button"
        className="btn btn-secondary mt-2 min-h-11 px-3 text-sm"
        disabled={busy || saving}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (onUploaded ? "上传并保存中…" : "上传中…") : "上传图片"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onPick(file);
        }}
      />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 max-h-32 rounded-xl object-cover" />
      ) : null}
      {error ? <p className="mt-1 text-[var(--fire)]">{error}</p> : null}
    </div>
  );
}
