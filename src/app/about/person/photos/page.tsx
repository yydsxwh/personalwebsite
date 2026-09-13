import { personKindMetadata } from "@andyyyds/person/lib/person-page-metadata";

export const dynamic = "force-dynamic";
export function generateMetadata() {
  return personKindMetadata("PHOTO");
}
export { default } from "@andyyyds/person/routes/about/person/photos/page";
