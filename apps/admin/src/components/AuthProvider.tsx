"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useSession, signOut as authSignOut } from "@vt/auth/client";
import { Loader2 } from "lucide-react";

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  image?: string | null;
};

type SessionData = {
  user: SessionUser | null;
  session: { id: string; expiresAt: Date } | null;
};

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession() as {
    data: SessionData | null;
    isPending: boolean
  };

  const user = data?.user ?? null;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isTrainer = user?.role === "trainer" || isAdmin;

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending,
        isAuthenticated,
        isAdmin,
        isTrainer,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Component that shows children only when authenticated
 */
export function RequireAuth({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode
}) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return fallback ?? (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

/**
 * Component that shows children only for admins
 */
export function RequireAdmin({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode
}) {
  const { isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return fallback ?? (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
