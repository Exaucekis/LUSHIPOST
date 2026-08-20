import type { Metadata } from "next";
import { FACT_CHECK_LABELS, FACT_CHECK_COLORS, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Vérification des faits",
  description: `${SITE_NAME} Vérification — Fact-checking et démystification des rumeurs.`,
};

export default function VerificationPage() {
  return (
    <div className="lp-container max-w-3xl py-12">
      <h1 className="mb-6 text-4xl font-bold">Vérification</h1>
      <p className="mb-8 text-lp-gray">
        Notre rubrique de fact-checking traite les rumeurs, fausses informations,
        images trompeuses et contenus viraux.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        {Object.entries(FACT_CHECK_LABELS).map(([key, label]) => (
          <span
            key={key}
            className={`rounded px-3 py-1 text-xs font-bold uppercase text-white ${FACT_CHECK_COLORS[key]}`}
          >
            {label}
          </span>
        ))}
      </div>

      <p className="text-lp-gray">
        Chaque vérification est accompagnée de sources vérifiables.
        Les conclusions éditoriales sont validées par la rédaction avant publication.
      </p>
    </div>
  );
}
