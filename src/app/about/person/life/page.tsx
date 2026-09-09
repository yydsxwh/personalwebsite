import { personHomeTitleMetadata } from "@andyyyds/person/lib/person-page-metadata";

export const dynamic = "force-dynamic";
export function generateMetadata() {
  return personHomeTitleMetadata("lifeGroup");
}
export { default } from "@andyyyds/person/routes/about/person/life/page";
