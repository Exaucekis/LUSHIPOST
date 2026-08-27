import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { isStaffRole, STAFF_ROLES } from "@/lib/roles";
import prisma from "@/lib/prisma";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum([
    Role.SUPER_ADMIN,
    Role.REDACTEUR_EN_CHEF,
    Role.JOURNALISTE,
    Role.EDITEUR,
    Role.MODERATEUR,
    Role.VIDEOASTE,
    Role.ABONNE,
  ] as [string, ...string[]]),
  password: z.string().min(8, "Mot de passe minimum 8 caractères").optional(),
}).superRefine((data, ctx) => {
  if (data.role !== Role.ABONNE && !data.password) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: "Un mot de passe est requis pour la rédaction" });
  }
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "users:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scope = new URL(request.url).searchParams.get("scope");
  const users = await prisma.user.findMany({
    where: scope === "staff" ? { role: { in: STAFF_ROLES } } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "users:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);
    if (data.role === Role.SUPER_ADMIN && session.user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Seul un Super Admin peut créer ce rôle." }, { status: 403 });
    }
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (isStaffRole(existing.role)) {
        return NextResponse.json(
          { error: "Un compte rédaction existe déjà avec cette adresse." },
          { status: 409 }
        );
      }
      const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;
      const user = await prisma.user.update({
        where: { email },
        data: {
          name: data.name,
          role: data.role as Role,
          passwordHash,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      return NextResponse.json(user, { status: 200 });
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;
    const user = await prisma.user.create({
      data: {
        email,
        name: data.name,
        role: data.role as Role,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Impossible de créer l'utilisateur." },
      { status: 500 }
    );
  }
}
