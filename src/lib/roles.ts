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
export const SUBSCRIBER_SESSION_MAX_AGE = 30 * 24 * 60 * 60;
