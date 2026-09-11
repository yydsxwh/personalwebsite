import assert from "node:assert/strict";
import {
  DEFAULT_PERSON_PROFILE,
  DEFAULT_SECTION_LABELS,
  mergeSectionLabels,
  buildPersonContactChips,
  normalizeExtraContacts,
  normalizeNavOrder,
  normalizePersonEntry,
  normalizePersonProfile,
  normalizeSectionLabels,
  PERSON_HOME_NAV_SECTIONS,
  PERSON_PUBLIC_NAV_KEYS,
  personAdminNavLinks,
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
  assert.ok(homeHrefs.includes("/about/person#intro"));
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
}

console.log("person-site tests ok");
