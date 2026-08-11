import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "À propos",
  description: "LUSHIPOST — Média d'information numérique basé à Lubumbashi.",
};

export default function AboutPage() {
  return (
    <div className="lp-container max-w-3xl py-12">
      <h1 className="mb-6 text-4xl font-bold">À propos de LUSHIPOST</h1>
      <div className="lp-prose">
        <p>
          <strong>LUSHIPOST</strong> est un média d&apos;information numérique basé à Lubumbashi,
          orienté vers le Haut-Katanga, la République démocratique du Congo, l&apos;Afrique et le monde.
        </p>
        <p>
          Notre mission : informer avec rigueur, couvrir l&apos;actualité locale avec la même exigence
          que l&apos;information nationale et internationale, et devenir la référence numérique de
          l&apos;information à Lubumbashi.
        </p>
        <h2>Notre signature</h2>
        <p><em>L&apos;information au cœur de Lubumbashi.</em></p>
        <h2>Nos valeurs éditoriales</h2>
        <ul>
          <li>Distinction claire entre faits, analyse et opinion</li>
          <li>Attribution rigoureuse des sources</li>
          <li>Vérification des informations sensibles</li>
          <li>Transparence sur les contenus sponsorisés</li>
        </ul>
      </div>
    </div>
  );
}
