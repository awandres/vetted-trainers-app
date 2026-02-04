"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Target, PieChart, BarChart3, RefreshCw } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vt/ui";
import {
  AreaChart,
  BarChart,
  DonutChart,
  ProgressBar,
  BadgeDelta,
  Metric,
  Text,
} from "@tremor/react";

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
}

interface YTDMetrics {
  s2sRevenue: number;
  cmRevenue: number;
  totalRevenue: number;
  targetRevenue: number;
  netProfit: number;
  fixedExpenses: number;
  netMargin: number;
  totalSessions: number;
  goalSessions: number;
  utilization: number;
}

// Format currency
function formatCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "$0";
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(dollars) >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0%";
  return `${(value * 100).toFixed(1)}%`;
}

// Dollar formatter for Tremor charts
const dollarFormatter = (number: number) => {
  return `$${Intl.NumberFormat("us").format(number / 100).toString()}`;
};

export default function FinancialsPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [ytdMetrics, setYtdMetrics] = useState<YTDMetrics>({
    s2sRevenue: 0,
    cmRevenue: 0,
    totalRevenue: 0,
    targetRevenue: 130000000, // $1.3M
    netProfit: 0,
    fixedExpenses: 0,
    netMargin: 0,
    totalSessions: 0,
    goalSessions: 0,
    utilization: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/kpi?limit=52");
      const data = await res.json();
      
      if (data.periods) {
        setPeriods(data.periods);
        
        // Calculate YTD metrics from periods
        const activePeriods = data.periods.filter((p: PayrollPeriod) => 
          p.totalRevenue && p.totalRevenue > 0
        );
        
        const totalRevenue = activePeriods.reduce((sum: number, p: PayrollPeriod) => 
          sum + (p.totalRevenue || 0), 0
        );
        const totalPayout = activePeriods.reduce((sum: number, p: PayrollPeriod) => 
          sum + (p.totalPayout || 0), 0
        );
        const totalExpenses = activePeriods.reduce((sum: number, p: PayrollPeriod) => 
          sum + (p.totalExpenses || 0), 0
        );
        const fixedExpenses = activePeriods.reduce((sum: number, p: PayrollPeriod) => 
          sum + (p.fixedExpenses || 0), 0
        );
        const totalSessions = activePeriods.reduce((sum: number, p: PayrollPeriod) => 
          sum + parseFloat(p.totalSessions || "0"), 0
        );
        const goalSessions = activePeriods.reduce((sum: number, p: PayrollPeriod) => 
          sum + (p.goalSessions || 0), 0
        );
        
        const netProfit = totalRevenue - totalExpenses;
        
        // Estimate S2S vs CM split (roughly 35% S2S, 65% CM based on your data)
        const s2sRevenue = Math.round(totalRevenue * 0.35);
        const cmRevenue = totalRevenue - s2sRevenue;
        
        setYtdMetrics({
          s2sRevenue,
          cmRevenue,
          totalRevenue,
          targetRevenue: 130000000, // $1.3M target
          netProfit,
          fixedExpenses,
          netMargin: totalRevenue > 0 ? netProfit / totalRevenue : 0,
          totalSessions,
          goalSessions,
          utilization: goalSessions > 0 ? totalSessions / goalSessions : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter to only past/current weeks (not future)
  const today = new Date();
  const pastPeriods = periods.filter(p => new Date(p.weekEnding) <= today);

  // Prepare chart data for Tremor
  const sessionsChartData = pastPeriods
    .filter(p => p.totalSessions && parseFloat(p.totalSessions) > 0)
    .slice(0, 12)
    .reverse()
    .map(p => ({
      date: new Date(p.weekEnding).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Sessions: parseFloat(p.totalSessions || "0"),
      Goal: p.goalSessions || 200,
    }));

  // Cumulative revenue data - only periods with actual activity
  const activePeriods = pastPeriods
    .filter(p => (p.totalSessions && parseFloat(p.totalSessions) > 0) || (p.totalRevenue && p.totalRevenue > 0))
    .slice(0, 12)
    .reverse();
  
  let cumulativeActual = 0;
  let cumulativeTarget = 0;
  const revenueChartData = activePeriods.map(p => {
    cumulativeActual += (p.totalRevenue || 0);
    cumulativeTarget += (p.targetRevenue || 2500000);
    return {
      date: new Date(p.weekEnding).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "Actual Revenue": cumulativeActual,
      "Target Revenue": cumulativeTarget,
    };
  });

  // Weekly profit/loss data
  const profitChartData = pastPeriods
    .filter(p => p.totalRevenue && p.totalRevenue > 0)
    .slice(0, 12)
    .reverse()
    .map(p => ({
      date: new Date(p.weekEnding).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Profit: (p.netProfit || 0) / 100,
      Revenue: (p.totalRevenue || 0) / 100,
    }));

  // Donut chart data for revenue mix
  const revenueMixData = [
    { name: "S2S Revenue", value: ytdMetrics.s2sRevenue / 100 },
    { name: "CM Revenue", value: ytdMetrics.cmRevenue / 100 },
  ];

  const revenueProgress = ytdMetrics.targetRevenue > 0 
    ? (ytdMetrics.totalRevenue / ytdMetrics.targetRevenue) * 100 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">YTD Financials</h1>
              <p className="text-muted-foreground">Year-to-date performance metrics and trends</p>
            </div>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* YTD Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <Text>Total Revenue</Text>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <Metric className="text-emerald-600 mt-2">
              {formatCurrency(ytdMetrics.totalRevenue)}
            </Metric>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Target: {formatCurrency(ytdMetrics.targetRevenue)}</span>
                <span className="font-medium">{revenueProgress.toFixed(1)}%</span>
              </div>
              <ProgressBar value={revenueProgress} color="emerald" className="mt-1" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <Text>Net Profit</Text>
              {ytdMetrics.netProfit >= 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <Metric className={`mt-2 ${ytdMetrics.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(ytdMetrics.netProfit)}
            </Metric>
            <div className="mt-3">
              <BadgeDelta 
                deltaType={ytdMetrics.netMargin >= 0 ? "increase" : "decrease"}
                size="sm"
              >
                {formatPercent(ytdMetrics.netMargin)} margin
              </BadgeDelta>
            </div>
            <Text className="mt-2 text-xs">
              Fixed Expenses: {formatCurrency(ytdMetrics.fixedExpenses)}
            </Text>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <Text>Total Sessions</Text>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <Metric className="text-blue-600 mt-2">
              {ytdMetrics.totalSessions.toFixed(0)}
            </Metric>
            <Text className="text-xs mt-1">Goal: {ytdMetrics.goalSessions}</Text>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Utilization</span>
                <span className="font-medium">{formatPercent(ytdMetrics.utilization)}</span>
              </div>
              <ProgressBar 
                value={ytdMetrics.utilization * 100} 
                color={ytdMetrics.utilization >= 0.8 ? "emerald" : ytdMetrics.utilization >= 0.6 ? "amber" : "red"}
                className="mt-1" 
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <Text>Revenue Mix</Text>
              <PieChart className="h-5 w-5 text-purple-500" />
            </div>
            <div className="mt-4">
              <DonutChart
                data={revenueMixData}
                category="value"
                index="name"
                colors={["blue", "orange"]}
                valueFormatter={(val) => `$${val.toLocaleString()}`}
                className="h-32"
                showAnimation={true}
              />
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Session Performance
              </CardTitle>
              <CardDescription>Weekly sessions vs goals</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsChartData.length > 0 ? (
                <BarChart
                  data={sessionsChartData}
                  index="date"
                  categories={["Sessions", "Goal"]}
                  colors={["blue", "amber"]}
                  yAxisWidth={48}
                  className="h-64"
                  showAnimation={true}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No session data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cumulative Revenue
              </CardTitle>
              <CardDescription>Actual vs target revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueChartData.length > 0 ? (
                <AreaChart
                  data={revenueChartData}
                  index="date"
                  categories={["Actual Revenue", "Target Revenue"]}
                  colors={["emerald", "gray"]}
                  valueFormatter={dollarFormatter}
                  yAxisWidth={60}
                  className="h-64"
                  showAnimation={true}
                  curveType="monotone"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profit/Loss Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Weekly Profit & Revenue
            </CardTitle>
            <CardDescription>Revenue and profit trends by week</CardDescription>
          </CardHeader>
          <CardContent>
            {profitChartData.length > 0 ? (
              <AreaChart
                data={profitChartData}
                index="date"
                categories={["Revenue", "Profit"]}
                colors={["blue", "emerald"]}
                valueFormatter={(val) => `$${val.toLocaleString()}`}
                yAxisWidth={60}
                className="h-72"
                showAnimation={true}
              />
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                No profit data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Breakdown</CardTitle>
            <CardDescription>Detailed financial metrics by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Week Ending</th>
                    <th className="text-right py-3 px-2">Sessions</th>
                    <th className="text-right py-3 px-2">Utilization</th>
                    <th className="text-right py-3 px-2">Revenue</th>
                    <th className="text-right py-3 px-2">Payout</th>
                    <th className="text-right py-3 px-2">Expenses</th>
                    <th className="text-right py-3 px-2">Profit</th>
                    <th className="text-right py-3 px-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {pastPeriods
                    .filter(p => (p.totalSessions && parseFloat(p.totalSessions) > 0) || (p.totalRevenue && p.totalRevenue > 0))
                    .slice(0, 12)
                    .map((period) => (
                    <tr key={period.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        {new Date(period.weekEnding).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="text-right py-3 px-2">
                        {parseFloat(period.totalSessions || "0").toFixed(1)}
                      </td>
                      <td className="text-right py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          parseFloat(period.utilizationRate || "0") >= 0.8 
                            ? 'bg-emerald-100 text-emerald-700'
                            : parseFloat(period.utilizationRate || "0") >= 0.6
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {formatPercent(parseFloat(period.utilizationRate || "0"))}
                        </span>
                      </td>
                      <td className="text-right py-3 px-2 font-medium">
                        {formatCurrency(period.totalRevenue)}
                      </td>
                      <td className="text-right py-3 px-2">
                        {formatCurrency(period.totalPayout)}
                      </td>
                      <td className="text-right py-3 px-2">
                        {formatCurrency(period.totalExpenses)}
                      </td>
                      <td className={`text-right py-3 px-2 font-medium ${
                        (period.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(period.netProfit)}
                      </td>
                      <td className="text-right py-3 px-2">
                        {formatPercent(parseFloat(period.profitMargin || "0"))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link href="/dashboard">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium">KPI Dashboard</p>
                  <p className="text-xs text-muted-foreground">Weekly metrics</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/payroll">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <DollarSign className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-medium">Payroll</p>
                  <p className="text-xs text-muted-foreground">Trainer pay</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/trainers">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <Target className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="font-medium">Trainers</p>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/members">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <TrendingUp className="h-6 w-6 text-amber-500" />
                <div>
                  <p className="font-medium">Members</p>
                  <p className="text-xs text-muted-foreground">221 total</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
