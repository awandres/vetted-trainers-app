import { NextRequest, NextResponse } from "next/server";
import { db, users, eq } from "@vt/db";

/**
 * Track Login Attempt API
 * 
 * Called after login attempt to:
 * 1. Check if user has access (not disabled/expired)
 * 2. Update last login timestamps
 * 3. Start time-limited access timer on successful login
 * 4. Return access status
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
        accessDurationMinutes: users.accessDurationMinutes,
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

    // If successful login and access is allowed
    if (success) {
      const updateData: Record<string, unknown> = { lastLoginAt: now };
      
      // If user has a time limit set but no expiry yet, start the timer NOW
      if (user.accessDurationMinutes && !user.accessExpiresAt) {
        const expiresAt = new Date(now.getTime() + user.accessDurationMinutes * 60 * 1000);
        updateData.accessExpiresAt = expiresAt;
        console.log(`Starting ${user.accessDurationMinutes} minute timer for user ${email}, expires at ${expiresAt.toISOString()}`);
      }
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("Track login error:", error);
    return NextResponse.json({ allowed: true }); // Fail open
  }
}
