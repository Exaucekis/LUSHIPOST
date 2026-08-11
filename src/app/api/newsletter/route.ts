import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

const schema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing?.isConfirmed) {
      return NextResponse.json(
        { error: "Cette adresse est déjà inscrite à la newsletter." },
        { status: 409 }
      );
    }

    const confirmToken = randomBytes(32).toString("hex");

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { confirmToken },
      create: { email, confirmToken },
    });

    // TODO: envoyer e-mail de confirmation via SMTP

    return NextResponse.json({
      message: "Merci ! Un e-mail de confirmation vous a été envoyé.",
    });
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  await prisma.newsletterSubscriber.deleteMany({
    where: { unsubscribeToken: token },
  });

  return NextResponse.json({ message: "Désabonnement effectué." });
}
