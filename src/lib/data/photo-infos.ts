import prisma from "@/lib/prisma";

export type PhotoInfoImage = { url: string; alt?: string };

export async function getActivePhotoInfos() {
  try {
    const items = await prisma.photoInfo.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    return items.map((item) => ({
      ...item,
      photos: Array.isArray(item.photos)
        ? item.photos.filter((photo): photo is PhotoInfoImage => !!photo && typeof photo === "object" && "url" in photo && typeof photo.url === "string").slice(0, 4)
        : [],
    })).filter((item) => item.photos.length > 0);
  } catch { return []; }
}
