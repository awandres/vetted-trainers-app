"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useAuth } from "./AuthProvider";
import { cn } from "@vt/ui";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

// Pages where sidebar should be hidden
const SIDEBAR_HIDDEN_PATHS = ["/login"];

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if sidebar should be hidden on current path or if not authenticated
  const shouldHideSidebar = SIDEBAR_HIDDEN_PATHS.includes(pathname) || !isAuthenticated;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }

    // Listen for localStorage changes (from sidebar toggle)
    const handleStorageChange = () => {
      const current = localStorage.getItem("sidebar-collapsed");
      setIsCollapsed(current === "true");
    };

    // Custom event for same-tab updates
    window.addEventListener("sidebar-toggle", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("sidebar-toggle", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Prevent hydration mismatch - show minimal layout while loading
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // Hide sidebar on login page or when not authenticated
  if (shouldHideSidebar) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          // Desktop padding for sidebar
          "lg:pl-56",
          isCollapsed && "lg:pl-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}
