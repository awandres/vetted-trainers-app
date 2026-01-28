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
  ArrowLeft,
  Calendar,
  CheckCircle,
  Loader2,
  TrendingUp,
  Clock,
  User,
  Dumbbell,
} from "lucide-react";

// Types
interface Session {
  id: string;
  visitDate: string | null;
  sessionType: string | null;
  notes: string | null;
  trainerName: string | null;
}

interface SessionStats {
  total: number;
  thisMonth: number;
  lastSession: string | null;
}

export default function SessionsPage() {
  const { member, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
          setStats(data.stats || null);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (member) {
      fetchSessions();
    }
  }, [member]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Group sessions by month
  const groupedSessions = sessions.reduce((acc, session) => {
    if (!session.visitDate) return acc;
    const date = new Date(session.visitDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, sessions: [] };
    }
    acc[monthKey].sessions.push(session);
    return acc;
  }, {} as Record<string, { label: string; sessions: Session[] }>);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session History
              </h1>
              <p className="text-sm text-muted-foreground">
                Your training session records
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardDescription>This Month</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats?.thisMonth ?? 0} sessions
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardDescription>All Time</CardDescription>
                  <CardTitle className="text-2xl">
                    {stats?.total ?? 0} sessions
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardDescription>Last Session</CardDescription>
                  <CardTitle className="text-lg">
                    {stats?.lastSession ? formatShortDate(stats.lastSession) : "—"}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No sessions yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your training sessions will appear here once you start working
              with your trainer.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSessions)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([monthKey, { label, sessions: monthSessions }]) => (
                <div key={monthKey}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    {label}
                    <Badge variant="secondary" className="ml-2">
                      {monthSessions.length} session{monthSessions.length !== 1 ? "s" : ""}
                    </Badge>
                  </h3>
                  <div className="space-y-3">
                    {monthSessions.map((session) => (
                      <Card key={session.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-500/10 p-3 flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">
                                {formatDate(session.visitDate)}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Dumbbell className="h-4 w-4" />
                                  {session.sessionType || "Training"}
                                </span>
                                {session.trainerName && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {session.trainerName}
                                  </span>
                                )}
                              </div>
                              {session.notes && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {session.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
