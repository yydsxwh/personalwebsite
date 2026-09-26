import type { Metadata } from "next";
import Link from "next/link";
import { getPersonProfile } from "@andyyyds/person/lib/person-site-store";
import { getSession } from "@andyyyds/shared/auth";
import { isAdmin } from "@andyyyds/shared/roles";
import "./globals.css";

function siteNameFromProfile(displayName: string) {
  return displayName.trim() || "个人展示";
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getPersonProfile();
  const name = siteNameFromProfile(profile.displayName);
  return {
    title: {
      default: name,
      template: `%s · ${name}`,
    },
    description: profile.headline.trim() || "个人展示站",
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }],
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [session, profile] = await Promise.all([getSession(), getPersonProfile()]);
  const admin = Boolean(session && isAdmin(session));
  const siteName = siteNameFromProfile(profile.displayName);

  return (
    <html lang="zh-Hans" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <header className="glass-bar border-b">
          <div className="container flex min-h-14 items-center justify-between gap-4">
            <Link href="/about/person" className="font-semibold tracking-wide">
              {siteName}
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/about/person" className="text-[var(--muted)] hover:text-[var(--ink)]">
                个人介绍
              </Link>
              {admin ? (
                <>
                  <Link href="/person-admin" className="text-[var(--muted)] hover:text-[var(--ink)]">
                    展示后台
                  </Link>
                  <Link
                    href="/studio/person-social"
                    className="text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    投稿同步
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="text-[var(--muted)] hover:text-[var(--ink)]">
                      退出
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="text-[var(--muted)] hover:text-[var(--ink)]">
                  登录
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
