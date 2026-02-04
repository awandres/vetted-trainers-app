import { NextRequest, NextResponse } from "next/server";
import { db, users, sessions, eq, and, gt } from "@vt/db";

/**
 * Admin Access Control API
 * 
 * Allows super_admins to:
 * - Grant time-limited access to users
 * - Disable/enable user access
 * - View current access status
 */

async function getAuthUser(request: NextRequest) {
  let sessionToken = request.cookies.get("better-auth.session_token")?.value;
  if (!sessionToken) return null;
  if (sessionToken.includes(".")) sessionToken = sessionToken.split(".")[0];

  const [session] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.token, sessionToken), gt(sessions.expiresAt, new Date())));

  if (!session) return null;

  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, session.userId));

  return user;
}

// GET - List users with access controls
export async function GET(request: NextRequest) {
  const authUser = await getAuthUser(request);
  
  if (!authUser || (authUser.role !== "super_admin" && authUser.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      accessDisabled: users.accessDisabled,
      accessExpiresAt: users.accessExpiresAt,
      accessDurationMinutes: users.accessDurationMinutes,
    })
    .from(users);

  return NextResponse.json({ users: allUsers });
}

// PUT - Update user access settings
export async function PUT(request: NextRequest) {
  const authUser = await getAuthUser(request);
  
  if (!authUser || authUser.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can modify access" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, action, value } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
  }

  // Find user
  const [targetUser] = await db.select().from(users).where(eq(users.id, userId));
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Don't allow modifying super_admins
  if (targetUser.role === "super_admin") {
    return NextResponse.json({ error: "Cannot modify super admin access" }, { status: 400 });
  }

  switch (action) {
    case "disable":
      await db.update(users)
        .set({ accessDisabled: true })
        .where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: "Access disabled" });

    case "enable":
      await db.update(users)
        .set({ accessDisabled: false })
        .where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: "Access enabled" });

    case "set_time_limit":
      // Set time limit in minutes (e.g., 5 for 5-minute demo)
      const minutes = parseInt(value) || 5;
      await db.update(users)
        .set({ 
          accessDurationMinutes: minutes,
          accessDisabled: false,
        })
        .where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: `Time limit set to ${minutes} minutes` });

    case "remove_time_limit":
      await db.update(users)
        .set({ accessDurationMinutes: null })
        .where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: "Time limit removed" });

    case "set_expiry":
      // Set hard expiry date
      const expiryDate = new Date(value);
      if (isNaN(expiryDate.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      await db.update(users)
        .set({ accessExpiresAt: expiryDate })
        .where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: `Access expires at ${expiryDate.toISOString()}` });

    case "clear_expiry":
      await db.update(users)
        .set({ accessExpiresAt: null })
        .where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: "Expiry date cleared" });

    case "revoke_sessions":
      // Delete all sessions for this user (force re-login)
      await db.delete(sessions).where(eq(sessions.userId, userId));
      return NextResponse.json({ success: true, message: "All sessions revoked" });

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
