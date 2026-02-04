"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@vt/ui";

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
 * - Auto-logs out when access is revoked (no warning shown)
 */
export function AccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState("");

  const checkAccess = useCallback(async () => {
    // Skip check on login page
    if (pathname === "/login") return;

    try {
      const res = await fetch("/api/access-check", { credentials: "include" });
      const status: AccessStatus = await res.json();

      if (!status.valid) {
        // Show a generic "session expired" message
        setExpiredMessage("Your session has expired. Please log in again.");
        setShowExpiredDialog(true);
      }
    } catch (error) {
      console.error("Access check failed:", error);
    }
  }, [pathname]);

  // Check access on mount and periodically
  useEffect(() => {
    checkAccess();
    
    // Check every 30 seconds
    const interval = setInterval(checkAccess, 30000);
    
    return () => clearInterval(interval);
  }, [checkAccess]);

  // Handle logout when access expires
  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      // Ignore errors
    }
    router.push("/login");
  };

  return (
    <>
      {children}

      {/* Session expired dialog - shown when access is revoked */}
      <AlertDialog open={showExpiredDialog}>
        <AlertDialogContent className="bg-[#353840] border-[#454850]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Session Expired</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {expiredMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleLogout} className="bg-[#3b82f6] hover:bg-[#2563eb]">
              Return to Login
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
