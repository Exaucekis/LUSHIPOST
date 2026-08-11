export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Paramètres</h1>
      <div className="max-w-2xl space-y-6">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-bold">Identité du site</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-lp-gray">Nom</dt>
              <dd className="font-medium">LUSHIPOST</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-lp-gray">Signature</dt>
              <dd className="font-medium">L&apos;information au cœur de Lubumbashi.</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-bold">Réseaux sociaux</h2>
          <p className="text-sm text-lp-gray">
            Configurez les URLs officielles des comptes LUSHIPOST dans la base de données (table social_links).
            Ne jamais inventer de comptes sociaux.
          </p>
        </section>
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-bold">Sécurité</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-lp-gray">
            <li>Authentification par session JWT (8h)</li>
            <li>Contrôle d&apos;accès basé sur les rôles (RBAC)</li>
            <li>Journal d&apos;audit des actions éditoriales</li>
            <li>Variables d&apos;environnement pour les secrets</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
