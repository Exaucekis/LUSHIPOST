import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { SiteShell } from "@/components/layout/SiteShell";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { getSiteShellData } from "@/lib/data/articles";
import { getSiteUrl } from "@/lib/utils";
import { fontDisplay, fontBody } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — L'information au cœur de Lubumbashi`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "LUBUMBASHIPOST",
    "Lubumbashi actualité",
    "Actualité Lubumbashi",
    "Haut-Katanga",
    "RDC actualité",
    "RDC news",
    "actualité Congo",
    "politique RDC",
    "économie RDC",
    "sport RDC",
    "Afrique",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    images: [{ url: "/logo/lushipost-brand.png", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { breaking, social, tagline } = await getSiteShellData();

  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/logo/lushipost-monogram.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${fontDisplay.variable} ${fontBody.variable} min-h-screen flex flex-col antialiased`}>
        <AppProviders>
          <SiteShell breaking={breaking} social={social} tagline={tagline}>
            {children}
          </SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
