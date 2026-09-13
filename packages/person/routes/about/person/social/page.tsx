import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { PersonSocialFeed } from "@andyyyds/person/components/person-social-feed";
import { PersonEmpty } from "@andyyyds/person/components/person-entry-card";
import { listPersonSocialAlbums } from "@andyyyds/person/lib/person-social-album";
import { PERSON_SOCIAL_POST_ORDER_BY, personSocialHasAccount } from "@andyyyds/person/lib/person-social";
import { getPersonSocialAccounts } from "@andyyyds/person/lib/person-social-settings";
import { getPersonProfile } from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";
import { prisma } from "@andyyyds/shared/db";

const POSTS_PAGE_SIZE = 24;

export default async function PersonSocialPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requested = Number.parseInt(String(params.page || "1"), 10);
  const pageRaw = Number.isFinite(requested) && requested > 0 ? requested : 1;
  const [profile, session, socialAccounts, postTotal, albums] = await Promise.all([
    getPersonProfile(),
    getSession(),
    getPersonSocialAccounts(),
    prisma.personSocialPost.count({ where: { isDeleted: false } }),
    listPersonSocialAlbums(),
  ]);
  const totalPages = Math.max(1, Math.ceil(postTotal / POSTS_PAGE_SIZE));
  const page = Math.min(pageRaw, totalPages);
  const posts = await prisma.personSocialPost.findMany({
    where: { isDeleted: false },
    orderBy: PERSON_SOCIAL_POST_ORDER_BY,
    skip: (page - 1) * POSTS_PAGE_SIZE,
    take: POSTS_PAGE_SIZE,
  });
  const albumCards = albums.map((row) => ({
    id: row.id,
    platform: row.platform,
    title: row.title,
    coverUrl: row.coverUrl,
    itemCount: row._count.items,
  }));
  const postCards = posts.map((row) => ({
    id: row.id,
    platform: row.platform,
    title: row.title,
    digest: row.digest,
    coverUrl: row.coverUrl,
    sourceUrl: row.sourceUrl,
    publishedAt: row.publishedAt,
    isPinned: row.isPinned,
    isFeatured: row.isFeatured,
    contentKind: row.contentKind,
  }));
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <p className="person-kicker !text-[var(--ps-gold)]">Social</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {profile.sectionLabels.nav.social}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--ps-muted)] leading-7">
        抖音、B站、小红书、视频号的投稿和合集。顺序由后台栏目拖动决定，可以排到前面。
      </p>
      {personSocialHasAccount(socialAccounts) || albumCards.length || postCards.length ? (
        <div className="mt-8">
          <PersonSocialFeed
            albums={albumCards}
            posts={postCards}
            pageHref="/about/person/social"
            pagination={{
              page,
              totalPages,
              totalCount: postTotal,
              pageSize: POSTS_PAGE_SIZE,
            }}
          />
        </div>
      ) : (
        <PersonEmpty>还没有同步自媒体内容。</PersonEmpty>
      )}
    </PersonSiteChrome>
  );
}
