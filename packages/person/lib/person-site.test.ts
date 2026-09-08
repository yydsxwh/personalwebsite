import assert from "node:assert/strict";
import {
  DEFAULT_SECTION_LABELS,
  buildPersonContactChips,
  normalizeExtraContacts,
  normalizePersonEntry,
  normalizePersonProfile,
  normalizeSectionLabels,
  personAdminNavLinks,
  personEntryHref,
  personEntrySectionHref,
  personKindLabel,
  personPublicNavLinks,
} from "./person-site";
import { classifyPersonFile, normalizePersonFiles } from "./person-files";

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
}

console.log("person-site tests ok");
