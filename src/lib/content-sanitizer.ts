import sanitizeHtml from "sanitize-html";

const articleSanitizerOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "b", "i", "u", "s", "blockquote", "cite",
    "ul", "ol", "li", "h2", "h3", "h4", "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td", "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    '*': ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, articleSanitizerOptions);
}

const allowedEmbedHosts = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "www.facebook.com",
];

export function sanitizeLiveEmbedHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["iframe"],
    allowedAttributes: {
      iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "frameborder"],
    },
    allowedSchemes: ["https"],
    allowedIframeHostnames: allowedEmbedHosts,
  });
}

export function getSafeEmbedUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedEmbedHosts.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
