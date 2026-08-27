import prisma from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { articles: true } } } });
  return <div className="max-w-4xl"><h1 className="mb-2 text-3xl font-bold">Catégories</h1><p className="mb-8 text-lp-gray">Ces catégories déterminent automatiquement les rubriques et menus où les publications approuvées apparaissent.</p><CategoryManager initialCategories={categories} /></div>;
}
