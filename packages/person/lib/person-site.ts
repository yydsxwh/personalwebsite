/**
 * 个人展示站：档案 + 条目种类。规则集中在这里，方便以后整包拆到独立域名。
 */

import {
  normalizePersonFiles,
  type PersonEntryFile,
} from "@andyyyds/person/lib/person-files";

export type { PersonEntryFile, PersonFileKind } from "@andyyyds/person/lib/person-files";

export const PERSON_ENTRY_KINDS = [
  "RESUME",
  "INTRO_VIDEO",
  "PROJECT",
  "BLOG",
  "PORTFOLIO",
  "HONOR",
  "GRADE",
  "PRACTICE",
  "ACTIVITY",
  "INTEREST",
  "PHOTO",
] as const;

export type PersonEntryKind = (typeof PERSON_ENTRY_KINDS)[number];

export const PERSON_ENTRY_KIND_LABEL: Record<PersonEntryKind, string> = {
  RESUME: "简历",
  INTRO_VIDEO: "视频自我介绍",
  PROJECT: "项目经历",
  BLOG: "博客 / 技术随笔",
  PORTFOLIO: "作品集",
  HONOR: "获奖荣誉",
  GRADE: "成绩",
  PRACTICE: "社会实践",
  ACTIVITY: "课外活动",
  INTEREST: "兴趣",
  PHOTO: "照片",
};

export const PERSON_LABEL_MAX = 24;

export const PERSON_ADMIN_NAV_KEYS = [
  "overview",
  "profile",
  "sections",
  "social",
] as const;

export type PersonAdminNavKey = (typeof PERSON_ADMIN_NAV_KEYS)[number];

export const PERSON_PUBLIC_NAV_KEYS = [
  "about",
  "resume",
  "intro",
  "projects",
  "blog",
  "portfolio",
  "honors",
  "life",
  "photos",
  "social",
] as const;

export type PersonPublicNavKey = (typeof PERSON_PUBLIC_NAV_KEYS)[number];

/** 后台左侧可拖动的内容栏目。总览 / 档案 / 栏目名称固定在最上面。 */
export const PERSON_ADMIN_COLUMN_KEYS = [...PERSON_ENTRY_KINDS, "SOCIAL"] as const;
export type PersonAdminColumnKey = (typeof PERSON_ADMIN_COLUMN_KEYS)[number];

export const PERSON_ADMIN_COLUMN_TO_NAV: Record<PersonAdminColumnKey, PersonPublicNavKey> = {
  RESUME: "resume",
  INTRO_VIDEO: "intro",
  PROJECT: "projects",
  BLOG: "blog",
  PORTFOLIO: "portfolio",
  HONOR: "honors",
  GRADE: "honors",
  PRACTICE: "life",
  ACTIVITY: "life",
  INTEREST: "life",
  PHOTO: "photos",
  SOCIAL: "social",
};

export const PERSON_NAV_TO_ADMIN_COLUMNS: Partial<
  Record<PersonPublicNavKey, readonly PersonAdminColumnKey[]>
> = {
  resume: ["RESUME"],
  intro: ["INTRO_VIDEO"],
  projects: ["PROJECT"],
  blog: ["BLOG"],
  portfolio: ["PORTFOLIO"],
  honors: ["HONOR", "GRADE"],
  life: ["PRACTICE", "ACTIVITY", "INTEREST"],
  photos: ["PHOTO"],
  social: ["SOCIAL"],
};

export const PERSON_HOME_TITLE_KEYS = [
  "aboutMe",
  "featured",
  "contact",
  "social",
  "honorsGroup",
  "lifeGroup",
] as const;

export type PersonHomeTitleKey = (typeof PERSON_HOME_TITLE_KEYS)[number];

export type PersonSectionLabels = {
  admin: Record<PersonAdminNavKey, string>;
  kinds: Record<PersonEntryKind, string>;
  nav: Record<PersonPublicNavKey, string>;
  home: Record<PersonHomeTitleKey, string>;
};

export const DEFAULT_SECTION_LABELS: PersonSectionLabels = {
  admin: {
    overview: "总览",
    profile: "档案与联系方式",
    sections: "栏目名称",
    social: "自媒体同步",
  },
  kinds: { ...PERSON_ENTRY_KIND_LABEL },
  nav: {
    about: "关于",
    resume: "简历",
    intro: "视频",
    projects: "项目",
    blog: "博客",
    portfolio: "作品",
    honors: "荣誉",
    life: "经历",
    photos: "照片",
    social: "自媒体",
  },
  home: {
    aboutMe: "关于我",
    featured: "精选",
    contact: "联系方式",
    social: "自媒体",
    honorsGroup: "成绩与荣誉",
    lifeGroup: "社会实践与课外活动",
  },
};

export const PERSON_PROFILE_ID = "default";
export const PERSON_NAME_MAX = 40;
export const PERSON_HEADLINE_MAX = 80;
export const PERSON_ABOUT_MAX = 8000;
export const PERSON_TITLE_MAX = 80;
export const PERSON_SUMMARY_MAX = 400;
export const PERSON_BODY_MAX = 40_000;
export const PERSON_CONTACT_MAX = 80;
export const PERSON_URL_MAX = 400;
export const PERSON_MAX_IMAGES = 12;
export const PERSON_MAX_EXTRA_CONTACTS = 8;
export const PERSON_MAX_TAGS = 12;
export const PERSON_TAG_MAX = 20;

export type PersonExtraContact = {
  label: string;
  value: string;
  href: string;
};

export type PersonProfilePayload = {
  displayName: string;
  headline: string;
  about: string;
  avatarUrl: string;
  coverUrl: string;
  location: string;
  email: string;
  phone: string;
  wechat: string;
  qq: string;
  website: string;
  github: string;
  linkedin: string;
  zhihu: string;
  weibo: string;
  extraContacts: PersonExtraContact[];
  sectionLabels: PersonSectionLabels;
  /** 前台顶栏和首页栏目共用这一套顺序。「管理」不在里面。 */
  navOrder: PersonPublicNavKey[];
  /** 后台左侧内容栏目顺序，拖动后同步到前台 navOrder。 */
  adminColumnOrder: PersonAdminColumnKey[];
  /** false 时前台不显示 GitHub，后台仍可改账号。 */
  showGithub: boolean;
};

export type PersonEntryPayload = {
  id: string;
  kind: PersonEntryKind;
  title: string;
  summary: string;
  body: string;
  coverUrl: string;
  images: string[];
  collectionId: string;
  tags: string[];
  allowDownload: boolean;
  org: string;
  role: string;
  period: string;
  location: string;
  link: string;
  sortOrder: number;
  published: boolean;
  featured: boolean;
  occurredAt: string | null;
  updatedAt: string;
  files: PersonEntryFile[];
};

export type PersonCollectionPayload = {
  id: string;
  kind: PersonEntryKind;
  title: string;
  summary: string;
  coverUrl: string;
  sortOrder: number;
  published: boolean;
  updatedAt: string;
  entryCount: number;
};

export const DEFAULT_PERSON_PROFILE: PersonProfilePayload = {
  displayName: "",
  headline: "",
  about: "",
  avatarUrl: "",
  coverUrl: "",
  location: "",
  email: "",
  phone: "",
  wechat: "",
  qq: "",
  website: "",
  github: "",
  linkedin: "",
  zhihu: "",
  weibo: "",
  extraContacts: [],
  sectionLabels: DEFAULT_SECTION_LABELS,
  navOrder: [...PERSON_PUBLIC_NAV_KEYS],
  adminColumnOrder: [...PERSON_ADMIN_COLUMN_KEYS],
  showGithub: true,
};

export function isPersonEntryKind(value: string): value is PersonEntryKind {
  return (PERSON_ENTRY_KINDS as readonly string[]).includes(value);
}

export function isPersonPublicNavKey(value: string): value is PersonPublicNavKey {
  return (PERSON_PUBLIC_NAV_KEYS as readonly string[]).includes(value);
}

export function isPersonAdminColumnKey(value: string): value is PersonAdminColumnKey {
  return (PERSON_ADMIN_COLUMN_KEYS as readonly string[]).includes(value);
}

/** 非法项丢掉，缺的栏目按默认顺序补在后面，保证十个导航都在。 */
export function normalizeNavOrder(raw: unknown): PersonPublicNavKey[] {
  let list: unknown[] = [];
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw || "[]") as unknown[];
    } catch {
      list = [];
    }
  } else if (Array.isArray(raw)) {
    list = raw;
  }
  const seen = new Set<PersonPublicNavKey>();
  const next: PersonPublicNavKey[] = [];
  for (const item of list) {
    const key = String(item);
    if (!isPersonPublicNavKey(key) || seen.has(key)) continue;
    seen.add(key);
    next.push(key);
  }
  for (const key of PERSON_PUBLIC_NAV_KEYS) {
    if (!seen.has(key)) next.push(key);
  }
  return next;
}

export function normalizeAdminColumnOrder(raw: unknown): PersonAdminColumnKey[] {
  let list: unknown[] = [];
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw || "[]") as unknown[];
    } catch {
      list = [];
    }
  } else if (Array.isArray(raw)) {
    list = raw;
  }
  const seen = new Set<PersonAdminColumnKey>();
  const next: PersonAdminColumnKey[] = [];
  for (const item of list) {
    const key = String(item);
    if (!isPersonAdminColumnKey(key) || seen.has(key)) continue;
    seen.add(key);
    next.push(key);
  }
  for (const key of PERSON_ADMIN_COLUMN_KEYS) {
    if (!seen.has(key)) next.push(key);
  }
  return next;
}

export function navOrderFromAdminColumns(
  columns: readonly string[],
  currentNav: readonly string[] = PERSON_PUBLIC_NAV_KEYS,
): PersonPublicNavKey[] {
  const current = normalizeNavOrder(currentNav);
  const mapped: PersonPublicNavKey[] = [];
  const seen = new Set<PersonPublicNavKey>();
  for (const column of normalizeAdminColumnOrder(columns)) {
    const nav = PERSON_ADMIN_COLUMN_TO_NAV[column];
    if (seen.has(nav)) continue;
    seen.add(nav);
    mapped.push(nav);
  }
  const aboutIndex = Math.max(0, current.indexOf("about"));
  const next = [...mapped];
  next.splice(aboutIndex, 0, "about");
  return normalizeNavOrder(next);
}

export function adminColumnsFromNavOrder(
  navOrder: readonly string[],
  currentColumns?: readonly string[],
): PersonAdminColumnKey[] {
  const current = normalizeAdminColumnOrder(currentColumns);
  const grouped = new Map<PersonPublicNavKey, PersonAdminColumnKey[]>();
  for (const column of current) {
    const nav = PERSON_ADMIN_COLUMN_TO_NAV[column];
    const list = grouped.get(nav) || [];
    list.push(column);
    grouped.set(nav, list);
  }
  const next: PersonAdminColumnKey[] = [];
  for (const key of normalizeNavOrder(navOrder)) {
    if (key === "about") continue;
    const existing = grouped.get(key);
    if (existing?.length) {
      next.push(...existing);
      continue;
    }
    next.push(...(PERSON_NAV_TO_ADMIN_COLUMNS[key] || []));
  }
  return normalizeAdminColumnOrder(next);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function clipUrl(raw: unknown): string {
  const text = clip(raw, PERSON_URL_MAX);
  if (!text) return "";
  if (/^(https?:\/\/|\/uploads\/|\/|mailto:|tel:)/i.test(text)) return text;
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(text)) return `https://${text}`;
  return "";
}

function clipLabel(raw: unknown, fallback: string): string {
  return clip(raw, PERSON_LABEL_MAX) || fallback;
}

function readLabelGroup<K extends string>(
  raw: unknown,
  keys: readonly K[],
  fallback: Record<K, string>,
): Record<K, string> {
  const input = (
    raw && typeof raw === "object" ? raw : {}
  ) as Partial<Record<K, unknown>>;
  const next: Record<K, string> = { ...fallback };
  for (const key of keys) {
    next[key] = clipLabel(input[key], fallback[key]);
  }
  return next;
}

export function mergeSectionLabels(
  base: PersonSectionLabels,
  patch: unknown,
): PersonSectionLabels {
  if (patch == null || patch === "") return normalizeSectionLabels(base);
  let value = patch;
  if (typeof patch === "string") {
    try {
      value = JSON.parse(patch || "{}");
    } catch {
      return normalizeSectionLabels(base);
    }
  }
  const input = value && typeof value === "object" ? (value as Partial<PersonSectionLabels>) : {};
  return normalizeSectionLabels({
    admin: { ...base.admin, ...input.admin },
    kinds: { ...base.kinds, ...input.kinds },
    nav: { ...base.nav, ...input.nav },
    home: { ...base.home, ...input.home },
  });
}

export function normalizeSectionLabels(raw: unknown): PersonSectionLabels {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw || "{}");
    } catch {
      value = {};
    }
  }
  const input = value && typeof value === "object" ? (value as Partial<PersonSectionLabels>) : {};
  return {
    admin: readLabelGroup(input.admin, PERSON_ADMIN_NAV_KEYS, DEFAULT_SECTION_LABELS.admin),
    kinds: readLabelGroup(input.kinds, PERSON_ENTRY_KINDS, DEFAULT_SECTION_LABELS.kinds),
    nav: readLabelGroup(input.nav, PERSON_PUBLIC_NAV_KEYS, DEFAULT_SECTION_LABELS.nav),
    home: readLabelGroup(input.home, PERSON_HOME_TITLE_KEYS, DEFAULT_SECTION_LABELS.home),
  };
}

export function personKindLabel(
  labels: PersonSectionLabels | undefined,
  kind: PersonEntryKind,
): string {
  return labels?.kinds[kind] || PERSON_ENTRY_KIND_LABEL[kind];
}

export function normalizeExtraContacts(raw: unknown): PersonExtraContact[] {
  let list: unknown[] = [];
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw || "[]") as unknown[];
    } catch {
      list = [];
    }
  } else if (Array.isArray(raw)) {
    list = raw;
  }
  return list
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      label: clip(item.label, 20),
      value: clip(item.value, PERSON_CONTACT_MAX),
      href: clipUrl(item.href),
    }))
    .filter((item) => item.label || item.value)
    .slice(0, PERSON_MAX_EXTRA_CONTACTS);
}

export function normalizeTagList(raw: unknown): string[] {
  let list: unknown[] = [];
  if (typeof raw === "string") {
    const text = raw.trim();
    if (text.startsWith("[")) {
      try {
        list = JSON.parse(text || "[]") as unknown[];
      } catch {
        list = text.split(/[,，#]/);
      }
    } else if (text) {
      list = text.split(/[,，#\s]+/);
    }
  } else if (Array.isArray(raw)) {
    list = raw;
  }
  const seen = new Set<string>();
  const next: string[] = [];
  for (const item of list) {
    const tag = clip(item, PERSON_TAG_MAX);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    next.push(tag);
    if (next.length >= PERSON_MAX_TAGS) break;
  }
  return next;
}

export function normalizeImageList(raw: unknown): string[] {
  let list: unknown[] = [];
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw || "[]") as unknown[];
    } catch {
      list = [];
    }
  } else if (Array.isArray(raw)) {
    list = raw;
  }
  return list
    .map((item) => clipUrl(item))
    .filter(Boolean)
    .slice(0, PERSON_MAX_IMAGES);
}

function navOrderFromLabelsBlob(raw: unknown): unknown {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw || "{}");
    } catch {
      return undefined;
    }
  }
  if (value && typeof value === "object" && "navOrder" in value) {
    return (value as { navOrder?: unknown }).navOrder;
  }
  return undefined;
}

function adminColumnOrderFromLabelsBlob(raw: unknown): unknown {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw || "{}");
    } catch {
      return undefined;
    }
  }
  if (value && typeof value === "object" && "adminColumnOrder" in value) {
    return (value as { adminColumnOrder?: unknown }).adminColumnOrder;
  }
  return undefined;
}

function showGithubFromLabelsBlob(raw: unknown): boolean | undefined {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw || "{}");
    } catch {
      return undefined;
    }
  }
  if (value && typeof value === "object" && "showGithub" in value) {
    return Boolean((value as { showGithub?: unknown }).showGithub);
  }
  return undefined;
}

export function normalizePersonProfile(raw: unknown): PersonProfilePayload {
  const input = raw && typeof raw === "object" ? (raw as Partial<PersonProfilePayload>) : {};
  const navOrderRaw =
    input.navOrder != null ? input.navOrder : navOrderFromLabelsBlob(input.sectionLabels);
  const adminColumnRaw =
    input.adminColumnOrder != null
      ? input.adminColumnOrder
      : adminColumnOrderFromLabelsBlob(input.sectionLabels);
  const showGithubRaw =
    input.showGithub != null ? input.showGithub : showGithubFromLabelsBlob(input.sectionLabels);
  const navOrder = normalizeNavOrder(navOrderRaw);
  return {
    displayName: clip(input.displayName, PERSON_NAME_MAX),
    headline: clip(input.headline, PERSON_HEADLINE_MAX),
    about: String(input.about ?? "").replace(/\u0000/g, "").trim().slice(0, PERSON_ABOUT_MAX),
    avatarUrl: clipUrl(input.avatarUrl),
    coverUrl: clipUrl(input.coverUrl),
    location: clip(input.location, PERSON_CONTACT_MAX),
    email: clip(input.email, PERSON_CONTACT_MAX),
    phone: clip(input.phone, PERSON_CONTACT_MAX),
    wechat: clip(input.wechat, PERSON_CONTACT_MAX),
    qq: clip(input.qq, PERSON_CONTACT_MAX),
    website: clipUrl(input.website),
    github: clipUrl(input.github) || clip(input.github, PERSON_CONTACT_MAX),
    linkedin: clipUrl(input.linkedin),
    zhihu: clipUrl(input.zhihu),
    weibo: clipUrl(input.weibo),
    extraContacts: normalizeExtraContacts(input.extraContacts),
    sectionLabels: normalizeSectionLabels(input.sectionLabels),
    navOrder,
    adminColumnOrder:
      adminColumnRaw != null
        ? normalizeAdminColumnOrder(adminColumnRaw)
        : adminColumnsFromNavOrder(navOrder),
    showGithub: showGithubRaw !== false,
  };
}

export function normalizePersonEntry(
  raw: unknown,
  fallbackKind: PersonEntryKind = "PROJECT",
): Omit<PersonEntryPayload, "id" | "updatedAt"> & { id?: string } {
  const input = raw && typeof raw === "object" ? (raw as Partial<PersonEntryPayload>) : {};
  const kind = isPersonEntryKind(String(input.kind || ""))
    ? (input.kind as PersonEntryKind)
    : fallbackKind;
  const sort = Number(input.sortOrder);
  return {
    id: input.id ? String(input.id) : undefined,
    kind,
    title: clip(input.title, PERSON_TITLE_MAX),
    summary: clip(input.summary, PERSON_SUMMARY_MAX),
    body: String(input.body ?? "").replace(/\u0000/g, "").trim().slice(0, PERSON_BODY_MAX),
    coverUrl: clipUrl(input.coverUrl),
    images: normalizeImageList(input.images),
    files: normalizePersonFiles(input.files),
    collectionId: clip(input.collectionId, 40),
    tags: normalizeTagList((input as { tags?: unknown }).tags ?? (input as { tagsJson?: unknown }).tagsJson),
    allowDownload: Boolean(input.allowDownload),
    org: clip(input.org, PERSON_TITLE_MAX),
    role: clip(input.role, PERSON_TITLE_MAX),
    period: clip(input.period, PERSON_CONTACT_MAX),
    location: clip(input.location, PERSON_CONTACT_MAX),
    link: clipUrl(input.link),
    sortOrder: Number.isFinite(sort) ? Math.max(0, Math.min(9999, Math.round(sort))) : 0,
    published: input.published !== false,
    featured: Boolean(input.featured),
    occurredAt: input.occurredAt ? String(input.occurredAt) : null,
  };
}

export type PersonContactChip = {
  key: string;
  label: string;
  value: string;
  href: string;
};

function githubHref(raw: string): string {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://github.com/${raw.replace(/^@/, "")}`;
}

/** 前台联系条：有值才展示，顺序固定，方便以后加渠道只改这里 */
export function buildPersonContactChips(
  profile: PersonProfilePayload,
): PersonContactChip[] {
  const chips: PersonContactChip[] = [];
  if (profile.email) {
    chips.push({
      key: "email",
      label: "邮箱",
      value: profile.email,
      href: `mailto:${profile.email}`,
    });
  }
  if (profile.phone) {
    chips.push({
      key: "phone",
      label: "电话",
      value: profile.phone,
      href: `tel:${profile.phone}`,
    });
  }
  if (profile.wechat) {
    chips.push({ key: "wechat", label: "微信", value: profile.wechat, href: "" });
  }
  if (profile.qq) {
    chips.push({ key: "qq", label: "QQ", value: profile.qq, href: "" });
  }
  if (profile.location) {
    chips.push({
      key: "location",
      label: "地点",
      value: profile.location,
      href: "",
    });
  }
  if (profile.github && profile.showGithub !== false) {
    chips.push({
      key: "github",
      label: "GitHub",
      value: "GitHub",
      href: githubHref(profile.github),
    });
  }
  if (profile.linkedin) {
    chips.push({
      key: "linkedin",
      label: "LinkedIn",
      value: "LinkedIn",
      href: profile.linkedin,
    });
  }
  if (profile.zhihu) {
    chips.push({
      key: "zhihu",
      label: "知乎",
      value: "知乎",
      href: profile.zhihu,
    });
  }
  if (profile.weibo) {
    chips.push({
      key: "weibo",
      label: "微博",
      value: "微博",
      href: profile.weibo,
    });
  }
  for (const extra of profile.extraContacts) {
    chips.push({
      key: `extra-${extra.label}`,
      label: extra.label || "联系",
      value: extra.value || extra.label,
      href: extra.href,
    });
  }
  return chips;
}

export function splitPersonAbout(about: string): string[] {
  return about
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function personEntrySectionHref(kind: PersonEntryKind): string {
  if (kind === "RESUME") return "/about/person/resume";
  if (kind === "INTRO_VIDEO") return "/about/person/intro";
  if (kind === "PROJECT") return "/about/person/projects";
  if (kind === "BLOG") return "/about/person/blog";
  if (kind === "PORTFOLIO") return "/about/person/portfolio";
  if (kind === "HONOR" || kind === "GRADE") return "/about/person/honors";
  if (kind === "PHOTO") return "/about/person/photos";
  return "/about/person/life";
}

export function personEntryHref(entry: Pick<PersonEntryPayload, "kind" | "id">): string {
  if (entry.kind === "PROJECT") return `/about/person/projects/${entry.id}`;
  if (entry.kind === "BLOG") return `/about/person/blog/${entry.id}`;
  return `/about/person/e/${entry.id}`;
}

export function personCollectionHref(id: string): string {
  return `/about/person/c/${encodeURIComponent(id)}`;
}

export function normalizePersonCollection(
  raw: unknown,
  fallbackKind: PersonEntryKind = "PORTFOLIO",
): Omit<PersonCollectionPayload, "id" | "updatedAt" | "entryCount"> & { id?: string } {
  const input = raw && typeof raw === "object" ? (raw as Partial<PersonCollectionPayload>) : {};
  const kind = isPersonEntryKind(String(input.kind || ""))
    ? (input.kind as PersonEntryKind)
    : fallbackKind;
  const sort = Number(input.sortOrder);
  return {
    id: input.id ? String(input.id) : undefined,
    kind,
    title: clip(input.title, PERSON_TITLE_MAX),
    summary: clip(input.summary, PERSON_SUMMARY_MAX),
    coverUrl: clipUrl(input.coverUrl),
    sortOrder: Number.isFinite(sort) ? Math.max(0, Math.min(9999, Math.round(sort))) : 0,
    published: input.published !== false,
  };
}

export function personAdminColumnHref(key: PersonAdminColumnKey) {
  if (key === "SOCIAL") return "/person-admin/social";
  return `/person-admin/entries/${key.toLowerCase()}`;
}

export function personAdminColumnLabel(
  labels: PersonSectionLabels,
  key: PersonAdminColumnKey,
) {
  if (key === "SOCIAL") return labels.admin.social;
  return labels.kinds[key];
}

export function personAdminPinnedLinks(labels: PersonSectionLabels) {
  return [
    {
      href: "/person-admin",
      label: labels.admin.overview,
      exact: true as const,
      pinned: true as const,
      columnKey: undefined as PersonAdminColumnKey | undefined,
    },
    {
      href: "/person-admin/profile",
      label: labels.admin.profile,
      exact: false as const,
      pinned: true as const,
      columnKey: undefined as PersonAdminColumnKey | undefined,
    },
    {
      href: "/person-admin/sections",
      label: labels.admin.sections,
      exact: false as const,
      pinned: true as const,
      columnKey: undefined as PersonAdminColumnKey | undefined,
    },
  ];
}

export function personAdminColumnLinks(
  labels: PersonSectionLabels,
  columnOrder?: readonly string[],
) {
  return normalizeAdminColumnOrder(columnOrder).map((key) => ({
    href: personAdminColumnHref(key),
    label: personAdminColumnLabel(labels, key),
    exact: false as const,
    pinned: false as const,
    columnKey: key,
  }));
}

export function personAdminNavLinks(
  labels: PersonSectionLabels,
  columnOrder?: readonly string[],
) {
  return [...personAdminPinnedLinks(labels), ...personAdminColumnLinks(labels, columnOrder)];
}

export const PERSON_NAV_PAGE_HREF: Record<PersonPublicNavKey, string> = {
  about: "/about/person",
  resume: "/about/person/resume",
  intro: "/about/person/intro",
  projects: "/about/person/projects",
  blog: "/about/person/blog",
  portfolio: "/about/person/portfolio",
  honors: "/about/person/honors",
  life: "/about/person/life",
  photos: "/about/person/photos",
  social: "/about/person/social",
};

/** 前台每个内容栏目对应哪些后台合集种类。关于是档案正文，自媒体走同步合集。 */
export const PERSON_NAV_COLLECTION_KINDS: Partial<
  Record<PersonPublicNavKey, readonly PersonEntryKind[]>
> = {
  resume: ["RESUME"],
  intro: ["INTRO_VIDEO"],
  projects: ["PROJECT"],
  blog: ["BLOG"],
  portfolio: ["PORTFOLIO"],
  honors: ["HONOR", "GRADE"],
  life: ["PRACTICE", "ACTIVITY", "INTEREST"],
  photos: ["PHOTO"],
};

export function personCollectionsForNav(
  key: PersonPublicNavKey,
  byKind: Partial<Record<PersonEntryKind, PersonCollectionPayload[]>>,
): PersonCollectionPayload[] {
  return (PERSON_NAV_COLLECTION_KINDS[key] ?? []).flatMap((kind) => byKind[kind] ?? []);
}

export const PERSON_HOME_NAV_SECTIONS = PERSON_PUBLIC_NAV_KEYS.filter(
  (key): key is Exclude<PersonPublicNavKey, "about"> => key !== "about",
).map((key) => ({
  key,
  id: key,
  href: PERSON_NAV_PAGE_HREF[key],
}));

export function personPublicNavLinks(
  labels: PersonSectionLabels,
  mode: "pages" | "home" = "pages",
  navOrder: readonly string[] = PERSON_PUBLIC_NAV_KEYS,
) {
  return normalizeNavOrder(navOrder).map((key) => {
    if (key === "about") {
      return {
        href: mode === "home" ? "/about/person#about" : PERSON_NAV_PAGE_HREF.about,
        label: labels.nav.about,
        match: "exact" as const,
      };
    }
    const href = PERSON_NAV_PAGE_HREF[key];
    return {
      href: mode === "home" ? `/about/person#${key}` : href,
      label: labels.nav[key],
      match: "prefix" as const,
    };
  });
}
