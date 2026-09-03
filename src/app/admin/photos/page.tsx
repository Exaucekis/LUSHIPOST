import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { canManageArticlePhotos } from "@/lib/permissions";
import { PhotoInfoManager } from "@/components/photo-infos/PhotoInfoManager";

export default async function ArticlePhotosPage() {
  const session = await getServerSession(authOptions);
  if (!session || !canManageArticlePhotos(session.user.role)) redirect("/admin");
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Photos des infos</h1>
      <p className="mb-8 text-lp-gray">Espace indépendant des articles, réservé au Super Admin. Écrivez une courte information puis ajoutez de 1 à 4 photos par téléversement ou lien.</p>
      <PhotoInfoManager />
    </div>
  );
}
