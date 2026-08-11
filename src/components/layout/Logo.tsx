import Link from "next/link";
import Image from "next/image";

const MONOGRAM = "/logo/lushipost-monogram.png";
const BRAND = "/logo/lushipost-brand.png";

interface LogoProps {
  variant?: "header" | "footer" | "monogram";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({
  variant = "header",
  size = "md",
  showTagline = false,
}: LogoProps) {
  if (variant === "monogram") {
    const dim = size === "lg" ? 56 : size === "md" ? 48 : 40;
    return (
      <Link href="/" aria-label="LUSHIPOST — Accueil">
        <Image
          src={MONOGRAM}
          alt="LUSHIPOST"
          width={dim}
          height={dim}
          priority
          className="object-contain"
        />
      </Link>
    );
  }

  if (variant === "header") {
    const heights = { sm: 36, md: 44, lg: 52 };
    const widths = { sm: 180, md: 220, lg: 280 };
    const h = heights[size];
    const w = widths[size];

    return (
      <Link href="/" aria-label="LUSHIPOST — Accueil" className="block shrink-0">
        <div className="overflow-hidden" style={{ width: w, height: h }}>
          <Image
            src={BRAND}
            alt="LUSHIPOST — Lubumbashi Post"
            width={w}
            height={Math.round(h * 1.6)}
            priority
            className="max-w-none object-cover object-top"
            style={{ width: w, height: "auto" }}
          />
        </div>
      </Link>
    );
  }

  const brandWidth = size === "lg" ? 320 : size === "md" ? 280 : 240;

  return (
    <Link
      href="/"
      className="group inline-flex flex-col items-start"
      aria-label="LUSHIPOST — Accueil"
    >
      <Image
        src={BRAND}
        alt="LUSHIPOST — Lubumbashi Post"
        width={brandWidth}
        height={Math.round(brandWidth * 0.6)}
        className="h-auto object-contain object-left"
        style={{ width: brandWidth, height: "auto" }}
      />
      {showTagline && (
        <span className="mt-2 text-[10px] uppercase tracking-widest text-white/70">
          L&apos;information au cœur de Lubumbashi.
        </span>
      )}
    </Link>
  );
}
