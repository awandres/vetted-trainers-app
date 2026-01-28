"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@vt/auth/client";
import { useAuth } from "./AuthProvider";
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Users, 
  ChevronDown,
  Shield
} from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <UserIcon className="h-4 w-4" />
        Sign In
      </Link>
    );
  }

  const roleLabel = user?.role === "admin" 
    ? "Admin" 
    : user?.role === "trainer" 
    ? "Trainer" 
    : "Member";

  const roleBadgeColor = user?.role === "admin"
    ? "bg-red-500/20 text-red-400"
    : user?.role === "trainer"
    ? "bg-blue-500/20 text-blue-400"
    : "bg-green-500/20 text-green-400";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium">{user?.name || user?.email}</p>
          <p className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeColor} inline-flex items-center gap-1`}>
            <Shield className="h-3 w-3" />
            {roleLabel}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>

            {isAdmin && (
              <>
                <Link
                  href="/team"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  Team Management
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <div className="border-t border-border my-1" />
              </>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
