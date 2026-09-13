import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { PersonSiteSectionPage } from "@andyyyds/person/components/person-site-section-page";
import {
  getPersonProfile,
  listPersonCollections,
  listPersonEntries,
} from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export default async function PersonBlogPage() {
  const [profile, entries, collections, session] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ kind: "BLOG", publishedOnly: true }),
    listPersonCollections({ kind: "BLOG", publishedOnly: true }),
    getSession(),
  ]);
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <PersonSiteSectionPage
        title={profile.sectionLabels.kinds.BLOG}
        intro="把做过的事和方法写清楚。合集可以按主题收笔记。"
        entries={entries}
        collections={collections}
      />
    </PersonSiteChrome>
  );
}
