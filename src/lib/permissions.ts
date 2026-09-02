import { Role } from "@prisma/client";

const PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ["*"],
  REDACTEUR_EN_CHEF: [
    "articles:read",
    "articles:create",
    "articles:update",
    "articles:publish",
    "articles:delete",
    "homepage:manage",
    "categories:manage",
    "media:manage",
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "analytics:read",
    "comments:moderate",
    "settings:manage",
  ],
  JOURNALISTE: [
    "articles:read",
    "articles:create",
    "articles:update:own",
    "articles:delete:own",
    "media:upload",
  ],
  EDITEUR: [
    "articles:read",
    "articles:create",
    "articles:update",
    "articles:publish",
    "media:manage",
    "comments:moderate",
  ],
  MODERATEUR: ["comments:moderate", "articles:read"],
  VIDEOASTE: ["videos:manage", "media:manage", "articles:read"],
  ABONNE: [],
};

export function hasPermission(role: Role | string, permission: string): boolean {
  const perms = PERMISSIONS[role as Role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.some((p) => p === permission);
}

export function canPublish(role: Role | string): boolean {
  return role === Role.SUPER_ADMIN;
}

export function canManageBreaking(role: Role | string): boolean {
  return role === Role.SUPER_ADMIN;
}

export function canManageHomepage(role: Role | string): boolean {
  return hasPermission(role, "homepage:manage");
}

export function isAdminRole(role: Role | string): boolean {
  return [
    "SUPER_ADMIN",
    "REDACTEUR_EN_CHEF",
    "JOURNALISTE",
    "EDITEUR",
    "MODERATEUR",
    "VIDEOASTE",
  ].includes(role);
}
