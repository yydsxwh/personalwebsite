import { redirect } from "next/navigation";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";

export const dynamic = "force-dynamic";

export default async function StudioHomePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/studio");
  if (!isAdmin(session)) redirect("/about/person");
  redirect("/person-admin");
}
