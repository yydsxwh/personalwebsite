import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { PersonSiteSectionPage } from "@andyyyds/person/components/person-site-section-page";
import {
  getPersonProfile,
  listPersonCollections,
  listPersonEntries,
} from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export default async function PersonProjectsPage() {
  const [profile, entries, collections, session] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ kind: "PROJECT", publishedOnly: true }),
    listPersonCollections({ kind: "PROJECT", publishedOnly: true }),
    getSession(),
  ]);
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <PersonSiteSectionPage
        title={profile.sectionLabels.kinds.PROJECT}
        intro="做过的产品、课题与交付。也可以按方向收进不同合集。"
        entries={entries}
        collections={collections}
      />
    </PersonSiteChrome>
  );
}
