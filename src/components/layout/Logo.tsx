import Link from "next/link";
import Image from "next/image";
import { SITE_TAGLINE } from "@/lib/constants";

const HEADER_LOGO = "/logo/lushipost-header.png";
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
        className="inline-flex shrink-0 items-center"
      >
        <Image
          src={HEADER_LOGO}
          alt="Lubumbashi Poste"
          width={720}
          height={52}
          priority
          unoptimized
          className="h-9 w-auto max-w-[min(280px,78vw)] object-contain object-left sm:h-10 md:h-11 lg:h-12 lg:max-w-[320px]"
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
