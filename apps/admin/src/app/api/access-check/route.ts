import { NextRequest, NextResponse } from "next/server";
import { db, users, sessions, eq, and, gt } from "@vt/db";

/**
 * Access Control Check API
 * 
 * This endpoint checks if a user's access is still valid.
 * It handles:
 * - accessDisabled flag (immediate revocation)
 * - accessExpiresAt timestamp (hard expiration - used for time limits)
 * 
 * Returns:
 * - { valid: true } if access is allowed
 * - { valid: false, reason: "..." } if access should be revoked
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token (check both regular and __Secure- prefixed for production)
    let sessionToken = request.cookies.get("better-auth.session_token")?.value
      || request.cookies.get("__Secure-better-auth.session_token")?.value;
    
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

    // Check if access has expired (this is the primary time limit check)
    if (user.accessExpiresAt) {
      const expiry = new Date(user.accessExpiresAt);
      const now = new Date();
      
      if (now > expiry) {
        return NextResponse.json({ 
          valid: false, 
          reason: "access_expired",
          message: "Your session has ended. Please contact support for additional access."
        });
      }
      
      // Return remaining time for time-limited access
      if (user.accessDurationMinutes) {
        const remainingMs = expiry.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        
        return NextResponse.json({ 
          valid: true, 
          timeLimit: true,
          remainingMinutes,
          expiresAt: expiry.toISOString(),
        });
      }
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Access check error:", error);
    return NextResponse.json({ valid: true }); // Fail open to avoid blocking legitimate users
  }
}
