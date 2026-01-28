import { auth } from "@vt/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server side
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Require admin role for a page
 * Redirects to login if not authenticated, or home if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  
  if (session.user.role !== "admin") {
    redirect("/?error=unauthorized");
  }
  
  return session;
}

/**
 * Require trainer or admin role
 */
export async function requireTrainerOrAdmin() {
  const session = await requireAuth();
  
  if (!["admin", "trainer"].includes(session.user.role as string)) {
    redirect("/?error=unauthorized");
  }
  
  return session;
}
