import type { Metadata } from "next";
import { SITE_NAME, SITE_PHONE } from "@/lib/constants";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="lp-container max-w-3xl py-12">
      <h1 className="mb-6 text-4xl font-bold">Mentions légales</h1>
      <div className="lp-prose">
        <p><strong>Éditeur :</strong> {SITE_NAME}</p>
        <p><strong>Siège :</strong> Lubumbashi, Haut-Katanga, République démocratique du Congo</p>
        <p><strong>Téléphone :</strong> {SITE_PHONE}</p>
        <p><strong>Contact :</strong> redaction@lushipost.com</p>
        <h2>Propriété intellectuelle</h2>
        <p>L&apos;ensemble du contenu publié sur {SITE_NAME} est protégé par le droit d&apos;auteur. Toute reproduction sans autorisation est interdite.</p>
      </div>
    </div>
  );
}
