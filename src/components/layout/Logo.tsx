import Link from "next/link";
import Image from "next/image";

const MONOGRAM = "/logo/lushipost-monogram.png";
const BRAND = "/logo/lushipost-brand.png";

interface LogoProps {
  variant?: "header" | "footer" | "monogram";
  showTagline?: boolean;
}

export function Logo({ variant = "header", showTagline = false }: LogoProps) {
  if (variant === "monogram") {
    return (
      <Link href="/" aria-label="LUSHIPOST — Accueil" className="inline-flex shrink-0">
        <Image
          src={MONOGRAM}
          alt="LUSHIPOST"
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
        {/* Mobile : monogramme lp */}
        <Image
          src={MONOGRAM}
          alt="LUSHIPOST"
          width={512}
          height={512}
          priority
          className="h-9 w-9 object-contain sm:h-10 sm:w-10 md:hidden"
        />

        {/* Desktop : wordmark complet (object-contain évite de ne montrer que le fond noir) */}
        <Image
          src={BRAND}
          alt="LUSHIPOST"
          width={720}
          height={432}
          priority
          sizes="(max-width: 1024px) 200px, 260px"
          className="hidden h-10 w-auto max-w-[min(220px,42vw)] object-contain object-left md:block lg:h-12 lg:max-w-[260px]"
        />
      </Link>
    );
  }

  /* Footer : logo complet responsive */
  return (
    <Link
      href="/"
      className="group inline-flex max-w-full flex-col items-start"
      aria-label="LUSHIPOST — Accueil"
    >
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]">
        <Image
          src={BRAND}
          alt="LUSHIPOST"
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
