import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugifyTitle } from "@/lib/article-schema";
import { videoEmbedUrl, videoPlatform } from "@/lib/video-url";
const schema = z.object({ title: z.string().min(5), description: z.string().optional(), videoUrl: z.string().url(), thumbnail: z.string().url().optional().or(z.literal("")), isVertical: z.boolean().optional() });
export async function POST(request: Request) { const s = await getServerSession(authOptions); if (!s || s.user.role !== "JOURNALISTE") return NextResponse.json({ error: "Forbidden" }, { status: 403 }); try { const d = schema.parse(await request.json()); const video = await prisma.video.create({ data: { title: d.title, slug: `${slugifyTitle(d.title)}-${Date.now()}`, description: d.description || null, videoUrl: videoEmbedUrl(d.videoUrl), platform: videoPlatform(d.videoUrl), thumbnail: d.thumbnail || null, isVertical: d.isVertical ?? false } }); return NextResponse.json({ video }, { status: 201 }); } catch (e) { return NextResponse.json({ error: e instanceof z.ZodError ? e.errors[0].message : "Envoi impossible" }, { status: 400 }); } }
