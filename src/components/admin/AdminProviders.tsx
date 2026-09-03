"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export function AdminProviders({ children, session }: { children: React.ReactNode; session: Session }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
