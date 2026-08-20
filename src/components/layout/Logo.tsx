import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const MONOGRAM_HEADER = "/logo/lushipost-monogram-header.png";
const MONOGRAM = "/logo/lushipost-monogram.png";

interface LogoProps {
  variant?: "header" | "footer" | "monogram";
  showTagline?: boolean;
  tagline?: string;
  centered?: boolean;
}

export function Logo({
  variant = "header",
  showTagline = false,
  tagline,
  centered = false,
}: LogoProps) {
  if (variant === "monogram") {
    return (
      <Link href="/" aria-label={`${SITE_NAME} — Accueil`} className="inline-flex shrink-0">
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
        aria-label={`${SITE_NAME} — Accueil`}
        className="inline-flex shrink-0 items-center justify-center"
      >
        <Image
          src={MONOGRAM_HEADER}
          alt={SITE_NAME}
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
      className={cn(
        "group inline-flex max-w-full flex-col",
        centered ? "items-center text-center" : "items-start"
      )}
      aria-label={`${SITE_NAME} — Accueil`}
    >
      <span className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
        {SITE_NAME}
      </span>
      {showTagline && (
        <span className="mt-2 text-[10px] uppercase tracking-widest text-white/70">
          {tagline || SITE_TAGLINE}
        </span>
      )}
    </Link>
  );
}
