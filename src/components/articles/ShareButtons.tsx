"use client";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-green-600 hover:text-white",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-black hover:text-white",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-700 hover:text-white",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* silent */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-lp-gray">
        Partager
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold transition-colors ${link.color}`}
        >
          {link.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-lp-black hover:text-white"
      >
        Copier le lien
      </button>
    </div>
  );
}
