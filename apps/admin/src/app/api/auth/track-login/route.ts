import { NextRequest, NextResponse } from "next/server";
import { db, users, eq } from "@vt/db";

/**
 * Track Login Attempt API
 * 
 * Called after login attempt to:
 * 1. Check if user has access (not disabled/expired)
 * 2. Update last login timestamps
 * 3. Return access status
 */
export async function POST(request: NextRequest) {
  try {
    const { email, success } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Find user
    const [user] = await db
      .select({
        id: users.id,
        accessDisabled: users.accessDisabled,
        accessExpiresAt: users.accessExpiresAt,
      })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return NextResponse.json({ allowed: true }); // Don't reveal user existence
    }

    const now = new Date();

    // Always update last login attempt
    await db
      .update(users)
      .set({ lastLoginAttemptAt: now })
      .where(eq(users.id, user.id));

    // Check access restrictions
    if (user.accessDisabled) {
      return NextResponse.json({
        allowed: false,
        reason: "disabled",
        message: "Access has timed out. Please contact system admin.",
      });
    }

    if (user.accessExpiresAt && new Date(user.accessExpiresAt) < now) {
      return NextResponse.json({
        allowed: false,
        reason: "expired",
        message: "Access has timed out. Please contact system admin.",
      });
    }

    // If successful login and access is allowed, update last login time
    if (success) {
      await db
        .update(users)
        .set({ lastLoginAt: now })
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("Track login error:", error);
    return NextResponse.json({ allowed: true }); // Fail open
  }
}
