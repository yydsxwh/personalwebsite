import { redirect } from "next/navigation";
import { PersonAdminShell } from "@andyyyds/person/components/person-admin-shell";
import { getPersonProfile } from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export default async function PersonAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/person-admin");
  if (!isAdmin(session)) redirect("/studio");
  const profile = await getPersonProfile();
  return <PersonAdminShell labels={profile.sectionLabels}>{children}</PersonAdminShell>;
}
