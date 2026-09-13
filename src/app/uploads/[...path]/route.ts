/**
 * GET /uploads/...
 * 生产环境 next start 不会自动提供构建之后新写入 public/uploads 的文件，这里按路径读盘。
 */

import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

function resolveUpload(parts: string[]): string | null {
  if (!parts.length) return null;
  if (parts.some((part) => part === "." || part === ".." || part.includes("\0"))) return null;
  const absolute = path.resolve(UPLOADS_ROOT, ...parts);
  const root = UPLOADS_ROOT.endsWith(path.sep) ? UPLOADS_ROOT : `${UPLOADS_ROOT}${path.sep}`;
  if (absolute !== UPLOADS_ROOT && !absolute.startsWith(root)) return null;
  return absolute;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const filePath = resolveUpload((await ctx.params).path || []);
  if (!filePath) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
