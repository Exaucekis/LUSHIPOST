import Link from "next/link";
import { Logo } from "./Logo";
import { FOOTER_NAV } from "@/lib/constants";
import { getSocialLinks } from "@/lib/data/articles";
import { SocialIcons } from "@/components/ui/SocialIcons";

export async function Footer() {
  const socialLinks = await getSocialLinks().catch(() => []);

  return (
    <footer className="bg-lp-anthracite text-white">
      <div className="lp-container py-12">
        <div className="mb-10">
          <Logo variant="footer" showTagline />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
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

          <div>
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

          <div>
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

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/60">
              Suivez LUSHIPOST
            </h3>
            <SocialIcons links={socialLinks} variant="light" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="lp-container flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} LUSHIPOST — Tous droits réservés.
          </p>
          <p className="text-xs text-white/40">
            Lubumbashi · Haut-Katanga · RDC · Afrique · Monde
          </p>
        </div>
      </div>
    </footer>
  );
}
