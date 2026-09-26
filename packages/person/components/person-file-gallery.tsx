"use client";

import { useEffect, useState } from "react";
import {
  PERSON_FILE_KIND_LABEL,
  formatPersonFileSize,
  personFileCanInlinePreview,
  personFileDownloadPath,
  personFileIsTextLike,
  personFilePreviewPath,
  personFileTextPath,
  type PersonEntryFile,
} from "@andyyyds/person/lib/person-files";

function OfficeFrame({ src }: { src: string }) {
  const [abs, setAbs] = useState("");
  useEffect(() => {
    setAbs(`${window.location.origin}${src}`);
  }, [src]);
  if (!abs) return <p className="person-empty">正在准备文档预览…</p>;
  return (
    <iframe
      title="文档预览"
      className="person-file-frame"
      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(abs)}`}
    />
  );
}

function TextPreview({ entryId, file }: { entryId: string; file: PersonEntryFile }) {
  const [text, setText] = useState("加载预览…");
  useEffect(() => {
    let cancelled = false;
    void fetch(personFileTextPath(entryId, file.id), { credentials: "same-origin" })
      .then(async (res) => {
        const body = (await res.json()) as { text?: string; error?: string };
        if (cancelled) return;
        setText(res.ok ? String(body.text || "") : body.error || "无法预览，请下载。");
      })
      .catch(() => {
        if (!cancelled) setText("无法预览，请下载。");
      });
    return () => {
      cancelled = true;
    };
  }, [entryId, file.id]);
  return <pre className="person-code">{text}</pre>;
}

function mediaSrc(entryId: string, file: PersonEntryFile): string {
  if (file.url.startsWith("/uploads/")) return file.url;
  return personFilePreviewPath(entryId, file.id);
}

function FilePreview({ entryId, file }: { entryId: string; file: PersonEntryFile }) {
  const src = mediaSrc(entryId, file);
  if (file.kind === "image" || file.kind === "animation") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={file.name} className="person-file-media" />
    );
  }
  if (file.kind === "video") {
    return (
      <video className="person-file-media" src={src} controls playsInline preload="metadata">
        当前浏览器不能播放这个视频，请下载。
      </video>
    );
  }
  if (file.kind === "audio") {
    return <audio className="w-full" src={src} controls preload="metadata" />;
  }
  if (file.kind === "pdf") {
    return <iframe title={file.name} className="person-file-frame" src={src} />;
  }
  if (file.kind === "office") {
    return <OfficeFrame src={src} />;
  }
  if (personFileIsTextLike(file.kind)) {
    return <TextPreview entryId={entryId} file={file} />;
  }
  return <p className="person-empty">这个格式请下载后打开。</p>;
}

export function PersonFileGallery({
  entryId,
  files,
  allowDownload = false,
}: {
  entryId: string;
  files: PersonEntryFile[];
  allowDownload?: boolean;
}) {
  if (!files.length) return null;
  return (
    <div className="mt-6 grid gap-4">
      {files.map((file) => {
        const preview = personFilePreviewPath(entryId, file.id);
        const download = personFileDownloadPath(entryId, file.id);
        return (
          <section key={file.id} className="person-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="person-meta">{PERSON_FILE_KIND_LABEL[file.kind]}</p>
                <h3 className="truncate text-base font-semibold">{file.name}</h3>
                {file.size ? (
                  <p className="text-xs text-[var(--ps-muted)]">{formatPersonFileSize(file.size)}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {personFileCanInlinePreview(file.kind) ? (
                  <a href={preview} className="btn btn-secondary min-h-11 px-3 text-sm" target="_blank" rel="noopener noreferrer">
                    预览
                  </a>
                ) : null}
                {allowDownload ? (
                  <a href={download} className="btn btn-primary min-h-11 px-3 text-sm">
                    下载
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center text-xs text-[var(--ps-muted)]">
                    作者未开放下载
                  </span>
                )}
              </div>
            </div>
            {personFileCanInlinePreview(file.kind) ? (
              <div className="person-file-preview mt-3">
                <FilePreview entryId={entryId} file={file} />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export function PersonFileStrip({
  entryId,
  files,
  allowDownload = false,
}: {
  entryId: string;
  files: PersonEntryFile[];
  allowDownload?: boolean;
}) {
  if (!files.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {files.slice(0, 6).map((file) => {
        const canPreview = personFileCanInlinePreview(file.kind);
        const href = canPreview
          ? personFilePreviewPath(entryId, file.id)
          : allowDownload
            ? personFileDownloadPath(entryId, file.id)
            : "";
        if (!href) {
          return (
            <span key={file.id} className="person-chip">
              <strong>{PERSON_FILE_KIND_LABEL[file.kind]}</strong>
              {file.name}
            </span>
          );
        }
        return (
          <a key={file.id} href={href} className="person-chip">
            <strong>{PERSON_FILE_KIND_LABEL[file.kind]}</strong>
            {file.name}
          </a>
        );
      })}
    </div>
  );
}
