import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="lp-container max-w-2xl py-12">
      <h1 className="mb-6 text-4xl font-bold">Contact</h1>
      <div className="lp-prose">
        <p>Pour toute demande éditoriale, commerciale ou technique, contactez la rédaction LUSHIPOST.</p>
        <p><strong>Rédaction :</strong> redaction@lushipost.com</p>
        <p><strong>Publicité :</strong> publicite@lushipost.com</p>
        <p><strong>Adresse :</strong> Lubumbashi, Haut-Katanga, RDC</p>
      </div>
    </div>
  );
}
