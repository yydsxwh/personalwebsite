import { personHomeTitleMetadata } from "@andyyyds/person/lib/person-page-metadata";

export const dynamic = "force-dynamic";
export function generateMetadata() {
  return personHomeTitleMetadata("social");
}
export { default } from "@andyyyds/person/routes/about/person/social/page";
