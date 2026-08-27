"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { User } from "lucide-react";
import { isJournalistRole, isStaffRole } from "@/lib/roles";

export function AccountLink() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-100" />
    );
  }

  if (session && isJournalistRole(session.user.role)) {
    return (
      <Link
        href="/journaliste"
        className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-lp-light hover:text-lp-accent"
      >
        <User className="h-5 w-5" />
        <span className="hidden sm:inline">Mes publications</span>
      </Link>
    );
  }

  if (session && isStaffRole(session.user.role)) {
    return (
      <Link href="/admin" className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-lp-light hover:text-lp-accent">
        <User className="h-5 w-5" />
        <span className="hidden sm:inline">Newsroom</span>
      </Link>
    );
  }

  if (session) {
    return (
      <Link
        href="/compte"
        className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-lp-light hover:text-lp-accent"
      >
        <User className="h-5 w-5" />
        <span className="hidden sm:inline">Mon compte</span>
      </Link>
    );
  }

  return (
    <Link
      href="/connexion"
      className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-lp-light hover:text-lp-accent"
    >
      <User className="h-5 w-5" />
      <span className="hidden sm:inline">S&apos;abonner</span>
    </Link>
  );
}
