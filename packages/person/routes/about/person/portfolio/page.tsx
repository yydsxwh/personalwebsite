import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { PersonSiteSectionPage } from "@andyyyds/person/components/person-site-section-page";
import {
  getPersonProfile,
  listPersonCollections,
  listPersonEntries,
} from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export default async function PersonPortfolioPage() {
  const [profile, entries, collections, session] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ kind: "PORTFOLIO", publishedOnly: true }),
    listPersonCollections({ kind: "PORTFOLIO", publishedOnly: true }),
    getSession(),
  ]);
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <PersonSiteSectionPage
        title={profile.sectionLabels.kinds.PORTFOLIO}
        intro="可展示的作品、设计与成果。合集用来归类笔记，比如美食集、游戏集锦。"
        entries={entries}
        collections={collections}
      />
    </PersonSiteChrome>
  );
}
