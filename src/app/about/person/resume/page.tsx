import { personKindMetadata } from "@andyyyds/person/lib/person-page-metadata";

export const dynamic = "force-dynamic";
export function generateMetadata() {
  return personKindMetadata("RESUME");
}
export { default } from "@andyyyds/person/routes/about/person/resume/page";
