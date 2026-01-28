"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@vt/ui";
import {
  Calendar,
  Dumbbell,
  TrendingUp,
  User,
  ChevronRight,
  Clock,
  CheckCircle,
  FileText,
  Loader2,
  LogOut,
} from "lucide-react";

// Types
interface Prescription {
  id: string;
  name: string | null;
  status: string;
  sentAt: string | null;
  exerciseCount: number;
}

interface Session {
  id: string;
  visitDate: string | null;
  sessionType: string | null;
  trainerName: string | null;
}

interface SessionStats {
  total: number;
  thisMonth: number;
  lastSession: string | null;
}

export default function MemberDashboard() {
  const { user, member, isLoading: authLoading, signOut } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!member) return;

      try {
        const [prescriptionsRes, sessionsRes] = await Promise.all([
          fetch("/api/prescriptions", { credentials: "include" }),
          fetch("/api/sessions", { credentials: "include" }),
        ]);

        if (prescriptionsRes.ok) {
          const data = await prescriptionsRes.json();
          setPrescriptions(data.prescriptions || []);
        }

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions || []);
          setSessionStats(data.stats || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (member) {
      fetchData();
    }
  }, [member]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !member) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Vetted Trainers</h1>
              <p className="text-sm text-muted-foreground">Member Portal</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {member.firstName}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your training progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardDescription>Sessions This Month</CardDescription>
                  <CardTitle className="text-2xl">
                    {sessionStats?.thisMonth ?? 0}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Dumbbell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardDescription>Active Prescriptions</CardDescription>
                  <CardTitle className="text-2xl">
                    {prescriptions.length}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardDescription>Total Sessions</CardDescription>
                  <CardTitle className="text-2xl">
                    {sessionStats?.total ?? 0}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardDescription>Your Trainer</CardDescription>
                  <CardTitle className="text-lg">
                    {member.trainerName || "Not assigned"}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Your Prescriptions
                </CardTitle>
                <CardDescription>Exercise routines from your trainer</CardDescription>
              </div>
              <Link href="/prescriptions">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No prescriptions yet</p>
                  <p className="text-sm mt-1">Your trainer will send you exercise plans here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.slice(0, 3).map((prescription) => (
                    <Link
                      key={prescription.id}
                      href={`/prescriptions/${prescription.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Dumbbell className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {prescription.name || "Exercise Prescription"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {prescription.exerciseCount} exercises • {formatDate(prescription.sentAt)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={prescription.status === "viewed" ? "secondary" : "default"}>
                          {prescription.status === "viewed" ? "Viewed" : "New"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Session History
                </CardTitle>
                <CardDescription>Your recent training sessions</CardDescription>
              </div>
              <Link href="/sessions">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No sessions recorded yet</p>
                  <p className="text-sm mt-1">Your training history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-500/10 p-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{formatDate(session.visitDate)}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.sessionType || "Training"} with {session.trainerName || "Trainer"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/prescriptions">
              <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Dumbbell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>My Exercises</CardTitle>
                      <CardDescription>View your workout prescriptions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/sessions">
              <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Session History</CardTitle>
                      <CardDescription>View your past sessions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/progress">
              <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>My Progress</CardTitle>
                      <CardDescription>Track your fitness journey</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
