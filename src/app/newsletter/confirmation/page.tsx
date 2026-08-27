import Link from "next/link";

export default async function NewsletterConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const confirmed = status === "confirmed";

  return (
    <div className="lp-container py-16">
      <div className="mx-auto max-w-xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">
          {confirmed ? "Inscription confirmée" : "Lien de confirmation invalide"}
        </h1>
        <p className="mt-4 text-lp-gray">
          {confirmed
            ? "Votre adresse e-mail est désormais inscrite à la newsletter LUSHIPOST."
            : "Ce lien est invalide ou a déjà été utilisé. Vous pouvez demander un nouveau lien depuis l'accueil."}
        </p>
        <Link href="/" className="lp-btn-primary mt-8 inline-flex px-6 py-3">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
