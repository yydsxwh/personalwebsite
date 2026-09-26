import Link from "next/link";
import {
  personCollectionHref,
  type PersonCollectionPayload,
} from "@andyyyds/person/lib/person-site";

export function PersonCollectionCard({ collection }: { collection: PersonCollectionPayload }) {
  return (
    <Link href={personCollectionHref(collection.id)} className="person-card person-tile">
      {collection.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={collection.coverUrl} alt="" />
      ) : (
        <div className="h-16 bg-[var(--ps-gold-soft)]" />
      )}
      <div className="person-tile-body">
        <p className="person-meta">合集 · {collection.entryCount} 条笔记</p>
        <h3 className="text-lg font-semibold leading-7">{collection.title}</h3>
        {collection.summary ? (
          <p className="text-sm leading-6 text-[var(--ps-muted)]">{collection.summary}</p>
        ) : null}
      </div>
    </Link>
  );
}
