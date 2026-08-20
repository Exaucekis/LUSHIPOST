import Link from "next/link";
import Image from "next/image";

const MONOGRAM = "/logo/lushipost-monogram.png";
const BRAND = "/logo/lushipost-brand.png";

interface LogoProps {
  variant?: "header" | "footer" | "monogram";
  showTagline?: boolean;
}

function LogoWordmark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 252 52"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <text
        x="0"
        y="42"
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="44"
        fontWeight="700"
        letterSpacing="-0.02em"
        fill="#0a0a0a"
      >
        LUSHI
      </text>
      <text
        x="144"
        y="42"
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="44"
        fontWeight="700"
        letterSpacing="-0.02em"
        fill="#c41e3a"
      >
        POST
      </text>
    </svg>
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
        <LogoWordmark className="h-8 w-auto sm:h-9 md:h-10 lg:h-11" />
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
