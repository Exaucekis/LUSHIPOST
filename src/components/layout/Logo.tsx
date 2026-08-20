import Link from "next/link";
import Image from "next/image";
import { SITE_TAGLINE } from "@/lib/constants";

const MONOGRAM_HEADER = "/logo/lushipost-monogram-header.png";
const MONOGRAM = "/logo/lushipost-monogram.png";
const BRAND = "/logo/lushipost-brand.png";

interface LogoProps {
  variant?: "header" | "footer" | "monogram";
  showTagline?: boolean;
  tagline?: string;
}

export function Logo({ variant = "header", showTagline = false, tagline }: LogoProps) {
  if (variant === "monogram") {
    return (
      <Link href="/" aria-label="Lubumbashi Poste — Accueil" className="inline-flex shrink-0">
        <Image
          src={MONOGRAM}
          alt=""
          width={512}
          height={512}
          priority
          unoptimized
          className="h-9 w-9 object-contain sm:h-10 sm:w-10"
        />
      </Link>
    );
  }

  if (variant === "header") {
    return (
      <Link
        href="/"
        aria-label="Lubumbashi Poste — Accueil"
        className="inline-flex shrink-0 items-center justify-center"
      >
        <Image
          src={MONOGRAM_HEADER}
          alt="Lubumbashi Poste"
          width={512}
          height={512}
          priority
          unoptimized
          className="h-10 w-10 object-contain sm:h-11 sm:w-11 md:h-12 md:w-12"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="group inline-flex max-w-full flex-col items-start"
      aria-label="Lubumbashi Poste — Accueil"
    >
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]">
        <Image
          src={BRAND}
          alt=""
          width={720}
          height={432}
          unoptimized
          className="h-auto w-full object-contain object-left"
          sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 360px"
        />
      </div>
      {showTagline && (
        <span className="mt-2 text-[10px] uppercase tracking-widest text-white/70">
          {tagline || SITE_TAGLINE}
        </span>
      )}
    </Link>
  );
}
