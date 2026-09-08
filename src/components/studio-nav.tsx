import Link from "next/link";

const ADMIN_LINKS = [
  { key: "person-site", href: "/person-admin", label: "个人展示后台" },
  { key: "person-social", href: "/studio/person-social", label: "个人IP投稿" },
] as const;

export async function StudioNav({
  current,
}: {
  current:
    | "overview"
    | "media"
    | "courses"
    | "compose"
    | "distribution"
    | "marketing"
    | "orders"
    | "admin"
    | "users"
    | "merchants"
    | "products"
    | "shop"
    | "meetup"
    | "forum"
    | "decorate"
    | "templates"
    | "cms"
    | "wechat-mp"
    | "person-social"
    | "person-site"
    | "bg-music"
    | "settings";
  area?: "creator" | "admin";
}) {
  return (
    <nav
      className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="个人 IP 后台导航"
    >
      {ADMIN_LINKS.map((link) => {
        const active = current === link.key;
        return (
          <Link
            key={link.key}
            href={link.href}
            className={`chip shrink-0 touch-manipulation whitespace-nowrap text-base ${
              active ? "chip-active" : "chip-idle"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
