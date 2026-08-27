import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const destination = new URL("/newsletter/confirmation", request.url);

  if (!token) {
    destination.searchParams.set("status", "invalid");
    return NextResponse.redirect(destination);
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { confirmToken: token },
    select: { id: true },
  });

  if (!subscriber) {
    destination.searchParams.set("status", "invalid");
    return NextResponse.redirect(destination);
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { isConfirmed: true, confirmToken: null },
  });

  destination.searchParams.set("status", "confirmed");
  return NextResponse.redirect(destination);
}
