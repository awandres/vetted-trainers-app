"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  trainerId: string | null;
  trainerName: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface AuthContextType {
  user: User | null;
  member: Member | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  member: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshMember: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserAndMember = async () => {
    try {
      // Fetch current session/user
      const sessionRes = await fetch("/api/auth/session", {
        credentials: "include",
      });
      
      if (!sessionRes.ok) {
        setUser(null);
        setMember(null);
        return;
      }

      const sessionData = await sessionRes.json();
      
      if (!sessionData.user) {
        setUser(null);
        setMember(null);
        return;
      }

      setUser(sessionData.user);

      // Fetch member data linked to this user
      const memberRes = await fetch("/api/me", {
        credentials: "include",
      });

      if (memberRes.ok) {
        const memberData = await memberRes.json();
        setMember(memberData.member);
      }
    } catch (error) {
      console.error("Error fetching auth:", error);
      setUser(null);
      setMember(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndMember();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (!user && !isPublicRoute) {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  const signOut = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setUser(null);
    setMember(null);
    router.push("/login");
  };

  const refreshMember = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
      }
    } catch (error) {
      console.error("Error refreshing member:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Higher-order component for protected routes
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!isAuthenticated && !isPublicRoute) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
