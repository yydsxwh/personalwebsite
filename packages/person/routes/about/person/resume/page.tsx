import { PersonSiteChrome } from "@andyyyds/person/components/person-site-chrome";
import { PersonSiteSectionPage } from "@andyyyds/person/components/person-site-section-page";
import { PersonFileGallery } from "@andyyyds/person/components/person-file-gallery";
import {
  getPersonProfile,
  listPersonCollections,
  listPersonEntries,
} from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export default async function PersonResumePage() {
  const [profile, entries, collections, session] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ kind: "RESUME", publishedOnly: true }),
    listPersonCollections({ kind: "RESUME", publishedOnly: true }),
    getSession(),
  ]);
  return (
    <PersonSiteChrome profile={profile} showAdmin={Boolean(session && isAdmin(session))}>
      <PersonSiteSectionPage
        title={profile.sectionLabels.kinds.RESUME}
        intro="可以按工作方向建合集，比如教培、互联网运营、金融。附件默认只能预览。"
        entries={entries}
        collections={collections}
      />
      {entries.map((entry) =>
        entry.files.length ? (
          <div key={entry.id} className="mt-8">
            <h2 className="person-section-title">{entry.title}</h2>
            <PersonFileGallery
              entryId={entry.id}
              files={entry.files}
              allowDownload={entry.allowDownload}
            />
          </div>
        ) : null,
      )}
    </PersonSiteChrome>
  );
}
