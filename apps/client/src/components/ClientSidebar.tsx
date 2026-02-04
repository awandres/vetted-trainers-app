"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@vt/ui";
import {
  Home,
  Dumbbell,
  Calendar,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "./AuthProvider";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "My Sessions",
    href: "/sessions",
    icon: Calendar,
  },
  {
    title: "Prescriptions",
    href: "/prescriptions",
    icon: Dumbbell,
  },
  {
    title: "My Contract",
    href: "/contract",
    icon: FileText,
  },
  {
    title: "Account",
    href: "/account",
    icon: User,
  },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const { member, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("client-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("client-sidebar-collapsed", String(newState));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#353840] border border-[#454850] text-white"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-[#2a2d36] border-r border-[#454850] transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-16" : "w-56",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-[#454850]",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <Image
            src="/images/vt/VT_Logo_white.png"
            alt="Vetted Trainers"
            width={32}
            height={32}
            className="flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white truncate">Vetted Trainers</h1>
              <p className="text-xs text-gray-400 truncate">Member Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-[#3b82f6] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#353840]",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">{item.title}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className={cn(
          "border-t border-[#454850] p-3",
          isCollapsed && "flex flex-col items-center"
        )}>
          {!isCollapsed && member && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-white truncate">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{member.email}</p>
            </div>
          )}
          
          <button
            onClick={signOut}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#353840] transition-colors",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full bg-[#353840] border border-[#454850] text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}
