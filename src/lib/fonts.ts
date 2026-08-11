import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";

export const fontDisplay = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lp-display",
  display: "swap",
});

export const fontBody = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lp-body",
  display: "swap",
});
