import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { AdminProviders } from "@/components/admin/AdminProviders";
import {
  LayoutDashboard,
  FileText,
  Layout,
  Image as ImageIcon,
  Users,
  BarChart3,
  MessageSquare,
  Video,
  Radio,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/homepage", label: "Gestion de la UNE", icon: Layout },
  { href: "/admin/breaking", label: "Dernières infos", icon: Radio },
  { href: "/admin/media", label: "Médiathèque", icon: ImageIcon },
  { href: "/admin/videos", label: "Vidéos", icon: Video },
  { href: "/admin/comments", label: "Commentaires", icon: MessageSquare },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/analytics", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/account", label: "Mon compte", icon: UserCircle },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-lp-anthracite text-white">
        <div className="border-b border-white/10 p-6">
          <Link href="/admin" className="block">
            <Image
              src="/logo/lushipost-monogram.png"
              alt="LUSHIPOST Newsroom"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="mt-2 block text-[10px] uppercase tracking-widest text-white/50">
              Newsroom
            </span>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <Link
            href="/admin/account"
            className="mb-2 block truncate text-xs text-white/70 hover:text-white"
          >
            {session.user.email}
          </Link>
          <p className="mb-3 text-[10px] uppercase tracking-wider text-lp-accent">
            {session.user.role.replace(/_/g, " ")}
          </p>
          <Link
            href="/"
            className="mb-2 block text-xs text-white/60 hover:text-white"
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
      </aside>

      <main className="ml-64 flex-1 p-8">
        <AdminProviders>{children}</AdminProviders>
      </main>
    </div>
  );
}
