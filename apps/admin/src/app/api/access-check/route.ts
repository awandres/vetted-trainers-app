import { NextRequest, NextResponse } from "next/server";
import { db, users, sessions, eq, and, gt } from "@vt/db";

/**
 * Access Control Check API
 * 
 * This endpoint checks if a user's access is still valid.
 * It handles:
 * - accessDisabled flag (immediate revocation)
 * - accessExpiresAt timestamp (hard expiration)
 * - accessDurationMinutes (time-limited sessions - expires X minutes after first request)
 * 
 * Returns:
 * - { valid: true } if access is allowed
 * - { valid: false, reason: "..." } if access should be revoked
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token
    let sessionToken = request.cookies.get("better-auth.session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ valid: false, reason: "no_session" });
    }

    // Extract token from signed format
    if (sessionToken.includes(".")) {
      sessionToken = sessionToken.split(".")[0];
    }

    // Get session
    const [session] = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        createdAt: sessions.createdAt,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.token, sessionToken),
          gt(sessions.expiresAt, new Date())
        )
      );

    if (!session) {
      return NextResponse.json({ valid: false, reason: "session_invalid" });
    }

    // Get user with access controls
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        accessDisabled: users.accessDisabled,
        accessExpiresAt: users.accessExpiresAt,
        accessDurationMinutes: users.accessDurationMinutes,
      })
      .from(users)
      .where(eq(users.id, session.userId));

    if (!user) {
      return NextResponse.json({ valid: false, reason: "user_not_found" });
    }

    // Check if access is disabled
    if (user.accessDisabled) {
      return NextResponse.json({ 
        valid: false, 
        reason: "access_disabled",
        message: "Your access has been temporarily disabled. Please contact support."
      });
    }

    // Check if access has expired (hard expiration)
    if (user.accessExpiresAt && new Date(user.accessExpiresAt) < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        reason: "access_expired",
        message: "Your access period has ended. Please contact support."
      });
    }

    // Check time-limited access (X minutes from session start)
    if (user.accessDurationMinutes && session.createdAt) {
      const sessionStart = new Date(session.createdAt);
      const sessionExpiry = new Date(sessionStart.getTime() + user.accessDurationMinutes * 60 * 1000);
      const now = new Date();
      
      if (now > sessionExpiry) {
        return NextResponse.json({ 
          valid: false, 
          reason: "time_limit_exceeded",
          message: "Your demo session has expired. Please contact support for additional access."
        });
      }
      
      // Return remaining time
      const remainingMs = sessionExpiry.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      
      return NextResponse.json({ 
        valid: true, 
        timeLimit: true,
        remainingMinutes,
        expiresAt: sessionExpiry.toISOString(),
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Access check error:", error);
    return NextResponse.json({ valid: true }); // Fail open to avoid blocking legitimate users
  }
}
