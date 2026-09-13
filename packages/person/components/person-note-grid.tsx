import Link from "next/link";
import {
  personEntryHref,
  personNoteCover,
  personNoteHasVideo,
  personNoteImageCount,
  type PersonEntryPayload,
} from "@andyyyds/person/lib/person-site";

function PersonNotePin({
  entry,
  kindLabel,
}: {
  entry: PersonEntryPayload;
  kindLabel?: string;
}) {
  const href = personEntryHref(entry);
  const cover = personNoteCover(entry);
  const imageCount = personNoteImageCount(entry);
  const video = personNoteHasVideo(entry);

  return (
    <Link href={href} className="person-note-pin">
      <div className={cover ? "person-note-pin-cover" : "person-note-pin-cover is-empty"}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" />
        ) : (
          <span>{kindLabel || "笔记"}</span>
        )}
        {video ? (
          <span className="person-note-pin-play" aria-hidden>
            ▶
          </span>
        ) : null}
        {imageCount > 1 ? (
          <span className="person-note-pin-badge">{imageCount} 图</span>
        ) : null}
      </div>
      <div className="person-note-pin-body">
        <h3 className="person-note-pin-title">{entry.title || "未命名笔记"}</h3>
        {entry.tags?.length ? (
          <p className="person-note-pin-meta">
            {entry.tags.slice(0, 2).map((tag) => `#${tag}`).join(" ")}
          </p>
        ) : kindLabel ? (
          <p className="person-note-pin-meta">{kindLabel}</p>
        ) : null}
      </div>
    </Link>
  );
}

/** 合集里的笔记：小红书式图片作品网格。正文和附件进笔记详情。 */
export function PersonNoteGrid({
  entries,
  kindLabel,
}: {
  entries: PersonEntryPayload[];
  kindLabel?: string;
}) {
  return (
    <div className="person-note-grid" aria-label="笔记">
      {entries.map((entry) => (
        <PersonNotePin key={entry.id} entry={entry} kindLabel={kindLabel} />
      ))}
    </div>
  );
}
