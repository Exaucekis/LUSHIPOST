"use client";

import Link from "next/link";
import {
  MapPin,
  Globe,
  Landmark,
  TrendingUp,
  Users,
  Trophy,
  FileSearch,
  Radio,
  Play,
  Search,
} from "lucide-react";

const QUICK_LINKS = [
  { href: "/lubumbashi", label: "Lubumbashi", icon: MapPin },
  { href: "/rdc", label: "RDC", icon: Landmark },
  { href: "/politique", label: "Politique", icon: Globe },
  { href: "/economie", label: "Économie", icon: TrendingUp },
  { href: "/societe", label: "Société", icon: Users },
  { href: "/enquete", label: "Enquête", icon: FileSearch },
  { href: "/sport", label: "Sport", icon: Trophy },
  { href: "/video", label: "Vidéo", icon: Play },
  { href: "/recherche", label: "Recherche", icon: Search },
];

export function QuickAccess() {
  return (
    <section
      className="border-b border-gray-200 bg-white py-4"
      aria-label="Accès rapide aux rubriques"
    >
      <div className="lp-container">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <Link href="/live" className="lp-quick-pill-live">
            <span className="h-2 w-2 rounded-full bg-lp-live lp-live-pulse" />
            Live
          </Link>
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="lp-quick-pill">
              <link.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
