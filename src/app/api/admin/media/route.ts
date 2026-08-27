import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { uploadMediaFile } from "@/lib/storage";
import { MediaType } from "@prisma/client";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "audio/mpeg", "audio/wav", "application/pdf",
]);

function detectMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("video/")) return MediaType.VIDEO;
  if (mimeType.startsWith("audio/")) return MediaType.AUDIO;
  if (mimeType.startsWith("image/")) return MediaType.IMAGE;
  return MediaType.DOCUMENT;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "media:manage") && !hasPermission(session.user.role, "media:upload")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "media:manage") && !hasPermission(session.user.role, "media:upload")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadMediaFile(buffer, file.name, file.type || "application/octet-stream");

    const media = await prisma.media.create({
      data: {
        name: file.name,
        url: uploaded.url,
        type: detectMediaType(file.type),
        mimeType: file.type || null,
        size: file.size,
        userId: session.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPLOAD",
        entity: "Media",
        entityId: media.id,
        userId: session.user.id,
        details: { name: media.name, storage: uploaded.storage },
      },
    });

    return NextResponse.json({
      id: media.id,
      url: media.url,
      name: media.name,
      storage: uploaded.storage,
    });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
