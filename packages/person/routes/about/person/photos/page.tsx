import Link from "next/link";
import { PersonCollectionCard } from "@andyyyds/person/components/person-collection-card";
import { PersonEmpty } from "@andyyyds/person/components/person-entry-card";
import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { personEntryHref } from "@andyyyds/person/lib/person-site";
import {
  getPersonProfile,
  listPersonCollections,
  listPersonEntries,
} from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export default async function PersonPhotosPage() {
  const [profile, photos, collections, session] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ kind: "PHOTO", publishedOnly: true }),
    listPersonCollections({ kind: "PHOTO", publishedOnly: true }),
    getSession(),
  ]);
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <p className="person-kicker !text-[var(--ps-gold)]">Gallery</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {profile.sectionLabels.kinds.PHOTO}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--ps-muted)] leading-7">
        头像之外的形象照、现场与作品照片。也可以按主题收进合集。
      </p>
      {collections.length ? (
        <div className="person-grid person-grid-2 mt-8">
          {collections.map((collection) => (
            <PersonCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : null}
      {photos.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => {
            const src = photo.coverUrl || photo.images[0];
            if (!src) return null;
            return (
              <Link key={photo.id} href={personEntryHref(photo)} className="person-card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={photo.title} className="aspect-[4/3] w-full object-cover" />
                {photo.title && photo.title !== "照片" ? (
                  <p className="px-3 py-2 text-sm">{photo.title}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : collections.length ? null : (
        <PersonEmpty>还没有上传照片。</PersonEmpty>
      )}
    </PersonSiteChrome>
  );
}
