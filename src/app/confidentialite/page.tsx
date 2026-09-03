import type { Metadata } from "next";
import { SITE_EMAIL, SITE_EMAIL_HREF, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <div className="lp-container max-w-3xl py-12">
      <h1 className="mb-6 text-4xl font-bold">Politique de confidentialité</h1>
      <div className="lp-prose">
        <p>{SITE_NAME} s&apos;engage à protéger les données personnelles de ses utilisateurs conformément à la réglementation en vigueur.</p>
        <h2>Données collectées</h2>
        <ul>
          <li>Adresse e-mail (newsletter, avec consentement)</li>
          <li>Données de navigation anonymisées (analytics)</li>
        </ul>
        <h2>Vos droits</h2>
        <p>Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en contactant : <a href={SITE_EMAIL_HREF}>{SITE_EMAIL}</a></p>
      </div>
    </div>
  );
}
