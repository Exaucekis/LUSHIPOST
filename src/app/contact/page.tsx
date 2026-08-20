import type { Metadata } from "next";
import { SITE_NAME, SITE_PHONE, SITE_PHONE_HREF } from "@/lib/constants";
import { Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="lp-container max-w-2xl py-12">
      <h1 className="mb-6 text-4xl font-bold">Contact</h1>
      <div className="lp-prose">
        <p>
          Pour toute demande éditoriale, commerciale ou technique, contactez la
          rédaction {SITE_NAME}.
        </p>

        <ul className="mt-8 space-y-4 list-none ml-0">
          <li className="flex items-start gap-3">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-lp-accent" aria-hidden="true" />
            <div>
              <strong className="block text-sm uppercase tracking-wider text-lp-gray">
                Téléphone
              </strong>
              <a
                href={SITE_PHONE_HREF}
                className="text-lg font-semibold text-lp-black no-underline hover:text-lp-accent"
              >
                {SITE_PHONE}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-lp-accent" aria-hidden="true" />
            <div>
              <strong className="block text-sm uppercase tracking-wider text-lp-gray">
                Rédaction
              </strong>
              <a href="mailto:redaction@lushipost.com" className="hover:text-lp-accent">
                redaction@lushipost.com
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-lp-accent" aria-hidden="true" />
            <div>
              <strong className="block text-sm uppercase tracking-wider text-lp-gray">
                Publicité
              </strong>
              <a href="mailto:publicite@lushipost.com" className="hover:text-lp-accent">
                publicite@lushipost.com
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-lp-accent" aria-hidden="true" />
            <div>
              <strong className="block text-sm uppercase tracking-wider text-lp-gray">
                Adresse
              </strong>
              Lubumbashi, Haut-Katanga, RDC
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
