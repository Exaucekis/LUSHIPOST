import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { PREFERENCE_VALUES, normalizePreferences } from "@/lib/account-preferences";
import prisma from "@/lib/prisma";

const username = z
  .string()
  .trim()
  .min(3, "Le nom d’utilisateur doit contenir au moins 3 caractères.")
  .max(30, "Le nom d’utilisateur ne peut pas dépasser 30 caractères.")
  .regex(/^[a-z0-9][a-z0-9_-]*$/i, "Utilisez uniquement des lettres, chiffres, tirets et underscores.");

const updateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    username: username.nullable().optional(),
    preferences: z.array(z.enum(PREFERENCE_VALUES as [string, ...string[]])).max(20).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Aucune modification fournie.");

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      preferences: true,
      createdAt: true,
      image: true,
      accounts: { where: { provider: "google" }, select: { provider: true } },
    },
  });
}

function serializeUser(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    image: user.image,
    createdAt: user.createdAt,
    preferences: normalizePreferences(user.preferences),
    googleConnected: user.accounts.length > 0,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  return NextResponse.json({ user: serializeUser(user) });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const changes = updateSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(changes.name !== undefined ? { name: changes.name } : {}),
        ...(changes.username !== undefined
          ? { username: changes.username ? changes.username.toLowerCase() : null }
          : {}),
        ...(changes.preferences !== undefined ? { preferences: changes.preferences } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        preferences: true,
        createdAt: true,
        image: true,
        accounts: { where: { provider: "google" }, select: { provider: true } },
      },
    });
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Données invalides." }, { status: 400 });
    }
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Ce nom d’utilisateur est déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Impossible de mettre à jour votre profil." }, { status: 500 });
  }
}
