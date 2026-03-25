import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "./permission-rules";
import type { Resource, Action } from "./resources";

export async function requirePermission(
  resource: Resource,
  action: Action,
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!hasPermission(session.user.role, resource, action)) {
    redirect("/login");
  }

  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    redirect("/login");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    redirect("/login");
  }
  return session;
}
