"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Activity,
  Clock,
  TrendingUp,
  Calculator,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@vt/ui";
import { useAuth } from "@/components/AuthProvider";

interface PayrollPeriod {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalRevenue: number;
  totalSessions: number;
  status: string;
}

interface PayrollDetails {
  id: string;
  trainerPay: number;
  sessionCount: number;
  totalRevenue: number;
  trainerName: string;
}

interface PayrollSummary {
  currentPeriod: PayrollPeriod | null;
  trainerDetails: PayrollDetails | null;
  recentPeriods: {
    period: PayrollPeriod;
    details: PayrollDetails | null;
  }[];
  ytdStats: {
    totalEarnings: number;
    totalSessions: number;
    averagePerSession: number;
  };
}

export default function MyPayrollPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);

  useEffect(() => {
    async function loadPayroll() {
      try {
        const res = await fetch("/api/trainers/my-payroll");
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (error) {
        console.error("Error loading payroll:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPayroll();
  }, []);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPeriod = summary?.recentPeriods?.[selectedPeriodIndex];
  const details = currentPeriod?.details;
  const period = currentPeriod?.period;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            My Payroll
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and sessions
          </p>
        </div>

        {/* YTD Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">YTD Earnings</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(summary?.ytdStats?.totalEarnings || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">YTD Sessions</p>
                  <p className="text-3xl font-bold">{summary?.ytdStats?.totalSessions || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Per Session</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(summary?.ytdStats?.averagePerSession || 0)}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedPeriodIndex(Math.min(selectedPeriodIndex + 1, (summary?.recentPeriods?.length || 1) - 1))}
              disabled={selectedPeriodIndex >= (summary?.recentPeriods?.length || 1) - 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[220px]">
              {period && (
                <>
                  <p className="font-semibold">{formatDateRange(period.weekStart, period.weekEnd)}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPeriodIndex === 0 ? "Current Period" : `${selectedPeriodIndex} week${selectedPeriodIndex > 1 ? "s" : ""} ago`}
                  </p>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedPeriodIndex(Math.max(selectedPeriodIndex - 1, 0))}
              disabled={selectedPeriodIndex <= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {selectedPeriodIndex !== 0 && (
            <Button variant="outline" onClick={() => setSelectedPeriodIndex(0)}>
              Current Week
            </Button>
          )}
        </div>

        {/* Period Details */}
        {period ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Earnings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Period Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">Sessions Logged</span>
                  <span className="font-semibold">{details?.sessionCount || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">Total Revenue Generated</span>
                  <span className="font-semibold">{formatCurrency(details?.totalRevenue || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-lg font-semibold">Your Pay</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(details?.trainerPay || 0)}
                  </span>
                </div>
                
                {/* Status Badge */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      period.status === "paid" 
                        ? "bg-green-500/10 text-green-600" 
                        : period.status === "approved"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {period.status === "paid" ? "Paid" : period.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Pay History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.recentPeriods?.slice(0, 6).map((item, index) => (
                    <button
                      key={item.period.id}
                      onClick={() => setSelectedPeriodIndex(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        index === selectedPeriodIndex 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {formatDateRange(item.period.weekStart, item.period.weekEnd)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.details?.sessionCount || 0} sessions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(item.details?.trainerPay || 0)}
                        </p>
                        <span className={`text-xs ${
                          item.period.status === "paid" 
                            ? "text-green-500" 
                            : "text-muted-foreground"
                        }`}>
                          {item.period.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No payroll data yet</p>
              <p className="text-sm mt-1">
                Start logging sessions to track your earnings
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Link href="/visits" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Activity className="h-4 w-4" />
              Log Session
            </Button>
          </Link>
          <Link href="/my-sessions" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Calendar className="h-4 w-4" />
              View Sessions
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
