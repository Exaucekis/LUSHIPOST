import Link from "next/link";
import { Logo } from "./Logo";
import { SITE_NAME, SITE_PHONE, SITE_PHONE_HREF } from "@/lib/constants";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { Phone } from "lucide-react";
import type { getSocialLinks } from "@/lib/data/articles";

type SocialLink = Awaited<ReturnType<typeof getSocialLinks>>[number];

interface FooterProps {
  socialLinks: SocialLink[];
  tagline?: string;
}

const FOOTER_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
  { label: "Vérification", href: "/verification" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Mentions légales", href: "/mentions-legales" },
];

export function Footer({ socialLinks, tagline }: FooterProps) {
  return (
    <footer className="bg-lp-anthracite text-white">
      <div className="lp-container py-7 sm:py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col items-center md:items-start">
            <Logo variant="footer" showTagline tagline={tagline} centered />
            <div className="mt-3 flex items-center gap-4">
              <SocialIcons links={socialLinks} variant="light" />
              <a
                href={SITE_PHONE_HREF}
                className="inline-flex items-center gap-1.5 text-xs text-white/75 transition-colors hover:text-white"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {SITE_PHONE}
              </a>
            </div>
          </div>
          <nav aria-label="Liens de pied de page">
            <ul className="flex max-w-xl flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/70 md:justify-end">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="lp-container flex flex-col items-center gap-1 py-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {SITE_NAME} — Tous droits réservés.
          </p>
          <p className="text-xs text-white/40">Lubumbashi · RDC</p>
        </div>
      </div>
    </footer>
  );
}
