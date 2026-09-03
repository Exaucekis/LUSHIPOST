"use client";

import { useSession } from "next-auth/react";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { canManageArticlePhotos, canPublish } from "@/lib/permissions";

export default function NewArticlePage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Nouvel article</h1>
      <ArticleForm
        mode="create"
        canPublish={session?.user?.role ? canPublish(session.user.role) : false}
        canManageGallery={session?.user?.role ? canManageArticlePhotos(session.user.role) : false}
      />
    </div>
  );
}
