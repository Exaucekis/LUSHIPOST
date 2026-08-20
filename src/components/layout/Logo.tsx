import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MONOGRAM = "/logo/lushipost-monogram.png";
const BRAND = "/logo/lushipost-brand.png";

interface LogoProps {
  variant?: "header" | "footer" | "monogram";
  showTagline?: boolean;
}

function HeaderWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap font-display font-bold leading-none tracking-tight",
        className
      )}
    >
      <span className="text-lp-black">LUSHI</span>
      <span className="text-lp-accent">POST</span>
    </span>
  );
}

export function Logo({ variant = "header", showTagline = false }: LogoProps) {
  if (variant === "monogram") {
    return (
      <Link href="/" aria-label="LUSHIPOST — Accueil" className="inline-flex shrink-0">
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
        aria-label="LUSHIPOST — Accueil"
        className="inline-flex shrink-0 items-center"
      >
        <HeaderWordmark className="text-[1.65rem] sm:text-3xl md:text-[2rem] lg:text-[2.15rem]" />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="group inline-flex max-w-full flex-col items-start"
      aria-label="LUSHIPOST — Accueil"
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
          L&apos;information au cœur de Lubumbashi.
        </span>
      )}
    </Link>
  );
}
