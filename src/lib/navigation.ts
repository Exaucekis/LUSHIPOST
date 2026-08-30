import { isJournalistRole, isStaffRole } from "@/lib/roles";

export function homePathForRole(role?: string | null) {
  if (role && isJournalistRole(role)) return "/journaliste";
  if (role && isStaffRole(role)) return "/admin";
  return "/compte";
}

export function getSafeCallbackUrl(callbackUrl: string | null, role?: string) {
  const fallback = homePathForRole(role);

  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  // Cette ancienne page ne sert qu'à renvoyer vers la connexion : ne jamais
  // l'utiliser comme destination après authentification.
  if (callbackUrl === "/admin/login" || callbackUrl.startsWith("/admin/login?")) {
    return fallback;
  }

  if (role && isStaffRole(role) && callbackUrl.startsWith("/compte")) {
    return fallback;
  }

  if (role && !isStaffRole(role) && callbackUrl.startsWith("/admin")) {
    return "/compte";
  }

  if (role && isJournalistRole(role) && callbackUrl.startsWith("/admin")) {
    return "/journaliste";
  }

  if (role && !isJournalistRole(role) && callbackUrl.startsWith("/journaliste")) {
    return fallback;
  }

  return callbackUrl;
}
