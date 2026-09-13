import {
  personKindLabel,
  type PersonCollectionPayload,
  type PersonEntryKind,
  type PersonEntryPayload,
  type PersonSectionLabels,
} from "@andyyyds/person/lib/person-site";
import { PersonCollectionCard } from "@andyyyds/person/components/person-collection-card";
import { PersonEmpty, PersonEntryCard } from "@andyyyds/person/components/person-entry-card";
import { PersonFileGallery, PersonFileStrip } from "@andyyyds/person/components/person-file-gallery";

export function PersonSiteSectionPage({
  title,
  intro,
  entries,
  collections = [],
  kinds,
  labels,
}: {
  title: string;
  intro: string;
  entries: PersonEntryPayload[];
  collections?: PersonCollectionPayload[];
  kinds?: PersonEntryKind[];
  labels?: PersonSectionLabels;
}) {
  const groupedIds = new Set(collections.map((item) => item.id));
  const looseNotes = collections.length
    ? entries.filter((entry) => !entry.collectionId || !groupedIds.has(entry.collectionId))
    : entries;

  return (
    <div>
      <p className="person-kicker !text-[var(--ps-gold)]">Personal site</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-[var(--ps-muted)] leading-7">{intro}</p>
      {collections.length ? (
        <div className="person-grid person-grid-2 mt-8">
          {collections.map((collection) => (
            <PersonCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : null}
      {looseNotes.length ? (
        <div className="mt-8">
          {collections.length ? <h2 className="person-section-title mb-4">未分组笔记</h2> : null}
          <div className="person-grid person-grid-2">
            {looseNotes.map((entry) => (
              <div key={entry.id}>
                <PersonEntryCard
                  entry={entry}
                  showKind={kinds && kinds.length > 1 ? personKindLabel(labels, entry.kind) : undefined}
                />
                {(entry.files || []).some((file) => file.kind === "video" || file.kind === "audio") ? (
                  <PersonFileGallery
                    entryId={entry.id}
                    files={entry.files || []}
                    allowDownload={entry.allowDownload}
                  />
                ) : (
                  <PersonFileStrip
                    entryId={entry.id}
                    files={entry.files || []}
                    allowDownload={entry.allowDownload}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {!collections.length && !looseNotes.length ? <PersonEmpty>这一栏还没有内容。</PersonEmpty> : null}
    </div>
  );
}
