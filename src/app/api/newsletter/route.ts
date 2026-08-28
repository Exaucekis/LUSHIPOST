import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email: rawEmail } = schema.parse(body);
    const email = rawEmail.toLowerCase().trim();

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        { error: "La newsletter n'est pas encore configurée." },
        { status: 503 }
      );
    }

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

    const confirmationUrl = `${getSiteUrl()}/api/newsletter/confirm?token=${confirmToken}`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@lushipost.com",
      to: email,
      subject: "Confirmez votre inscription à la newsletter LUBUMBASHIPOST",
      text: `Confirmez votre inscription : ${confirmationUrl}`,
      html: `<p>Confirmez votre inscription à la newsletter LUBUMBASHIPOST :</p><p><a href="${confirmationUrl}">Confirmer mon inscription</a></p>`,
    });

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
