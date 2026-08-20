import { cache } from "react";
import prisma from "@/lib/prisma";
import { SITE_TAGLINE } from "@/lib/constants";

export type SiteSocialLink = {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
  order: number;
};

export type SiteSettings = {
  tagline: string;
  socialLinks: SiteSocialLink[];
};

export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const [taglineSetting, socialLinks] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "site_tagline" } }),
      prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    ]);

    return {
      tagline: taglineSetting?.value || SITE_TAGLINE,
      socialLinks,
    };
  } catch {
    return { tagline: SITE_TAGLINE, socialLinks: [] };
  }
});
