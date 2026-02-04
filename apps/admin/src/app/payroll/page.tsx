"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vt/ui";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface VTPayrollPeriod {
  id: string;
  weekEnding: string;
  totalSessions: string | null;
  goalSessions: number | null;
  utilizationRate: string | null;
  s2sRevenue: number | null;
  contractedRevenue: number | null;
  totalRevenue: number | null;
  targetRevenue: number | null;
  totalPayout: number | null;
  fixedExpenses: number | null;
  totalExpenses: number | null;
  netProfit: number | null;
  profitMargin: string | null;
  payoutRatio: string | null;
  status: "draft" | "review" | "approved" | "paid";
  createdAt: string;
}

function formatPrice(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatPercent(value: string | null): string {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return `${(num * 100).toFixed(1)}%`;
}

function formatWeekEnding(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { label: "Draft", className: "bg-background0/10 text-gray-600", icon: FileText },
    review: { label: "In Review", className: "bg-yellow-500/10 text-yellow-600", icon: Clock },
    approved: { label: "Approved", className: "bg-blue-500/10 text-blue-600", icon: CheckCircle },
    paid: { label: "Paid", className: "bg-green-500/10 text-green-600", icon: DollarSign },
  }[status] || { label: status, className: "", icon: FileText };

  const Icon = config.icon;
  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

export default function PayrollPage() {
  const [periods, setPeriods] = useState<VTPayrollPeriod[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeriods() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/payroll?year=${selectedYear}`);
        if (!res.ok) throw new Error("Failed to fetch payroll periods");
        const data = await res.json();
        setPeriods(data.periods || []);
        if (data.availableYears?.length > 0) {
          setAvailableYears(data.availableYears);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPeriods();
  }, [selectedYear]);

  // Filter to only past/current weeks (not future)
  const today = new Date();
  const pastPeriods = periods.filter(p => new Date(p.weekEnding) <= today);
  
  // Only show periods with actual data
  const activePeriods = pastPeriods.filter(
    p => (p.totalSessions && parseFloat(p.totalSessions) > 0) || (p.totalRevenue && p.totalRevenue > 0)
  );

  const ytdTotals = activePeriods.reduce(
    (acc, period) => ({
      revenue: acc.revenue + (period.totalRevenue || 0),
      payout: acc.payout + (period.totalPayout || 0),
      profit: acc.profit + (period.netProfit || 0),
      sessions: acc.sessions + parseFloat(period.totalSessions || "0"),
    }),
    { revenue: 0, payout: 0, profit: 0, sessions: 0 }
  );

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Payroll</h1>
            <p className="text-muted-foreground">Manage weekly payroll periods</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedYear((parseInt(selectedYear) - 1).toString())}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] h-8 border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([...availableYears, (new Date().getFullYear() - 1).toString(), new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString()])]
                  .sort((a, b) => parseInt(b) - parseInt(a))
                  .map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)
                }
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedYear((parseInt(selectedYear) + 1).toString())}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />New Payroll Period</Button>
        </div>
      </div>

      {/* Year Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{selectedYear} Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(ytdTotals.revenue)}</div>
            <p className="text-xs text-muted-foreground">Across {activePeriods.length} weeks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{selectedYear} Payouts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(ytdTotals.payout)}</div>
            <p className="text-xs text-muted-foreground">Trainer compensation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{selectedYear} Net Profit</CardTitle>
            {ytdTotals.profit >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${ytdTotals.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPrice(ytdTotals.profit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {ytdTotals.revenue > 0 ? `${((ytdTotals.profit / ytdTotals.revenue) * 100).toFixed(1)}% margin` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{selectedYear} Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ytdTotals.sessions.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Avg {activePeriods.length > 0 ? (ytdTotals.sessions / activePeriods.length).toFixed(0) : 0}/week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Periods — {selectedYear}</CardTitle>
          <CardDescription>Click on a period to view detailed breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Error loading payroll</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : activePeriods.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No payroll periods for {selectedYear}</p>
              <p className="text-muted-foreground">
                {availableYears.length > 0 ? `Data available for: ${availableYears.join(", ")}` : "Create your first payroll period"}
              </p>
              {availableYears.length === 0 && (
                <Button className="mt-4"><Plus className="h-4 w-4 mr-2" />Create Payroll Period</Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week Ending</TableHead>
                    <TableHead className="text-center">Sessions</TableHead>
                    <TableHead className="text-center">Utilization</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Payout</TableHead>
                    <TableHead className="text-right">Net Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePeriods.map((period) => (
                    <TableRow key={period.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{formatWeekEnding(period.weekEnding)}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{parseFloat(period.totalSessions || "0").toFixed(0)}</span>
                        {period.goalSessions && <span className="text-muted-foreground text-sm">/{period.goalSessions}</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={parseFloat(period.utilizationRate || "0") >= 0.8 ? "text-green-600 font-medium" : parseFloat(period.utilizationRate || "0") >= 0.6 ? "text-yellow-600" : "text-red-600"}>
                          {formatPercent(period.utilizationRate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(period.totalRevenue)}</TableCell>
                      <TableCell className="text-right">{formatPrice(period.totalPayout)}</TableCell>
                      <TableCell className="text-right">
                        <span className={(period.netProfit || 0) >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {formatPrice(period.netProfit)}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={period.status} /></TableCell>
                      <TableCell className="text-right">
                        <Link href={`/payroll/${period.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
