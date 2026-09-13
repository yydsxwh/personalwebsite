import { notFound } from "next/navigation";
import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { PersonEmpty } from "@andyyyds/person/components/person-entry-card";
import { PersonNoteGrid } from "@andyyyds/person/components/person-note-grid";
import { personEntrySectionHref, personKindLabel } from "@andyyyds/person/lib/person-site";
import {
  getPersonCollection,
  getPersonProfile,
  listPersonEntriesInCollection,
} from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";
import Link from "next/link";

export default async function PersonCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, collection, session] = await Promise.all([
    getPersonProfile(),
    getPersonCollection(id, true),
    getSession(),
  ]);
  if (!collection) notFound();
  const entries = await listPersonEntriesInCollection(collection.id, true);
  const backHref = personEntrySectionHref(collection.kind);
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <p className="person-kicker !text-[var(--ps-gold)]">合集</p>
      <Link href={backHref} className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--ps-gold)]">
        ← {personKindLabel(profile.sectionLabels, collection.kind)}
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{collection.title}</h1>
      {collection.summary ? (
        <p className="mt-3 max-w-2xl text-[var(--ps-muted)] leading-7">{collection.summary}</p>
      ) : null}
      {collection.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={collection.coverUrl} alt="" className="person-card mt-6 max-h-72 w-full object-cover" />
      ) : null}
      {entries.length ? (
        <div className="mt-8">
          <p className="person-meta mb-3">{entries.length} 条笔记</p>
          <PersonNoteGrid
            entries={entries}
            kindLabel={personKindLabel(profile.sectionLabels, collection.kind)}
          />
        </div>
      ) : (
        <PersonEmpty>这个合集里还没有笔记。</PersonEmpty>
      )}
    </PersonSiteChrome>
  );
}
