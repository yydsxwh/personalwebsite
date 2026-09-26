import { notFound } from "next/navigation";
import { PersonAdminEntriesPanel } from "@andyyyds/person/components/person-admin-entries-panel";
import { isPersonEntryKind, personKindLabel } from "@andyyyds/person/lib/person-site";
import { getPersonProfile } from "@andyyyds/person/lib/person-site-store";

export default async function PersonAdminEntriesPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const normalized = kind.toUpperCase();
  if (!isPersonEntryKind(normalized)) notFound();
  const profile = await getPersonProfile();
  return (
    <PersonAdminEntriesPanel
      kind={normalized}
      label={personKindLabel(profile.sectionLabels, normalized)}
    />
  );
}
