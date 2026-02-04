"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Activity,
  Calendar,
  ClipboardList,
  DollarSign,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bell,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@vt/ui";
import { useAuth } from "./AuthProvider";
import { TasksWidget } from "./TasksWidget";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  daysSinceVisit: number | null;
  lastVisitDate: string | null;
  pricePerSession: number | null;
}

interface Session {
  id: string;
  memberFirstName: string;
  memberLastName: string;
  sessionDate: string;
  sessionType: string;
  sessionValue: number;
}

interface TrainerStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  weekSessions: number;
  weekRevenue: number;
  pendingTasks: number;
}

export function TrainerDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch trainer's clients
        const clientsRes = await fetch("/api/trainers/my-clients");
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients || []);
          
          // Calculate stats from clients
          const active = data.clients?.filter((c: Client) => c.status === "active").length || 0;
          const inactive = data.clients?.filter((c: Client) => c.status === "inactive").length || 0;
          
          setStats({
            totalClients: data.clients?.length || 0,
            activeClients: active,
            inactiveClients: inactive,
            weekSessions: data.weekSessions || 0,
            weekRevenue: data.weekRevenue || 0,
            pendingTasks: data.pendingTasks || 0,
          });
        }

        // Fetch upcoming sessions
        const upcomingRes = await fetch("/api/trainers/my-sessions?type=upcoming&limit=5");
        if (upcomingRes.ok) {
          const data = await upcomingRes.json();
          setUpcomingSessions(data.sessions || []);
        }

        // Fetch recent sessions
        const sessionsRes = await fetch("/api/trainers/my-sessions?type=recent&limit=5");
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setRecentSessions(data.sessions || []);
        }
      } catch (error) {
        console.error("Error loading trainer data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500 bg-green-500/10";
      case "inactive": return "text-amber-500 bg-amber-500/10";
      case "churned": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const getDaysColor = (days: number | null) => {
    if (days === null) return "text-gray-400";
    if (days <= 7) return "text-green-500";
    if (days <= 14) return "text-amber-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Trainer"}! 👋
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with your clients today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Clients</p>
                <p className="text-3xl font-bold">{stats?.totalClients || 0}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stats?.activeClients} active · {stats?.inactiveClients} need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold text-green-600">{stats?.weekSessions || 0}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Week Revenue</p>
                <p className="text-3xl font-bold">${((stats?.weekRevenue || 0) / 100).toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              From {stats?.weekSessions || 0} sessions
            </p>
          </CardContent>
        </Card>

        <Card className={stats?.pendingTasks ? "border-amber-500/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-3xl font-bold text-amber-600">{stats?.pendingTasks || 0}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Bell className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Follow-ups & reminders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Quick Actions + Tasks */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-3">
            <Link href="/visits">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Log Session</p>
                    <p className="text-sm text-muted-foreground">Record a training visit</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/prescriptions/new">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">New Prescription</p>
                    <p className="text-sm text-muted-foreground">Create exercise plan</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/my-clients">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">View My Clients</p>
                    <p className="text-sm text-muted-foreground">Manage your client list</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/my-payroll">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">My Payroll</p>
                    <p className="text-sm text-muted-foreground">View pay & submit hours</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/my-sessions">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="rounded-lg bg-cyan-500/10 p-3">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">My Sessions</p>
                    <p className="text-sm text-muted-foreground">View session history</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
          </div>

          {/* Tasks Widget */}
          <TasksWidget />
        </div>

        {/* Right Column: Clients Needing Attention + Upcoming Sessions */}
        <div className="space-y-6">
          {/* Clients Needing Attention */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Clients Needing Attention
              </h3>
              <Link href="/my-clients?status=inactive" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                {clients.filter(c => c.status !== "active" || (c.daysSinceVisit && c.daysSinceVisit > 7)).length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>All clients are on track!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {clients
                      .filter(c => c.status !== "active" || (c.daysSinceVisit && c.daysSinceVisit > 7))
                      .slice(0, 5)
                      .map((client) => (
                        <Link
                          key={client.id}
                          href={`/members/${client.id}`}
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                              {client.firstName[0]}{client.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{client.firstName} {client.lastName}</p>
                              <p className="text-sm text-muted-foreground">
                                {client.lastVisitDate 
                                  ? `Last visit: ${new Date(client.lastVisitDate).toLocaleDateString()}`
                                  : "No visits recorded"
                                }
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                              {client.status}
                            </span>
                            {client.daysSinceVisit !== null && (
                              <p className={`text-xs mt-1 ${getDaysColor(client.daysSinceVisit)}`}>
                                {client.daysSinceVisit} days ago
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Sessions
              </h3>
              <Link href="/my-sessions" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <Card className="border-primary/20">
              <CardContent className="p-0">
                {upcomingSessions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming sessions scheduled</p>
                    <Link href="/visits" className="text-primary hover:underline text-sm mt-2 inline-block">
                      Schedule a session
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {upcomingSessions.map((session) => {
                      const sessionDate = new Date(session.sessionDate);
                      const isToday = sessionDate.toDateString() === new Date().toDateString();
                      const isTomorrow = sessionDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                      
                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isToday ? "bg-primary text-primary-foreground" : "bg-primary/10"
                            }`}>
                              <Calendar className={`h-5 w-5 ${isToday ? "" : "text-primary"}`} />
                            </div>
                            <div>
                              <p className="font-medium">{session.memberFirstName} {session.memberLastName}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.sessionType}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${isToday ? "text-primary" : ""}`}>
                              {isToday ? "Today" : isTomorrow ? "Tomorrow" : sessionDate.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.sessionValue} session{session.sessionValue !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Sessions
          </h3>
          <Link href="/my-sessions" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all sessions <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {recentSessions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent sessions</p>
                <Link href="/visits" className="text-primary hover:underline text-sm mt-2 inline-block">
                  Log your first session
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.memberFirstName} {session.memberLastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.sessionType} · {new Date(session.sessionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{session.sessionValue} session{session.sessionValue !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
