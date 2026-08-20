import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { isStaffRole } from "@/lib/roles";
import { Role } from "@prisma/client";

const schema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);
    const normalized = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { role: true, isActive: true },
    });

    if (user && isStaffRole(user.role)) {
      if (!user.isActive) {
        return NextResponse.json(
          { type: "staff", active: false },
          { status: 403 }
        );
      }
      return NextResponse.json({ type: "staff", role: user.role });
    }

    if (user?.role === Role.ABONNE) {
      return NextResponse.json({ type: "subscriber" });
    }

    return NextResponse.json({ type: "new" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Service temporairement indisponible." },
      { status: 503 }
    );
  }
}
