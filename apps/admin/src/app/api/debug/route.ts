import { NextRequest, NextResponse } from "next/server";
import { db, users, count } from "@vt/db";

/**
 * Debug endpoint to check configuration
 * DELETE THIS IN PRODUCTION
 */
export async function GET(request: NextRequest) {
  const checks: Record<string, unknown> = {};
  
  // Check environment variables (don't expose actual values)
  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET ? "✅ Set" : "❌ Missing",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "❌ Missing",
    NODE_ENV: process.env.NODE_ENV,
  };
  
  // Check cookies (check both regular and __Secure- prefixed for production)
  const sessionCookie = request.cookies.get("better-auth.session_token")
    || request.cookies.get("__Secure-better-auth.session_token");
  checks.cookies = {
    sessionToken: sessionCookie ? `✅ Present (${sessionCookie.value.substring(0, 10)}...)` : "❌ Not set",
    allCookies: request.cookies.getAll().map(c => c.name),
  };
  
  // Check database connection
  try {
    const result = await db.select({ count: count() }).from(users);
    checks.database = {
      status: "✅ Connected",
      userCount: result[0]?.count || 0,
    };
  } catch (error) {
    checks.database = {
      status: "❌ Failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
  
  return NextResponse.json(checks, { status: 200 });
}
