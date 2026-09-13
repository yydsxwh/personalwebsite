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
  normalizePersonCollection,
  normalizePersonEntry,
  normalizePersonProfile,
  normalizeTagList,
  type PersonCollectionPayload,
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
  collectionId?: string;
  tagsJson?: string;
  allowDownload?: boolean;
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
    collectionId: String(row.collectionId || ""),
    tags: normalizeTagList(row.tagsJson),
    allowDownload: Boolean(row.allowDownload),
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

function toCollectionPayload(
  row: {
    id: string;
    kind: string;
    title: string;
    summary: string;
    coverUrl: string;
    sortOrder: number;
    published: boolean;
    updatedAt: Date;
  },
  entryCount = 0,
): PersonCollectionPayload {
  const kind = isPersonEntryKind(row.kind) ? row.kind : "PORTFOLIO";
  return {
    id: row.id,
    kind,
    title: row.title,
    summary: row.summary,
    coverUrl: row.coverUrl,
    sortOrder: row.sortOrder,
    published: row.published,
    updatedAt: row.updatedAt.toISOString(),
    entryCount,
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
    showGithub: "showGithub" in raw ? raw.showGithub : existing.showGithub,
  });
  const { extraContacts, sectionLabels, navOrder, showGithub, ...scalars } = profile;
  const sectionLabelsJson = JSON.stringify({ ...sectionLabels, navOrder, showGithub });
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
      collectionId: data.collectionId,
      tagsJson: JSON.stringify(data.tags),
      allowDownload: data.allowDownload,
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
      collectionId: data.collectionId,
      tagsJson: JSON.stringify(data.tags),
      allowDownload: data.allowDownload,
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

export async function listPersonCollections(input?: {
  kind?: PersonEntryKind;
  kinds?: PersonEntryKind[];
  publishedOnly?: boolean;
}): Promise<PersonCollectionPayload[]> {
  const kinds = input?.kinds || (input?.kind ? [input.kind] : undefined);
  const rows = await prisma.personCollection.findMany({
    where: {
      kind: kinds ? { in: kinds } : undefined,
      published: input?.publishedOnly ? true : undefined,
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  if (!rows.length) return [];
  const counts = await prisma.personEntry.groupBy({
    by: ["collectionId"],
    where: {
      collectionId: { in: rows.map((row) => row.id) },
      published: input?.publishedOnly ? true : undefined,
    },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((row) => [row.collectionId, row._count._all]));
  return rows.map((row) => toCollectionPayload(row, countMap.get(row.id) || 0));
}

export async function getPersonCollection(
  id: string,
  publishedOnly = false,
): Promise<PersonCollectionPayload | null> {
  const row = await prisma.personCollection.findUnique({ where: { id } });
  if (!row) return null;
  if (publishedOnly && !row.published) return null;
  const entryCount = await prisma.personEntry.count({
    where: {
      collectionId: id,
      published: publishedOnly ? true : undefined,
    },
  });
  return toCollectionPayload(row, entryCount);
}

export async function listPersonEntriesInCollection(
  collectionId: string,
  publishedOnly = false,
): Promise<PersonEntryPayload[]> {
  const rows = await prisma.personEntry.findMany({
    where: {
      collectionId,
      published: publishedOnly ? true : undefined,
    },
    orderBy: [{ sortOrder: "asc" }, { occurredAt: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(toEntryPayload);
}

export async function createPersonCollection(input: unknown): Promise<PersonCollectionPayload> {
  const data = normalizePersonCollection(input);
  const count = await prisma.personCollection.count({ where: { kind: data.kind } });
  const row = await prisma.personCollection.create({
    data: {
      kind: data.kind,
      title: data.title || "未命名合集",
      summary: data.summary,
      coverUrl: data.coverUrl,
      sortOrder: data.sortOrder || count,
      published: data.published,
    },
  });
  return toCollectionPayload(row, 0);
}

export async function updatePersonCollection(
  id: string,
  input: unknown,
): Promise<PersonCollectionPayload | null> {
  const existing = await prisma.personCollection.findUnique({ where: { id } });
  if (!existing) return null;
  const data = normalizePersonCollection(
    input,
    isPersonEntryKind(existing.kind) ? existing.kind : "PORTFOLIO",
  );
  const row = await prisma.personCollection.update({
    where: { id },
    data: {
      kind: data.kind,
      title: data.title || existing.title,
      summary: data.summary,
      coverUrl: data.coverUrl,
      sortOrder: data.sortOrder,
      published: data.published,
    },
  });
  return getPersonCollection(row.id);
}

export async function deletePersonCollection(id: string): Promise<boolean> {
  const existing = await prisma.personCollection.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.personEntry.updateMany({
    where: { collectionId: id },
    data: { collectionId: "" },
  });
  await prisma.personCollection.delete({ where: { id } });
  return true;
}

export async function loadPersonSitePublic() {
  const [profile, entries, collections] = await Promise.all([
    getPersonProfile(),
    listPersonEntries({ publishedOnly: true }),
    listPersonCollections({ publishedOnly: true }),
  ]);
  const byKind = (kind: PersonEntryKind) => entries.filter((item) => item.kind === kind);
  const collectionsByKind = (kind: PersonEntryKind) =>
    collections.filter((item) => item.kind === kind);
  return {
    profile,
    collections,
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
    resumeCollections: collectionsByKind("RESUME"),
    portfolioCollections: collectionsByKind("PORTFOLIO"),
    projectCollections: collectionsByKind("PROJECT"),
  };
}
