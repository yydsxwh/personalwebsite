/**
 * POST /api/upload/image
 * 站长上传头像 / 封面 / 条目配图。迁出独立站时补上主站同名接口。
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@andyyyds/shared/studio";
import { storeUpload } from "@andyyyds/shared/storage";
import { personAdminError } from "@andyyyds/person/api/person-admin/respond";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ error: "请选择图片" }, { status: 400 });
    }
    const mime = file.type || "";
    if (!ALLOWED.has(mime)) {
      return NextResponse.json({ error: "只支持 JPG / PNG / WebP / GIF" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "图片不能超过 12MB" }, { status: 400 });
    }

    const name = (file.name || "image.png").replace(/[/\\]/g, "_").slice(0, 180);
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeUpload({
      ownerId: session.id,
      fileName: name,
      buffer,
      mimeType: mime,
      kind: "file",
      subPath: "person/image",
    });

    return NextResponse.json({
      url: stored.fileUrl,
      previewUrl: stored.fileUrl,
    });
  } catch (error) {
    return personAdminError(error);
  }
}
