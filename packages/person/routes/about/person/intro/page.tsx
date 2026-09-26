import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { PersonSiteSectionPage } from "@andyyyds/person/components/person-site-section-page";
import {
  getPersonProfile,
  listPersonCollections,
  listPersonEntries,
} from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export default async function PersonIntroPage() {
  const [profile, entries, collections, session] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ kind: "INTRO_VIDEO", publishedOnly: true }),
    listPersonCollections({ kind: "INTRO_VIDEO", publishedOnly: true }),
    getSession(),
  ]);
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <PersonSiteSectionPage
        title={profile.sectionLabels.nav.intro}
        intro="可以直接播放。也可以按场合收进不同合集，并附上字幕、讲稿。"
        entries={entries}
        collections={collections}
      />
    </PersonSiteChrome>
  );
}
