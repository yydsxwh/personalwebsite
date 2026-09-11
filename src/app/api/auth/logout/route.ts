import { NextResponse } from "next/server";
import { destroySession } from "@andyyyds/shared/auth";

/** 退出登录：清会话 Cookie，回到个人介绍。 */
export async function POST() {
  await destroySession();
  return NextResponse.redirect(new URL("/about/person", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), {
    status: 303,
  });
}
