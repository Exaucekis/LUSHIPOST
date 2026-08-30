import type { Role } from "@prisma/client";

export const STAFF_ROLES: Role[] = [
  "SUPER_ADMIN",
  "REDACTEUR_EN_CHEF",
  "JOURNALISTE",
  "EDITEUR",
  "MODERATEUR",
  "VIDEOASTE",
];

export function isStaffRole(role: Role | string): boolean {
  return STAFF_ROLES.includes(role as Role);
}

export function isSubscriberRole(role: Role | string): boolean {
  return role === "ABONNE";
}

export function isJournalistRole(role: Role | string): boolean {
  return role === "JOURNALISTE";
}

export const STAFF_SESSION_MAX_AGE = 8 * 60 * 60;
// La session JWT est renouvelée par NextAuth lors de l'utilisation du site.
// Cette durée longue évite de déconnecter un lecteur actif tout en laissant une
// limite de sécurité pour un navigateur abandonné ou un appareil partagé.
export const SUBSCRIBER_SESSION_MAX_AGE = 180 * 24 * 60 * 60;
