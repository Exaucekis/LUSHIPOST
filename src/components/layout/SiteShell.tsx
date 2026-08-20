"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BreakingNewsBar } from "./BreakingNewsBar";
import type { ComponentProps } from "react";

interface SiteShellProps {
  children: React.ReactNode;
  breaking: ComponentProps<typeof BreakingNewsBar>["items"];
  social: ComponentProps<typeof Footer>["socialLinks"];
  tagline?: string;
}

export function SiteShell({ children, breaking, social, tagline }: SiteShellProps) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin");

  if (isAdminArea) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <BreakingNewsBar items={breaking} />
      <main className="flex-1">{children}</main>
      <Footer socialLinks={social} tagline={tagline} />
    </>
  );
}
