import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export type Role = "USER" | "ADMIN" | "SUPPORT";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  firstName?: string | null;
  lastName?: string | null;
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(requiredRole?: Role) {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect("/unauthorized");
  }

  return session.user as AuthUser;
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}

export function isSupport(user: AuthUser): boolean {
  return user.role === "SUPPORT";
}

export function canAccessAdminFeatures(user: AuthUser): boolean {
  return isAdmin(user) || isSupport(user);
}
