"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vt/ui";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Mail,
} from "lucide-react";

// Types
interface PayrollPeriod {
  id: string;
  weekEnding: string;
  totalSessions: string | null;
  goalSessions: number | null;
  utilizationRate: string | null;
  totalRevenue: number | null;
  targetRevenue: number | null;
  totalPayout: number | null;
  fixedExpenses: number | null;
  totalExpenses: number | null;
  netProfit: number | null;
  profitMargin: string | null;
  payoutRatio: string | null;
  status: string;
}

interface TrainerMetric {
  id: string;
  trainerId: string;
  weekEnding: string;
  activeMembers: number | null;
  inactiveMembers: number | null;
  churnedMembers: number | null;
  totalMembers: number | null;
  referrals: number | null;
  totalSessions: string | null;
  earnings: number | null;
  trainer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  status: "active" | "inactive" | "churned" | "paused";
  daysSinceVisit: number | null;
  trainer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

// Helper functions
function formatCurrency(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatPercent(value: string | number | null): string {
  if (value === null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${(num * 100).toFixed(1)}%`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - 6);
  return `${startOfWeek.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

// Mini bar chart component
function MiniBarChart({
  data,
  height = 60,
}: {
  data: number[];
  height?: number;
}) {
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;

  return (
    <div
      className="flex items-end gap-1 w-full"
      style={{ height }}
    >
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
          style={{
            height: `${(value / max) * 100}%`,
            minHeight: value > 0 ? "4px" : "0",
          }}
          title={`${value}`}
        />
      ))}
    </div>
  );
}

// Trainer card component
function TrainerCard({
  name,
  sessions,
  members,
  activeRate,
}: {
  name: string;
  sessions: number;
  members: number;
  activeRate: number;
}) {
  return (
    <div className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">{name}</span>
        <Badge variant={activeRate >= 0.8 ? "default" : "secondary"}>
          {formatPercent(activeRate)} active
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Sessions</p>
          <p className="text-lg font-bold">{sessions}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Members</p>
          <p className="text-lg font-bold">{members}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [trainerMetrics, setTrainerMetrics] = useState<TrainerMetric[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, membersRes] = await Promise.all([
        fetch("/api/kpi?limit=52"),
        fetch("/api/members"),
      ]);

      const kpiData = await kpiRes.json();
      const membersData = await membersRes.json();

      setPeriods(kpiData.periods || []);
      setTrainerMetrics(kpiData.trainerMetrics || []);
      setMembers(membersData.members || []);

      // Filter to only past/current weeks (not future), then find one with actual data
      const today = new Date();
      const pastWeeks = (kpiData.periods || []).filter(
        (p: PayrollPeriod) => new Date(p.weekEnding) <= today
      );

      if (pastWeeks.length > 0 && !selectedWeek) {
        // Find the most recent week with actual data, or fall back to the most recent past week
        const activeWeek = pastWeeks.find(
          (p: PayrollPeriod) => (p.totalSessions && parseFloat(p.totalSessions) > 0) || (p.totalRevenue && p.totalRevenue > 0)
        );
        setSelectedWeek(activeWeek?.weekEnding || pastWeeks[0].weekEnding);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate current week if not available
  const getCurrentWeekEnding = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (6 - dayOfWeek));
    return saturday.toISOString().split("T")[0];
  };

  const handleCalculateKPIs = async () => {
    setIsCalculating(true);
    try {
      const weekEnding = selectedWeek || getCurrentWeekEnding();
      await fetch("/api/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekEnding,
          targetRevenue: 15000,
          goalSessions: 200,
          fixedExpenses: 8000,
        }),
      });
      await fetchData();
    } catch (err) {
      console.error("Error calculating KPIs:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Filter to only past/current weeks (not future)
  const today = new Date();
  const pastPeriods = periods.filter((p) => new Date(p.weekEnding) <= today);

  // Get current period
  const currentPeriod = pastPeriods.find((p) => p.weekEnding === selectedWeek);

  // Calculate member stats
  const memberStats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    inactive: members.filter((m) => m.status === "inactive").length,
    churned: members.filter((m) => m.status === "churned").length,
  };

  // Get trend data for charts (only past weeks with actual data, up to 8)
  const trendData = pastPeriods
    .filter(p => (p.totalSessions && parseFloat(p.totalSessions) > 0) || (p.totalRevenue && p.totalRevenue > 0))
    .slice(0, 8)
    .reverse()
    .map((p) => ({
      weekEnding: p.weekEnding,
      sessions: parseFloat(p.totalSessions || "0"),
      revenue: (p.totalRevenue || 0) / 100,
      profit: (p.netProfit || 0) / 100,
      utilization: parseFloat(p.utilizationRate || "0") * 100,
    }));

  // Previous period for comparison
  const previousPeriod = periods[1];
  const revenueChange =
    currentPeriod && previousPeriod
      ? ((currentPeriod.totalRevenue || 0) - (previousPeriod.totalRevenue || 0)) /
      (previousPeriod.totalRevenue || 1)
      : 0;
  const sessionsChange =
    currentPeriod && previousPeriod
      ? (parseFloat(currentPeriod.totalSessions || "0") -
        parseFloat(previousPeriod.totalSessions || "0")) /
      (parseFloat(previousPeriod.totalSessions || "1") || 1)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">KPI Dashboard</h1>
              <p className="text-muted-foreground">
                Weekly performance metrics and business health
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {pastPeriods.map((p) => (
                  <SelectItem key={p.weekEnding} value={p.weekEnding}>
                    Week ending {formatDate(p.weekEnding)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/kpi-entry">
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Enter KPIs
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleCalculateKPIs}
              disabled={isCalculating}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isCalculating ? "animate-spin" : ""}`}
              />
              Calculate
            </Button>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Revenue Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(currentPeriod?.totalRevenue ?? null)}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {revenueChange > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">
                      +{(revenueChange * 100).toFixed(1)}%
                    </span>
                  </>
                ) : revenueChange < 0 ? (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">
                      {(revenueChange * 100).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">vs last week</span>
                )}
                <span className="text-muted-foreground">vs last week</span>
              </div>
              {currentPeriod?.targetRevenue && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Target: {formatCurrency(currentPeriod.targetRevenue)}</span>
                    <span>
                      {formatPercent(
                        (currentPeriod.totalRevenue || 0) /
                        currentPeriod.targetRevenue
                      )}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((currentPeriod.totalRevenue || 0) /
                        currentPeriod.targetRevenue) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parseFloat(currentPeriod?.totalSessions || "0").toFixed(1)}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {sessionsChange > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">
                      +{(sessionsChange * 100).toFixed(1)}%
                    </span>
                  </>
                ) : sessionsChange < 0 ? (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">
                      {(sessionsChange * 100).toFixed(1)}%
                    </span>
                  </>
                ) : null}
                <span className="text-muted-foreground">vs last week</span>
              </div>
              {currentPeriod?.goalSessions && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Goal: {currentPeriod.goalSessions}</span>
                    <span>{formatPercent(currentPeriod.utilizationRate)}</span>
                  </div>
                  <Progress
                    value={parseFloat(currentPeriod.utilizationRate || "0") * 100}
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Net Profit Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              {(currentPeriod?.netProfit || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${(currentPeriod?.netProfit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {formatCurrency(currentPeriod?.netProfit ?? null)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margin: {formatPercent(currentPeriod?.profitMargin ?? null)}
              </p>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trainer Payout</span>
                  <span>{formatCurrency(currentPeriod?.totalPayout ?? null)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fixed Expenses</span>
                  <span>{formatCurrency(currentPeriod?.fixedExpenses ?? null)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Health Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Health</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberStats.total}</div>
              <p className="text-xs text-muted-foreground">Total members</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs flex-1">Active</span>
                  <span className="text-xs font-medium">{memberStats.active}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-xs flex-1">Inactive</span>
                  <span className="text-xs font-medium">{memberStats.inactive}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs flex-1">Churned</span>
                  <span className="text-xs font-medium">{memberStats.churned}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sessions Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sessions Trend
              </CardTitle>
              <CardDescription>Last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                data={trendData.map((d) => d.sessions)}
                height={120}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {trendData.length > 0 && (
                  <>
                    <span>
                      {new Date(trendData[0].weekEnding + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                    <span>
                      {new Date(
                        trendData[trendData.length - 1].weekEnding + "T12:00:00"
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                data={trendData.map((d) => d.revenue)}
                height={120}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {trendData.length > 0 && (
                  <>
                    <span>
                      {new Date(trendData[0].weekEnding + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                    <span>
                      {new Date(
                        trendData[trendData.length - 1].weekEnding + "T12:00:00"
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Breakdown</CardTitle>
            <CardDescription>
              Key metrics for the last 8 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Week</th>
                    <th className="text-right py-3 px-2 font-medium">Sessions</th>
                    <th className="text-right py-3 px-2 font-medium">Utilization</th>
                    <th className="text-right py-3 px-2 font-medium">Revenue</th>
                    <th className="text-right py-3 px-2 font-medium">Payout</th>
                    <th className="text-right py-3 px-2 font-medium">Profit</th>
                    <th className="text-right py-3 px-2 font-medium">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {pastPeriods
                    .filter(p => (p.totalSessions && parseFloat(p.totalSessions) > 0) || (p.totalRevenue && p.totalRevenue > 0))
                    .slice(0, 8)
                    .map((period) => (
                      <tr
                        key={period.id}
                        className={`border-b hover:bg-muted/50 ${period.weekEnding === selectedWeek ? "bg-muted/30" : ""
                          }`}
                      >
                        <td className="py-3 px-2">
                          {getWeekLabel(period.weekEnding)}
                        </td>
                        <td className="text-right py-3 px-2">
                          {parseFloat(period.totalSessions || "0").toFixed(1)}
                        </td>
                        <td className="text-right py-3 px-2">
                          <Badge
                            variant={
                              parseFloat(period.utilizationRate || "0") >= 0.8
                                ? "default"
                                : "secondary"
                            }
                          >
                            {formatPercent(period.utilizationRate)}
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-2">
                          {formatCurrency(period.totalRevenue)}
                        </td>
                        <td className="text-right py-3 px-2">
                          {formatCurrency(period.totalPayout)}
                        </td>
                        <td
                          className={`text-right py-3 px-2 font-medium ${(period.netProfit || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          {formatCurrency(period.netProfit)}
                        </td>
                        <td className="text-right py-3 px-2">
                          {formatPercent(period.profitMargin)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-5">
          <Link href="/members">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 py-6">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Members</p>
                  <p className="text-sm text-muted-foreground">
                    {memberStats.total} total
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/visits">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 py-6">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Log attendance
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/trainers">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 py-6">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Trainers</p>
                  <p className="text-sm text-muted-foreground">
                    Staff management
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/payroll">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 py-6">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Payroll</p>
                  <p className="text-sm text-muted-foreground">
                    Weekly calculations
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/marketing">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 py-6">
                <Mail className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Marketing</p>
                  <p className="text-sm text-muted-foreground">
                    Email campaigns
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
