"use client";
import { ArticleForm } from "@/components/admin/ArticleForm";
export default function NewJournalistArticlePage() {
  return <div className="lp-container max-w-5xl py-10"><h1 className="mb-2 text-3xl font-bold">Nouvelle publication</h1><p className="mb-8 text-lp-gray">Enregistrez un brouillon ou soumettez-le pour validation.</p><ArticleForm mode="create" apiBase="/api/journaliste/articles" returnPath="/journaliste" /></div>;
}
