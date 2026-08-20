import prisma from "@/lib/prisma";
import { MediaUploadPanel } from "@/components/admin/MediaUploadPanel";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  }).catch(() => []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Médiathèque</h1>
          <p className="text-lp-gray">{media.length} fichiers</p>
        </div>
      </div>

      <MediaUploadPanel />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {item.type === "IMAGE" && (
              <div className="aspect-video bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.altText || item.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs text-lp-gray">{item.type} · {item.mimeType}</p>
              <p className="mt-1 truncate text-xs text-lp-accent">{item.url}</p>
              {item.user?.name && (
                <p className="mt-1 text-xs text-lp-gray">Par {item.user.name}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-lp-gray">
          Aucun média uploadé. Utilisez le bouton ci-dessus pour ajouter des fichiers.
        </div>
      )}
    </div>
  );
}
