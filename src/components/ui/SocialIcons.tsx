import { Facebook, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

type SocialLink = { platform: string; url: string };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  x: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
};

const LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  tiktok: "TikTok",
};

interface SocialIconsProps {
  links: SocialLink[];
  variant?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}

export function SocialIcons({ links, variant = "dark", size = "md", className }: SocialIconsProps) {
  const iconSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const Icon = ICONS[link.platform] || ExternalLink;
        const label = LABELS[link.platform] || link.platform;

        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${SITE_NAME} sur ${label}`}
            className={cn(
              "flex items-center justify-center rounded-full transition-colors",
              iconSize,
              variant === "light"
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-lp-light text-lp-black hover:bg-lp-accent hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}

