import assert from "node:assert/strict";
import {
  DEFAULT_PERSON_PROFILE,
  DEFAULT_SECTION_LABELS,
  mergeSectionLabels,
  buildPersonContactChips,
  normalizeExtraContacts,
  adminColumnsFromNavOrder,
  navOrderFromAdminColumns,
  normalizeAdminColumnOrder,
  normalizeNavOrder,
  normalizePersonCollection,
  normalizePersonEntry,
  normalizePersonProfile,
  normalizeSectionLabels,
  normalizeTagList,
  PERSON_ADMIN_COLUMN_KEYS,
  PERSON_HOME_NAV_SECTIONS,
  PERSON_NAV_PAGE_HREF,
  PERSON_PUBLIC_NAV_KEYS,
  personAdminNavLinks,
  PERSON_NAV_COLLECTION_KINDS,
  personCollectionHref,
  personNoteCover,
  personNoteHasVideo,
  personNoteImageCount,
  personCollectionsForNav,
  personEntryHref,
  personEntrySectionHref,
  personKindLabel,
  personPublicNavLinks,
} from "./person-site";
import { classifyPersonFile, normalizePersonFiles } from "./person-files";

{
  assert.equal(DEFAULT_PERSON_PROFILE.displayName, "");
  assert.equal(DEFAULT_PERSON_PROFILE.headline, "");
  assert.equal(DEFAULT_PERSON_PROFILE.about, "");
  assert.equal(DEFAULT_PERSON_PROFILE.email, "");
  assert.equal(DEFAULT_PERSON_PROFILE.github, "");
  assert.equal(DEFAULT_PERSON_PROFILE.website, "");
}

{
  const profile = normalizePersonProfile({
    displayName: " 张三 ",
    email: "a@b.com",
    github: "octocat",
    extraContacts: [{ label: "工作微信", value: "work-wx", href: "" }],
    about: "x".repeat(20),
  });
  assert.equal(profile.displayName, "张三");
  assert.equal(profile.email, "a@b.com");
  const chips = buildPersonContactChips(profile);
  assert.ok(chips.some((chip) => chip.key === "email"));
  assert.ok(chips.some((chip) => chip.label === "工作微信"));
  assert.ok(chips.some((chip) => chip.key === "github"));
  assert.equal(profile.showGithub, true);
}

{
  const withSite = normalizePersonProfile({
    website: "https://github.com/yydsxwh/personalwebsite",
    github: "octocat",
    showGithub: false,
  });
  const chips = buildPersonContactChips(withSite);
  assert.ok(!chips.some((chip) => chip.key === "website"));
  assert.ok(!chips.some((chip) => chip.key === "github"));
  const shown = buildPersonContactChips(
    normalizePersonProfile({ github: "octocat", showGithub: true }),
  );
  assert.equal(shown.find((chip) => chip.key === "github")?.href, "https://github.com/octocat");
}

{
  const entry = normalizePersonEntry({
    kind: "PROJECT",
    title: "示范项目",
    sortOrder: 3,
    published: false,
    featured: true,
    images: ["https://example.com/a.png", "javascript:alert(1)"],
  });
  assert.equal(entry.kind, "PROJECT");
  assert.equal(entry.published, false);
  assert.equal(entry.featured, true);
  assert.equal(entry.images.length, 1);
  assert.equal(personEntryHref({ kind: "PROJECT", id: "abc" }), "/about/person/projects/abc");
  assert.equal(personEntryHref({ kind: "PORTFOLIO", id: "p1" }), "/about/person/e/p1");
  assert.equal(personEntrySectionHref("PHOTO"), "/about/person/photos");
  assert.equal(personEntrySectionHref("RESUME"), "/about/person/resume");
  assert.equal(personEntrySectionHref("INTRO_VIDEO"), "/about/person/intro");
  assert.equal(entry.files.length, 0);
}

{
  assert.equal(normalizeExtraContacts("not-json").length, 0);
}

{
  assert.equal(classifyPersonFile("cv.pdf"), "pdf");
  assert.equal(classifyPersonFile("talk.pptx"), "office");
  assert.equal(classifyPersonFile("notes.tex"), "latex");
  assert.equal(classifyPersonFile("readme.md"), "markdown");
  assert.equal(classifyPersonFile("main.py"), "code");
  assert.equal(classifyPersonFile("src.zip"), "archive");
  assert.equal(classifyPersonFile("app.apk"), "program");
  assert.equal(classifyPersonFile("intro.mp4"), "video");
  const files = normalizePersonFiles([
    { name: "cv.pdf", url: "/uploads/a/cv.pdf", mime: "application/pdf", size: 12 },
    { name: "bad", url: "javascript:alert(1)" },
  ]);
  assert.equal(files.length, 1);
  assert.equal(files[0]?.kind, "pdf");
  const vod = normalizePersonFiles([
    { name: "talk.mp4", url: "vod:abc123", mime: "video/mp4", size: 8 },
  ]);
  assert.equal(vod.length, 1);
  assert.equal(vod[0]?.kind, "video");
  assert.equal(vod[0]?.url, "vod:abc123");
}

{
  const labels = normalizeSectionLabels({
    kinds: { RESUME: " 履历表 ", PROJECT: "" },
    admin: { overview: "Dashboard" },
    nav: { about: "About me" },
    home: { featured: "Highlights" },
    junk: true,
  });
  assert.equal(labels.kinds.RESUME, "履历表");
  assert.equal(labels.kinds.PROJECT, DEFAULT_SECTION_LABELS.kinds.PROJECT);
  assert.equal(labels.admin.overview, "Dashboard");
  assert.equal(labels.admin.profile, DEFAULT_SECTION_LABELS.admin.profile);
  assert.equal(labels.nav.about, "About me");
  assert.equal(labels.home.featured, "Highlights");
  assert.equal(personKindLabel(labels, "RESUME"), "履历表");
  assert.ok(personAdminNavLinks(labels).some((link) => link.label === "履历表"));
  assert.ok(personPublicNavLinks(labels).some((link) => link.label === "About me"));
  const pageHrefs = personPublicNavLinks(DEFAULT_SECTION_LABELS).map((link) => link.href);
  const homeHrefs = personPublicNavLinks(DEFAULT_SECTION_LABELS, "home").map((link) => link.href);
  assert.ok(pageHrefs.includes("/about/person/intro"));
  assert.ok(pageHrefs.includes("/about/person/social"));
  assert.ok(homeHrefs.includes("/about/person#intro"));
  assert.ok(homeHrefs.includes("/about/person#social"));
  assert.equal(PERSON_NAV_PAGE_HREF.social, "/about/person/social");
  assert.ok(PERSON_PUBLIC_NAV_KEYS.includes("social"));
  assert.deepEqual(
    PERSON_HOME_NAV_SECTIONS.map((section) => section.key),
    PERSON_PUBLIC_NAV_KEYS.filter((key) => key !== "about"),
  );
}

{
  const merged = mergeSectionLabels(DEFAULT_SECTION_LABELS, { kinds: { RESUME: "履历" } });
  assert.equal(merged.kinds.RESUME, "履历");
  assert.equal(merged.kinds.PROJECT, DEFAULT_SECTION_LABELS.kinds.PROJECT);
  assert.equal(merged.nav.intro, DEFAULT_SECTION_LABELS.nav.intro);
}

{
  const fromJson = normalizeSectionLabels(JSON.stringify({ kinds: { BLOG: "随笔" } }));
  assert.equal(fromJson.kinds.BLOG, "随笔");
  assert.equal(normalizeSectionLabels("").kinds.RESUME, DEFAULT_SECTION_LABELS.kinds.RESUME);
  assert.equal(normalizeSectionLabels("not-json").nav.projects, DEFAULT_SECTION_LABELS.nav.projects);
}

{
  const profile = normalizePersonProfile({
    displayName: "李四",
    sectionLabels: { kinds: { PHOTO: "相册" } },
  });
  assert.equal(profile.sectionLabels.kinds.PHOTO, "相册");
  assert.equal(profile.sectionLabels.kinds.RESUME, DEFAULT_SECTION_LABELS.kinds.RESUME);
  assert.deepEqual(profile.navOrder, [...PERSON_PUBLIC_NAV_KEYS]);
}

{
  const ordered = normalizeNavOrder(["photos", "bogus", "about", "photos"]);
  assert.equal(ordered[0], "photos");
  assert.equal(ordered[1], "about");
  assert.ok(!ordered.includes("bogus" as never));
  assert.deepEqual(
    ordered.slice(2),
    PERSON_PUBLIC_NAV_KEYS.filter((key) => key !== "photos" && key !== "about"),
  );
  const links = personPublicNavLinks(DEFAULT_SECTION_LABELS, "pages", ["photos", "intro"]);
  assert.equal(links[0]?.label, DEFAULT_SECTION_LABELS.nav.photos);
  assert.equal(links[1]?.label, DEFAULT_SECTION_LABELS.nav.intro);
  assert.equal(links[2]?.label, DEFAULT_SECTION_LABELS.nav.about);
  const homeLinks = personPublicNavLinks(DEFAULT_SECTION_LABELS, "home", ["intro", "about"]);
  assert.equal(homeLinks[0]?.href, "/about/person#intro");
  assert.equal(homeLinks[1]?.href, "/about/person#about");
  const fromJson = normalizePersonProfile({
    sectionLabels: JSON.stringify({
      nav: { about: "About" },
      navOrder: ["intro", "about"],
    }),
  });
  assert.equal(fromJson.navOrder[0], "intro");
  assert.equal(fromJson.navOrder[1], "about");
  assert.ok(fromJson.navOrder.includes("photos"));
  assert.ok(fromJson.navOrder.includes("social"));
}

{
  assert.deepEqual(DEFAULT_PERSON_PROFILE.adminColumnOrder, [...PERSON_ADMIN_COLUMN_KEYS]);
  const columns = normalizeAdminColumnOrder(["SOCIAL", "PHOTO", "bogus", "SOCIAL"]);
  assert.equal(columns[0], "SOCIAL");
  assert.equal(columns[1], "PHOTO");
  assert.ok(!columns.includes("bogus" as never));
  assert.ok(columns.includes("RESUME"));
  const nav = navOrderFromAdminColumns(["SOCIAL", "RESUME"], ["about", "resume", "social"]);
  assert.equal(nav[0], "about");
  assert.equal(nav[1], "social");
  assert.equal(nav[2], "resume");
  const back = adminColumnsFromNavOrder(["social", "about", "photos"], ["PHOTO", "SOCIAL"]);
  assert.equal(back[0], "SOCIAL");
  assert.equal(back[1], "PHOTO");
  const grouped = adminColumnsFromNavOrder(["honors", "life"], ["ACTIVITY", "HONOR", "GRADE", "PRACTICE"]);
  assert.deepEqual(grouped.slice(0, 5), ["HONOR", "GRADE", "ACTIVITY", "PRACTICE", "INTEREST"]);
  const fromBlob = normalizePersonProfile({
    sectionLabels: JSON.stringify({
      adminColumnOrder: ["SOCIAL", "BLOG"],
      navOrder: ["social", "blog", "about"],
    }),
  });
  assert.equal(fromBlob.adminColumnOrder[0], "SOCIAL");
  assert.equal(fromBlob.adminColumnOrder[1], "BLOG");
  assert.equal(fromBlob.navOrder[0], "social");
  const derived = normalizePersonProfile({
    sectionLabels: JSON.stringify({ navOrder: ["photos", "about", "social"] }),
  });
  assert.equal(derived.adminColumnOrder[0], "PHOTO");
  assert.equal(derived.adminColumnOrder[1], "SOCIAL");
  const links = personAdminNavLinks(DEFAULT_SECTION_LABELS, ["SOCIAL", "RESUME"]);
  assert.equal(links[0]?.href, "/person-admin");
  assert.equal(links[3]?.columnKey, "SOCIAL");
  assert.equal(links[3]?.href, "/person-admin/social");
  assert.equal(links[4]?.columnKey, "RESUME");
}

{
  const note = normalizePersonEntry({
    kind: "PORTFOLIO",
    title: "红烧肉",
    tags: ["美食", "家常", "美食"],
    allowDownload: true,
    collectionId: "food-set",
    body: "自己做的 😋",
  });
  assert.deepEqual(note.tags, ["美食", "家常"]);
  assert.equal(note.allowDownload, true);
  assert.equal(note.collectionId, "food-set");
  assert.deepEqual(normalizeTagList("教培，运营 #金融"), ["教培", "运营", "金融"]);
  const collectionDraft = normalizePersonCollection({
    kind: "RESUME",
    title: "教培类工作简历",
  });
  assert.equal(collectionDraft.kind, "RESUME");
  assert.equal(collectionDraft.title, "教培类工作简历");
  assert.equal(personCollectionHref("abc"), "/about/person/c/abc");
  assert.equal(
    personNoteCover({ coverUrl: "", images: ["https://example.com/a.jpg"] }),
    "https://example.com/a.jpg",
  );
  assert.equal(
    personNoteCover({ coverUrl: "https://example.com/cover.jpg", images: ["https://example.com/a.jpg"] }),
    "https://example.com/cover.jpg",
  );
  assert.equal(
    personNoteImageCount({
      coverUrl: "https://example.com/cover.jpg",
      images: ["https://example.com/cover.jpg", "https://example.com/b.jpg"],
      files: [],
    }),
    2,
  );
  assert.equal(personNoteHasVideo({ kind: "INTRO_VIDEO", files: [] }), true);
  assert.equal(personNoteHasVideo({ kind: "PORTFOLIO", files: [] }), false);
  const contentNavs = PERSON_PUBLIC_NAV_KEYS.filter((key) => key !== "about" && key !== "social");
  for (const key of contentNavs) {
    assert.ok((PERSON_NAV_COLLECTION_KINDS[key] || []).length > 0, `${key} 必须能建合集`);
  }
  const collection = {
    ...collectionDraft,
    id: "c1",
    updatedAt: "2026-09-13T00:00:00.000Z",
    entryCount: 0,
  };
  const grouped = personCollectionsForNav("honors", {
    HONOR: [collection],
    GRADE: [{ ...collection, id: "g1", kind: "GRADE", title: "成绩单" }],
  });
  assert.equal(grouped.length, 2);
  assert.deepEqual(personCollectionsForNav("about", { RESUME: [collection] }), []);
}

console.log("person-site tests ok");
