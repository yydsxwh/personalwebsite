import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "登录",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-[var(--line)] bg-[var(--card)] p-8 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-semibold">登录个人 IP 后台</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          用站长账号管理档案、作品和自媒体同步。
        </p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
