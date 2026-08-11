import prisma from "@/lib/prisma";

export default async function AdminBreakingPage() {
  const items = await prisma.breakingNews.findMany({
    include: { article: { select: { title: true, slug: true } } },
    orderBy: { order: "asc" },
  }).catch(() => []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dernières informations</h1>
      <p className="mb-6 text-lp-gray">
        Gérez la barre de breaking news affichée en haut du site.
      </p>

      <div className="rounded-lg border bg-white">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b px-6 py-4 last:border-0">
            <div>
              <p className="font-medium">{item.title}</p>
              {item.article && (
                <p className="text-xs text-lp-gray">Lié à : {item.article.title}</p>
              )}
            </div>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
              item.isActive ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"
            }`}>
              {item.isActive ? "Actif" : "Inactif"}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-8 text-center text-lp-gray">Aucune alerte configurée.</p>
        )}
      </div>
    </div>
  );
}
