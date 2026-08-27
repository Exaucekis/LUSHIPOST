import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { canPublish } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { slugifyTitle } from "@/lib/article-schema";
import { videoEmbedUrl, videoPlatform } from "@/lib/video-url";

const schema = z.object({ title: z.string().min(5), description: z.string().optional(), videoUrl: z.string().url(), thumbnail: z.string().url().optional().or(z.literal("")), isVertical: z.boolean().optional() });
export async function GET() { const s = await getServerSession(authOptions); if (!s || !canPublish(s.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); return NextResponse.json({ videos: await prisma.video.findMany({ orderBy: { createdAt: "desc" } }) }); }
export async function POST(request: Request) { const s = await getServerSession(authOptions); if (!s || !canPublish(s.user.role)) return NextResponse.json({ error: "Réservé au super-administrateur" }, { status: 403 }); try { const d = schema.parse(await request.json()); const video = await prisma.video.create({ data: { title: d.title, slug: `${slugifyTitle(d.title)}-${Date.now()}`, description: d.description || null, videoUrl: videoEmbedUrl(d.videoUrl), platform: videoPlatform(d.videoUrl), thumbnail: d.thumbnail || null, isVertical: d.isVertical ?? false, publishedAt: new Date() } }); return NextResponse.json({ video }, { status: 201 }); } catch (e) { return NextResponse.json({ error: e instanceof z.ZodError ? e.errors[0].message : "Création impossible" }, { status: 400 }); } }
