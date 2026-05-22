import type { MemberRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    organizationId: string;
    role: MemberRole;
    user: DefaultSession["user"] & { id: string };
  }

  interface User {
    id: string;
    organizationId?: string;
    role?: MemberRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId?: string;
    role?: MemberRole;
  }
}
