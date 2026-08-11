import Link from "next/link";
import Image from "next/image";

export function Logo({
  variant = "dark",
  size = "md",
  showTagline = false,
}: {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}) {
  const sizes = { sm: 140, md: 180, lg: 240 };
  const height = size === "lg" ? 62 : size === "md" ? 46 : 36;
  const width = sizes[size];
  const logoSrc = variant === "light" ? "/logo/lushipost-white.svg" : "/logo/lushipost.svg";

  return (
    <Link href="/" className="group flex flex-col items-start" aria-label="LUSHIPOST — Accueil">
      <Image
        src={logoSrc}
        alt="LUSHIPOST"
        width={width}
        height={height}
        priority
        className="object-contain object-left"
      />
      {showTagline && (
        <span
          className={`mt-0.5 text-[10px] uppercase tracking-widest ${
            variant === "light" ? "text-white/70" : "text-lp-gray"
          }`}
        >
          L&apos;information au cœur de Lubumbashi.
        </span>
      )}
    </Link>
  );
}
