import Link from "next/link";
import { Logo } from "./Logo";
import { FOOTER_NAV, SITE_NAME, SITE_PHONE, SITE_PHONE_HREF } from "@/lib/constants";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { Phone } from "lucide-react";
import type { getSocialLinks } from "@/lib/data/articles";

type SocialLink = Awaited<ReturnType<typeof getSocialLinks>>[number];

interface FooterProps {
  socialLinks: SocialLink[];
  tagline?: string;
}

export function Footer({ socialLinks, tagline }: FooterProps) {
  return (
    <footer className="bg-lp-anthracite text-center text-white">
      <div className="lp-container py-12">
        <div className="mb-10 flex flex-col items-center">
          <Logo variant="footer" showTagline tagline={tagline} centered />
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/60">
              Rubriques
            </h3>
            <ul className="space-y-2">
              {FOOTER_NAV.rubriques.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/60">
              Informations
            </h3>
            <ul className="space-y-2">
              {FOOTER_NAV.informations.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/60">
              Éditorial
            </h3>
            <ul className="space-y-2">
              {FOOTER_NAV.editorial.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/60">
              Suivez {SITE_NAME}
            </h3>
            <SocialIcons links={socialLinks} variant="light" className="justify-center" />
            <div className="mt-6 w-full border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
                Contact
              </p>
              <a
                href={SITE_PHONE_HREF}
                className="inline-flex items-center justify-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {SITE_PHONE}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="lp-container flex flex-col items-center gap-2 py-6">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {SITE_NAME} — Tous droits réservés.
          </p>
          <p className="text-xs text-white/40">
            Lubumbashi · Haut-Katanga · RDC · Afrique · Monde
          </p>
        </div>
      </div>
    </footer>
  );
}
