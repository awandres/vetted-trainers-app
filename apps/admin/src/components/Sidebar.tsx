"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Users,
  Dumbbell,
  DollarSign,
  ClipboardList,
  UserCog,
  Globe,
  BarChart3,
  Activity,
  FileText,
  PieChart,
  Mail,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Database,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Button, cn } from "@vt/ui";
import { useAuth } from "./AuthProvider";

const modules = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "KPI Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "YTD Financials",
    href: "/financials",
    icon: PieChart,
  },
  {
    title: "Sessions",
    href: "/visits",
    icon: Activity,
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
  },
  {
    title: "Trainers",
    href: "/trainers",
    icon: UserCog,
  },
  {
    title: "Contracts",
    href: "/contracts",
    icon: FileText,
  },
  {
    title: "Exercises",
    href: "/exercises",
    icon: Dumbbell,
  },
  {
    title: "Prescriptions",
    href: "/prescriptions",
    icon: ClipboardList,
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: Mail,
  },
  {
    title: "Website",
    href: "/website",
    icon: Globe,
  },
  {
    title: "Data",
    href: "/data",
    icon: Database,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: ShieldCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
    // Dispatch event for SidebarLayout to listen
    window.dispatchEvent(new Event("sidebar-toggle"));
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border shadow-sm lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 ease-in-out",
          // Desktop styles
          "hidden lg:flex lg:flex-col",
          isCollapsed ? "lg:w-16" : "lg:w-56",
          // Mobile styles
          isMobileOpen && "flex flex-col w-64 lg:hidden"
        )}
      >
        {/* Logo/Header */}
        <div
          className={cn(
            "flex items-center border-b h-16 px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/vt/VT Logos/vetted-logo-white.png"
                alt="VT"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-sm">Vetted Trainers</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/">
              <Image
                src="/images/vt/VT Logos/vetted-logo-white.png"
                alt="VT"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = pathname === module.href || 
                (module.href !== "/" && pathname.startsWith(module.href));

              return (
                <li key={module.href}>
                  <Link
                    href={module.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary/10 text-primary font-medium",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? module.title : undefined}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{module.title}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section & Sign Out */}
        <div className={cn(
          "border-t p-3",
          isCollapsed && "flex flex-col items-center"
        )}>
          {!isCollapsed && user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
          </button>

          {/* Collapse Toggle - Desktop only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className={cn(
              "w-full h-10 mt-2 hidden lg:flex",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r w-64 transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between border-b h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">VT</span>
            </div>
            <span className="font-semibold text-sm">Vetted Trainers</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = pathname === module.href || 
                (module.href !== "/" && pathname.startsWith(module.href));

              return (
                <li key={module.href}>
                  <Link
                    href={module.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                    <span className="text-sm">{module.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section & Sign Out - Mobile */}
        <div className="border-t p-3">
          {user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Hook to get sidebar state for layout adjustments
export function useSidebarWidth() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }

    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sidebar-collapsed") {
        setIsCollapsed(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return isCollapsed ? 64 : 224; // 16 * 4 = 64px or 14 * 16 = 224px
}
