export type UserRole = "learner" | "creator" | "reviewer" | "admin";

export const STAFF_ROLES: readonly UserRole[] = ["creator", "reviewer", "admin"] as const;

export function isStaffRole(role?: string | null): boolean {
  if (!role) return false;
  return STAFF_ROLES.includes(role as UserRole);
}

export function canPublishContent(role?: string | null): boolean {
  return role === "admin";
}

export function canReviewContent(role?: string | null): boolean {
  return role === "reviewer" || role === "admin";
}

export function canCreateContent(role?: string | null): boolean {
  return isStaffRole(role);
}
