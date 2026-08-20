import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(2),
  url: z
    .string()
    .min(8, "URL trop courte")
    .transform((value) => {
      const trimmed = value.trim();
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    })
    .refine((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "URL invalide"),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

const settingsSchema = z.object({
  tagline: z.string().min(5).max(200),
  socialLinks: z.array(socialLinkSchema),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "settings:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [taglineSetting, socialLinks] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "site_tagline" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
  ]);

  return NextResponse.json({
    tagline: taglineSetting?.value || "L'information au cœur de Lubumbashi.",
    socialLinks,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "settings:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = settingsSchema.parse(body);

    await prisma.setting.upsert({
      where: { key: "site_tagline" },
      update: { value: data.tagline },
      create: { key: "site_tagline", value: data.tagline },
    });

    await prisma.$transaction(async (tx) => {
      const incomingIds = data.socialLinks
        .map((link) => link.id)
        .filter((id): id is string => Boolean(id));

      if (incomingIds.length > 0) {
        await tx.socialLink.deleteMany({
          where: { id: { notIn: incomingIds } },
        });
      } else {
        await tx.socialLink.deleteMany();
      }

      for (const [index, link] of data.socialLinks.entries()) {
        if (link.id) {
          await tx.socialLink.update({
            where: { id: link.id },
            data: {
              platform: link.platform,
              url: link.url,
              isActive: link.isActive,
              order: index,
            },
          });
        } else {
          await tx.socialLink.create({
            data: {
              platform: link.platform,
              url: link.url,
              isActive: link.isActive,
              order: index,
            },
          });
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Settings",
        userId: session.user.id,
        details: { taglineUpdated: true, socialCount: data.socialLinks.length },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
