import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { PREFERENCE_VALUES, normalizePreferences } from "@/lib/account-preferences";
import prisma from "@/lib/prisma";

const preference = z.enum(PREFERENCE_VALUES as [string, ...string[]]);
const preferences = z.array(preference).max(20);

async function currentUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

async function savePreferences(userId: string, values: string[]) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { preferences: values },
    select: { preferences: true },
  });
  return NextResponse.json({ preferences: normalizePreferences(user.preferences) });
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
  if (!user) return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  return NextResponse.json({ preferences: normalizePreferences(user.preferences) });
}

export async function PUT(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    return await savePreferences(userId, preferences.parse((await request.json()).preferences));
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? "Préférences invalides." : "Impossible d’enregistrer les préférences." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const value = preference.parse((await request.json()).preference);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
    return await savePreferences(userId, Array.from(new Set([...normalizePreferences(user?.preferences), value])));
  } catch {
    return NextResponse.json({ error: "Préférence invalide." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const value = preference.parse((await request.json()).preference);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
    return await savePreferences(userId, normalizePreferences(user?.preferences).filter((item) => item !== value));
  } catch {
    return NextResponse.json({ error: "Préférence invalide." }, { status: 400 });
  }
}
