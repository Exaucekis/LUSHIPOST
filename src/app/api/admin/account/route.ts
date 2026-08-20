import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const updateSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
    email: z.string().email("Adresse e-mail invalide").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const changingEmail = Boolean(data.email);
    const changingPassword = Boolean(data.newPassword);

    if ((changingEmail || changingPassword) && !data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le mot de passe actuel est requis",
        path: ["currentPassword"],
      });
    }

    if (changingPassword && data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
      });
    }
  });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    if (!data.name && !data.email && !data.newPassword) {
      return NextResponse.json({ error: "Aucune modification à enregistrer" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const changingEmail = data.email && data.email !== user.email;
    const changingPassword = Boolean(data.newPassword);

    if (changingEmail || changingPassword) {
      const isValid = await bcrypt.compare(
        data.currentPassword || "",
        user.passwordHash
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect" },
          { status: 400 }
        );
      }
    }

    if (changingEmail) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà utilisée" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(changingEmail ? { email: data.email } : {}),
        ...(changingPassword
          ? { passwordHash: await bcrypt.hash(data.newPassword!, 12) }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        details: {
          name: data.name ? true : undefined,
          email: changingEmail ? true : undefined,
          password: changingPassword ? true : undefined,
        },
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
