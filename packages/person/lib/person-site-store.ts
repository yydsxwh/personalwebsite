/**
 * 个人展示站读写。新站档案默认空白，由站长自己填，不预填示例个人信息。
 */

import { prisma } from "@andyyyds/shared/db";
import { normalizePersonFiles } from "@andyyyds/person/lib/person-files";
import {
  DEFAULT_PERSON_PROFILE,
  PERSON_PROFILE_ID,
  isPersonEntryKind,
  mergeSectionLabels,
  normalizeImageList,
  normalizePersonEntry,
  normalizePersonProfile,
  type PersonEntryKind,
  type PersonEntryPayload,
  type PersonProfilePayload,
} from "@andyyyds/person/lib/person-site";

function parseOccurredAt(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toEntryPayload(row: {
  id: string;
  kind: string;
  title: string;
  summary: string;
  body: string;
  coverUrl: string;
  images: string;
  files?: string;
  org: string;
  role: string;
  period: string;
  location: string;
  link: string;
  sortOrder: number;
  published: boolean;
  featured: boolean;
  occurredAt: Date | null;
  updatedAt: Date;
}): PersonEntryPayload {
  const kind = isPersonEntryKind(row.kind) ? row.kind : "PROJECT";
  return {
    id: row.id,
    kind,
    title: row.title,
    summary: row.summary,
    body: row.body,
    coverUrl: row.coverUrl,
    images: normalizeImageList(row.images),
    files: normalizePersonFiles(row.files),
    org: row.org,
    role: row.role,
    period: row.period,
    location: row.location,
    link: row.link,
    sortOrder: row.sortOrder,
    published: row.published,
    featured: row.featured,
    occurredAt: row.occurredAt ? row.occurredAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function fallbackEmptyProfile(): Promise<PersonProfilePayload> {
  return normalizePersonProfile(DEFAULT_PERSON_PROFILE);
}

export async function getPersonProfile(): Promise<PersonProfilePayload> {
  const row = await prisma.personProfile.findUnique({
    where: { id: PERSON_PROFILE_ID },
  });
  if (!row) return fallbackEmptyProfile();
  return normalizePersonProfile({
    ...row,
    extraContacts: row.extraContacts,
    sectionLabels: row.sectionLabelsJson,
  });
}

export async function savePersonProfile(
  input: unknown,
): Promise<PersonProfilePayload> {
  const existing = await getPersonProfile();
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const profile = normalizePersonProfile({
    ...existing,
    ...raw,
    extraContacts: "extraContacts" in raw ? raw.extraContacts : existing.extraContacts,
    sectionLabels:
      "sectionLabels" in raw
        ? mergeSectionLabels(existing.sectionLabels, raw.sectionLabels)
        : existing.sectionLabels,
    navOrder: "navOrder" in raw ? raw.navOrder : existing.navOrder,
  });
  const { extraContacts, sectionLabels, navOrder, ...scalars } = profile;
  const sectionLabelsJson = JSON.stringify({ ...sectionLabels, navOrder });
  await prisma.personProfile.upsert({
    where: { id: PERSON_PROFILE_ID },
    create: {
      id: PERSON_PROFILE_ID,
      ...scalars,
      extraContacts: JSON.stringify(extraContacts),
      sectionLabelsJson,
    },
    update: {
      ...scalars,
      extraContacts: JSON.stringify(extraContacts),
      sectionLabelsJson,
    },
  });
  return profile;
}

export async function listPersonEntries(input?: {
  kind?: PersonEntryKind;
  publishedOnly?: boolean;
  featuredOnly?: boolean;
}): Promise<PersonEntryPayload[]> {
  const rows = await prisma.personEntry.findMany({
    where: {
      kind: input?.kind,
      published: input?.publishedOnly ? true : undefined,
      featured: input?.featuredOnly ? true : undefined,
    },
    orderBy: [{ sortOrder: "asc" }, { occurredAt: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(toEntryPayload);
}

export async function getPersonEntry(
  id: string,
  publishedOnly = false,
): Promise<PersonEntryPayload | null> {
  const row = await prisma.personEntry.findUnique({ where: { id } });
  if (!row) return null;
  if (publishedOnly && !row.published) return null;
  return toEntryPayload(row);
}

export async function getPersonEntryFile(
  entryId: string,
  fileId: string,
  publishedOnly = false,
) {
  const entry = await getPersonEntry(entryId, publishedOnly);
  if (!entry) return null;
  const file = entry.files.find((item) => item.id === fileId);
  if (!file) return null;
  return { entry, file };
}

export async function createPersonEntry(input: unknown): Promise<PersonEntryPayload> {
  const data = normalizePersonEntry(input);
  const count = await prisma.personEntry.count({ where: { kind: data.kind } });
  const row = await prisma.personEntry.create({
    data: {
      kind: data.kind,
      title: data.title || defaultEntryTitle(data.kind),
      summary: data.summary,
      body: data.body,
      coverUrl: data.coverUrl,
      images: JSON.stringify(data.images),
      files: JSON.stringify(data.files),
      org: data.org,
      role: data.role,
      period: data.period,
      location: data.location,
      link: data.link,
      sortOrder: data.sortOrder || count,
      published: data.published,
      featured: data.featured,
      occurredAt: parseOccurredAt(data.occurredAt),
    },
  });
  return toEntryPayload(row);
}

function defaultEntryTitle(kind: PersonEntryKind): string {
  if (kind === "PHOTO") return "照片";
  if (kind === "INTEREST") return "兴趣";
  if (kind === "RESUME") return "简历";
  if (kind === "INTRO_VIDEO") return "视频自我介绍";
  return "未命名";
}

export async function updatePersonEntry(
  id: string,
  input: unknown,
): Promise<PersonEntryPayload | null> {
  const existing = await prisma.personEntry.findUnique({ where: { id } });
  if (!existing) return null;
  const data = normalizePersonEntry(input, isPersonEntryKind(existing.kind) ? existing.kind : "PROJECT");
  const row = await prisma.personEntry.update({
    where: { id },
    data: {
      kind: data.kind,
      title: data.title || existing.title,
      summary: data.summary,
      body: data.body,
      coverUrl: data.coverUrl,
      images: JSON.stringify(data.images),
      files: JSON.stringify(data.files),
      org: data.org,
      role: data.role,
      period: data.period,
      location: data.location,
      link: data.link,
      sortOrder: data.sortOrder,
      published: data.published,
      featured: data.featured,
      occurredAt: parseOccurredAt(data.occurredAt),
    },
  });
  return toEntryPayload(row);
}

export async function deletePersonEntry(id: string): Promise<boolean> {
  const result = await prisma.personEntry.deleteMany({ where: { id } });
  return result.count > 0;
}

export async function loadPersonSitePublic() {
  const [profile, entries] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ publishedOnly: true }),
  ]);
  const byKind = (kind: PersonEntryKind) => entries.filter((item) => item.kind === kind);
  return {
    profile,
    featured: entries.filter((item) => item.featured),
    projects: byKind("PROJECT"),
    blogs: byKind("BLOG"),
    portfolio: byKind("PORTFOLIO"),
    honors: byKind("HONOR"),
    grades: byKind("GRADE"),
    practices: byKind("PRACTICE"),
    activities: byKind("ACTIVITY"),
    interests: byKind("INTEREST"),
    photos: byKind("PHOTO"),
    resumes: byKind("RESUME"),
    introVideos: byKind("INTRO_VIDEO"),
  };
}
