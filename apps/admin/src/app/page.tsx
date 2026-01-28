import Link from "next/link";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@vt/ui";
import { AlertsWidget } from "@/components/AlertsWidget";
import { UserMenu } from "@/components/UserMenu";
import { TrainerDashboard } from "@/components/TrainerDashboard";
import { db, vtMembers, vtSessions, eq, sql, and, gte } from "@vt/db";
import { getServerSession } from "@/lib/auth";

const modules = [
  {
    title: "KPI Dashboard",
    description: "Weekly performance metrics, revenue, and business health",
    href: "/dashboard",
    icon: BarChart3,
    highlight: true,
  },
  {
    title: "YTD Financials",
    description: "Year-to-date revenue, profit, and performance trends",
    href: "/financials",
    icon: PieChart,
    highlight: true,
  },
  {
    title: "Sessions & Visits",
    description: "Log training sessions and track member attendance",
    href: "/visits",
    icon: Activity,
  },
  {
    title: "Members",
    description: "Manage gym members, contracts, and status tracking",
    href: "/members",
    icon: Users,
  },
  {
    title: "Trainers",
    description: "Trainer profiles, rates, and performance metrics",
    href: "/trainers",
    icon: UserCog,
  },
  {
    title: "Contracts",
    description: "Member agreements, renewals, and expiring alerts",
    href: "/contracts",
    icon: FileText,
  },
  {
    title: "Exercises",
    description: "Exercise library for mobility and stretch prescriptions",
    href: "/exercises",
    icon: Dumbbell,
  },
  {
    title: "Prescriptions",
    description: "Create and manage exercise prescriptions for members",
    href: "/prescriptions",
    icon: ClipboardList,
  },
  {
    title: "Payroll",
    description: "Weekly payroll periods, trainer pay, and commissions",
    href: "/payroll",
    icon: DollarSign,
  },
  {
    title: "Website",
    description: "Edit the public Vetted Trainers website",
    href: "/website",
    icon: Globe,
  },
];

async function getQuickStats() {
  try {
    // Get member counts by status
    const memberStats = await db
      .select({
        status: vtMembers.status,
        count: sql<number>`count(*)::int`,
      })
      .from(vtMembers)
      .groupBy(vtMembers.status);

    const stats = {
      active: 0,
      inactive: 0,
      churned: 0,
      paused: 0,
      total: 0,
    };

    for (const row of memberStats) {
      if (row.status && row.status in stats) {
        stats[row.status as keyof typeof stats] = row.count;
      }
      stats.total += row.count;
    }

    // Get this week's sessions
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    const sundayStr = sunday.toISOString().split("T")[0];

    const weekSessions = await db
      .select({
        totalSessions: sql<string>`coalesce(sum(${vtSessions.sessionValue}::numeric), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${vtSessions.priceCharged}), 0)::int`,
      })
      .from(vtSessions)
      .where(gte(vtSessions.sessionDate, sundayStr));

    return {
      ...stats,
      weekSessions: parseFloat(weekSessions[0]?.totalSessions || "0"),
      weekRevenue: weekSessions[0]?.totalRevenue || 0,
    };
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    return {
      active: 0,
      inactive: 0,
      churned: 0,
      paused: 0,
      total: 0,
      weekSessions: 0,
      weekRevenue: 0,
    };
  }
}

export default async function AdminDashboard() {
  const [stats, session] = await Promise.all([
    getQuickStats(),
    getServerSession(),
  ]);

  const isTrainer = session?.user?.role === "trainer";
  const isAdmin = session?.user?.role === "admin";
  const portalTitle = isTrainer ? "Trainer Portal" : "Admin Portal";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Vetted Trainers</h1>
              <p className="text-sm text-muted-foreground">{portalTitle}</p>
            </div>
            <nav className="flex items-center gap-4">
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Show Trainer Dashboard for trainers */}
        {isTrainer && <TrainerDashboard />}

        {/* Show Admin Dashboard for admins and non-authenticated users */}
        {!isTrainer && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome to the Vetted Trainers admin portal
              </p>
            </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.inactive}</p>
                </div>
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">14-45 days since visit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Churned</p>
                  <p className="text-3xl font-bold text-red-600">{stats.churned}</p>
                </div>
                <div className="rounded-full bg-red-500/10 p-3">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">45+ days since visit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-3xl font-bold">{stats.weekSessions}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Sessions · ${(stats.weekRevenue / 100).toLocaleString()} revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout: Quick Actions + Alerts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="grid gap-3">
              <Link href="/dashboard">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="rounded-lg bg-primary/20 p-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">View KPI Dashboard</p>
                      <p className="text-sm text-muted-foreground">Weekly metrics & trends</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/visits">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="rounded-lg bg-green-500/10 p-3">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Log Session</p>
                      <p className="text-sm text-muted-foreground">Record training visit</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/members">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Manage Members</p>
                      <p className="text-sm text-muted-foreground">View & edit members</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Alerts Widget */}
          <AlertsWidget />
        </div>

        {/* Module Grid */}
        <h3 className="text-lg font-semibold mb-4">All Modules</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className={`h-full transition-colors hover:bg-accent/50 ${module.highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${module.highlight ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <module.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs">{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
          </>
        )}
      </main>
    </div>
  );
}
