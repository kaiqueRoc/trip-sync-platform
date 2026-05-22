import { auth } from "@/auth";
import type { MemberRole } from "@prisma/client";

export type SessionContext = {
  userId: string;
  organizationId: string;
  role: MemberRole;
  email: string;
  name: string | null;
};

export async function requireSession(): Promise<SessionContext> {
  const session = await auth();
  if (!session?.user?.id || !session.organizationId || !session.role) {
    throw new Error("UNAUTHORIZED");
  }
  return {
    userId: session.user.id,
    organizationId: session.organizationId,
    role: session.role,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
  };
}
