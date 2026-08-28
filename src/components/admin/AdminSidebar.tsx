"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Layout,
  Tags,
  Image as ImageIcon,
  Users,
  BarChart3,
  MessageSquare,
  Video,
  Radio,
  Settings,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import { SITE_NAME } from "@/lib/constants";
import type { Role } from "@prisma/client";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permissions: [] as string[], exact: true },
  { href: "/admin/articles", label: "Articles", icon: FileText, permissions: ["articles:read"] },
  { href: "/admin/homepage", label: "Gestion de la UNE", icon: Layout, permissions: ["homepage:manage"] },
  { href: "/admin/categories", label: "Catégories", icon: Tags, permissions: ["categories:manage"] },
  { href: "/admin/breaking", label: "Dernières infos", icon: Radio, permissions: ["breaking:manage"] },
  { href: "/admin/media", label: "Médiathèque", icon: ImageIcon, permissions: ["media:manage", "media:upload"] },
  { href: "/admin/videos", label: "Vidéos", icon: Video, permissions: ["videos:manage"] },
  { href: "/admin/comments", label: "Commentaires", icon: MessageSquare, permissions: ["comments:moderate"] },
  { href: "/admin/users", label: "Utilisateurs", icon: Users, permissions: ["users:read"] },
  { href: "/admin/analytics", label: "Statistiques", icon: BarChart3, permissions: ["analytics:read"] },
  { href: "/admin/account", label: "Mon compte", icon: UserCircle, permissions: [] as string[] },
  { href: "/admin/settings", label: "Paramètres", icon: Settings, permissions: ["settings:manage"] },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = session?.user?.role as Role | undefined;
  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      item.permissions.length === 0 ||
      (role && item.permissions.some((permission) => hasPermission(role, permission)))
  );

  const sidebarContent = (
    <>
      <div className="shrink-0 border-b border-white/10 bg-white/[0.03] p-5">
        <Link href="/admin" className="block" onClick={() => setMobileOpen(false)}>
          <Image
            src="/logo/lushipost-monogram.png"
            alt={`${SITE_NAME} Newsroom`}
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="mt-2 block text-[10px] uppercase tracking-widest text-white/50">
            Newsroom
          </span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                    active
                      ? "bg-lp-accent font-semibold text-white shadow-lg shadow-black/20"
                      : "text-white/75 hover:translate-x-1 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/70">{session?.user?.email}</p>
        <p className="mb-3 mt-1 text-[10px] uppercase tracking-wider text-lp-accent">
          {session?.user?.role?.replace(/_/g, " ") ?? ""}
        </p>
        <Link
          href="/"
          className="mb-2 block text-xs text-white/60 hover:text-white"
          onClick={() => setMobileOpen(false)}
        >
          ← Voir le site
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white"
        >
          <LogOut className="h-3 w-3" />
          Déconnexion
        </Link>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-50 flex min-w-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded p-2 hover:bg-gray-100"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="truncate text-sm font-bold">{SITE_NAME} Newsroom</span>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[60] flex w-[min(16rem,calc(100vw-2rem))] flex-col bg-[linear-gradient(160deg,#111827_0%,#1a1a1a_52%,#33111a_100%)] text-white shadow-2xl shadow-black/20 transition-transform md:w-64 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded p-1 text-white/70 hover:text-white md:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
