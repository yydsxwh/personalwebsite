import { NextResponse } from "next/server";
import { isTabContextId, TAB_HEADER } from "@andyyyds/shared/tab-decision";
import { updateWwwTab } from "@andyyyds/shared/www-tab-broker";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return NextResponse.json({ error: "请求来源不被接受" }, { status: 403 });
  }
  if (!isTabContextId(request.headers.get(TAB_HEADER))) {
    return NextResponse.json({ error: "缺少标签页" }, { status: 400 });
  }
  let body: { op?: string; role?: string } = {};
  try { body = (await request.json()) as typeof body; } catch { body = {}; }
  if (body.op !== "logout-tab" && body.op !== "role") {
    return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
  }
  const result = await updateWwwTab({ op: body.op, role: body.role });
  return NextResponse.json(result, { headers: { "cache-control": "private, no-store" } });
}
