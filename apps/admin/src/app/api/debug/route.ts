import { NextResponse } from "next/server";
import { db, users, count } from "@vt/db";

/**
 * Debug endpoint to check configuration
 * DELETE THIS IN PRODUCTION
 */
export async function GET() {
  const checks: Record<string, unknown> = {};
  
  // Check environment variables (don't expose actual values)
  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET ? "✅ Set" : "❌ Missing",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "❌ Missing",
    NODE_ENV: process.env.NODE_ENV,
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
