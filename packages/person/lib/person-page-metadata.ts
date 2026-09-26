import type { Metadata } from "next";
import {
  personKindLabel,
  type PersonEntryKind,
  type PersonHomeTitleKey,
} from "@andyyyds/person/lib/person-site";
import { getPersonProfile } from "@andyyyds/person/lib/person-site-store";

export async function personKindMetadata(kind: PersonEntryKind): Promise<Metadata> {
  const profile = await getPersonProfile();
  return { title: personKindLabel(profile.sectionLabels, kind) };
}

export async function personHomeTitleMetadata(key: PersonHomeTitleKey): Promise<Metadata> {
  const profile = await getPersonProfile();
  return { title: profile.sectionLabels.home[key] };
}
