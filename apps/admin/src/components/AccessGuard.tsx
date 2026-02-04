"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@vt/auth/client";

interface AccessStatus {
  valid: boolean;
  reason?: string;
  message?: string;
  timeLimit?: boolean;
  remainingMinutes?: number;
  expiresAt?: string;
}

/**
 * AccessGuard Component
 * 
 * Silently enforces access controls:
 * - Checks access status every 30 seconds
 * - Auto-logs out and redirects to access-expired page when access is revoked
 */
export function AccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const checkAccess = useCallback(async () => {
    // Skip check on login page and access-expired page
    if (pathname === "/login" || pathname === "/access-expired") return;

    try {
      const res = await fetch("/api/access-check", { credentials: "include" });
      const status: AccessStatus = await res.json();

      if (!status.valid) {
        // Sign out and redirect to access-expired page with reason
        try {
          await signOut();
        } catch (e) {
          // Ignore errors
        }
        
        // Redirect to access-expired page with the reason
        const reason = status.reason || "session_invalid";
        router.push(`/access-expired?reason=${reason}`);
      }
    } catch (error) {
      console.error("Access check failed:", error);
    }
  }, [pathname, router]);

  // Check access on mount and periodically
  useEffect(() => {
    checkAccess();
    
    // Check every 30 seconds
    const interval = setInterval(checkAccess, 30000);
    
    return () => clearInterval(interval);
  }, [checkAccess]);

  return <>{children}</>;
}
