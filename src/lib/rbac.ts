import type { MemberRole } from "@prisma/client";

const ROLE_RANK: Record<MemberRole, number> = {
  VIEWER: 1,
  OPERATOR: 2,
  OWNER: 3,
};

export function hasMinRole(
  userRole: MemberRole,
  required: MemberRole,
): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

export function canWriteBookings(role: MemberRole): boolean {
  return hasMinRole(role, "OPERATOR");
}

export function canManageTeam(role: MemberRole): boolean {
  return role === "OWNER";
}
