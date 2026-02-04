"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@vt/ui";
import { ClientSidebar } from "./ClientSidebar";
import { useAuth } from "./AuthProvider";

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Pages where sidebar should be hidden
const PUBLIC_PAGES = ["/login", "/register", "/forgot-password"];

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, member } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("client-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }

    // Listen for sidebar toggle changes
    const handleStorageChange = () => {
      const current = localStorage.getItem("client-sidebar-collapsed");
      setIsCollapsed(current === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-window updates
    const handleToggle = () => handleStorageChange();
    window.addEventListener("client-sidebar-toggle", handleToggle);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("client-sidebar-toggle", handleToggle);
    };
  }, []);

  // Don't render layout until mounted and auth is loaded
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#2a2d36] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]" />
      </div>
    );
  }

  // Show sidebar only for authenticated users with member profiles on non-public pages
  const isPublicPage = PUBLIC_PAGES.some(page => pathname.startsWith(page));
  const showSidebar = isAuthenticated && member && !isPublicPage;

  return (
    <div className="min-h-screen bg-[#2a2d36]">
      {showSidebar && <ClientSidebar />}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          showSidebar && "lg:pl-56",
          showSidebar && isCollapsed && "lg:pl-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}
