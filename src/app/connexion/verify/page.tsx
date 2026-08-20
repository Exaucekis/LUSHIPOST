import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-lp-light px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 text-center shadow-xl">
        <Logo variant="header" />
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-lp-accent/10">
          <Mail className="h-7 w-7 text-lp-accent" />
        </div>
        <h1 className="mt-6 text-xl font-bold">Vérifiez votre boîte mail</h1>
        <p className="mt-3 text-sm text-lp-gray">
          Un lien de connexion vient d&apos;être envoyé à votre adresse.
          Cliquez dessus pour accéder à votre espace abonné — aucun mot de passe requis.
        </p>
        <Link
          href="/connexion"
          className="mt-8 inline-block text-sm font-semibold text-lp-accent hover:underline"
        >
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
