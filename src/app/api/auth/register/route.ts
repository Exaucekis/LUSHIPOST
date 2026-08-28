import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";

const registrationSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(100, "Le nom est trop long."),
  email: z.string().trim().email("Adresse e-mail invalide.").max(254),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(128, "Le mot de passe est trop long."),
});

export async function POST(request: Request) {
  try {
    const input = registrationSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        role: Role.ABONNE,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Données invalides." }, { status: 400 });
    }
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cette adresse e-mail." }, { status: 409 });
    }
    return NextResponse.json({ error: "Impossible de créer le compte. Réessayez." }, { status: 500 });
  }
}
