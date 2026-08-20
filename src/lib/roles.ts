import { Role } from "@prisma/client";

export const STAFF_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.REDACTEUR_EN_CHEF,
  Role.JOURNALISTE,
  Role.EDITEUR,
  Role.MODERATEUR,
  Role.VIDEOASTE,
];

export function isStaffRole(role: Role | string): boolean {
  return STAFF_ROLES.includes(role as Role);
}

export function isSubscriberRole(role: Role | string): boolean {
  return role === Role.ABONNE;
}

export const STAFF_SESSION_MAX_AGE = 8 * 60 * 60;
export const SUBSCRIBER_SESSION_MAX_AGE = 30 * 24 * 60 * 60;
