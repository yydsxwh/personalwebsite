"use client";

import { useState } from "react";

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "登录失败");
        return;
      }
      const dest =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/person-admin";
      window.location.href = dest;
    } catch {
      setError("网络异常，请重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm">
        邮箱
        <input
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="邮箱"
          autoComplete="username"
          required
        />
      </label>
      <label className="block text-sm">
        密码
        <input
          className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="密码"
          autoComplete="current-password"
          required
          minLength={6}
        />
      </label>
      {error ? <p className="text-sm text-[var(--fire-strong)]">{error}</p> : null}
      <button type="submit" className="btn btn-primary min-h-11 w-full" disabled={pending}>
        {pending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
