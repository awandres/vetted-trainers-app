"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for React components
 * Use this in client components for auth operations
 * 
 * Dynamically determines base URL:
 * - In browser: uses current window origin
 * - In SSR: uses NEXT_PUBLIC_APP_URL env var
 */
const baseURL = typeof window !== "undefined" 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const authClient = createAuthClient({
  baseURL,
});

// Export commonly used hooks and functions
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
