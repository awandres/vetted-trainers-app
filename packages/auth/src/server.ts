import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@vt/db";
import * as schema from "@vt/db";

/**
 * Better Auth server configuration for Vetted Trainers
 * Simplified for single-tenant VT application
 */
const stripTrailingSlash = (url: string) => url.replace(/\/$/, "");

export const auth = betterAuth({
  // Base URL for the application
  baseURL: stripTrailingSlash(
    process.env.BETTER_AUTH_URL || 
    process.env.NEXT_PUBLIC_APP_URL || 
    "http://localhost:3000"
  ),
  
  // Use Drizzle adapter with VT database
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  
  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === "production",
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  
  // Rate limiting for security
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 10, // Max 10 requests per window for auth endpoints
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60,
        max: 3,
      },
      "/forgot-password": {
        window: 300,
        max: 3,
      },
    },
  },
  
  // VT-specific user fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "member", // Default to member role
      },
      trainerId: {
        type: "string",
        required: false,
      },
      memberId: {
        type: "string",
        required: false,
      },
    },
  },
  
  // Trusted origins for VT apps
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    // Production domains
    "https://admin.vettedtrainers.com",
    "https://app.vettedtrainers.com",
    "https://vettedtrainers.com",
    "https://www.vettedtrainers.com",
    // Development
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ].filter(Boolean) as string[],
  
  // Advanced configuration
  advanced: {
    generateId: () => crypto.randomUUID() as any,
    // Use secure cookies only in production (HTTPS required)
    useSecureCookies: process.env.NODE_ENV === "production",
    // Use lax for same-origin development, none for cross-origin (requires HTTPS)
    cookieSameSite: "lax",
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? ".vettedtrainers.com" : undefined,
    },
  } as any,
});

// Export types
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Role helpers
export type UserRole = "admin" | "trainer" | "member";

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "admin";
}

export function isTrainer(user: User | null | undefined): boolean {
  return user?.role === "trainer" || user?.role === "admin";
}

export function isMember(user: User | null | undefined): boolean {
  return user?.role === "member";
}
