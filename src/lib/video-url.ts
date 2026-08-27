export function videoPlatform(url: string) {
  const host = new URL(url).hostname.replace("www.", "").toLowerCase();
  if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") return "YouTube";
  if (host === "facebook.com" || host === "fb.watch") return "Facebook";
  if (host === "instagram.com") return "Instagram";
  if (host === "tiktok.com") return "TikTok";
  if (host === "vimeo.com") return "Vimeo";
  return "Autre";
}

export function videoEmbedUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const host = url.hostname.replace("www.", "").toLowerCase();
  if (host === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
  if (host.includes("youtube.com")) {
    const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
    return id ? `https://www.youtube.com/embed/${id}` : rawUrl;
  }
  if (host.includes("facebook.com") || host === "fb.watch") return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false`;
  return rawUrl;
}
