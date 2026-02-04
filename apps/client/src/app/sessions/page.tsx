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
  CheckCircle,
  Loader2,
  TrendingUp,
  Clock,
  User,
  Dumbbell,
  ChevronRight,
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

  const getSessionTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      in_gym: "In-Gym Training",
      ninety_minute: "90-Minute Session",
      release: "Release Session",
      strength_assessment: "Strength Assessment",
      damage_assessment: "Damage Assessment",
      member_journey: "Member Journey",
    };
    return type ? labels[type] || type : "Training";
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
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Calendar className="h-8 w-8 text-[#3b82f6]" />
          Session History
        </h1>
        <p className="text-gray-400 mt-1">
          Your training session records
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3b82f6]/10 p-2">
                <Calendar className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <div>
                <CardDescription className="text-gray-400">This Month</CardDescription>
                <CardTitle className="text-2xl text-white">
                  {stats?.thisMonth ?? 0} sessions
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardDescription className="text-gray-400">All Time</CardDescription>
                <CardTitle className="text-2xl text-white">
                  {stats?.total ?? 0} sessions
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardDescription className="text-gray-400">Last Session</CardDescription>
                <CardTitle className="text-lg text-white">
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
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="bg-[#353840] border-[#454850]">
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">No sessions yet</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Your training sessions will appear here once you start working
              with your trainer.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-6 border-[#454850] text-gray-300 hover:bg-[#2a2d36]">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, { label, sessions: monthSessions }]) => (
              <div key={monthKey}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  {label}
                  <Badge variant="secondary" className="ml-2 bg-[#454850] text-gray-300">
                    {monthSessions.length} session{monthSessions.length !== 1 ? "s" : ""}
                  </Badge>
                </h3>
                <div className="space-y-3">
                  {monthSessions.map((session) => (
                    <Link key={session.id} href={`/sessions/${session.id}`}>
                      <Card className="bg-[#353840] border-[#454850] hover:bg-[#3a3d46] transition-colors cursor-pointer">
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-500/10 p-3 flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white">
                                {formatDate(session.visitDate)}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Dumbbell className="h-4 w-4" />
                                  {getSessionTypeLabel(session.sessionType)}
                                </span>
                                {session.trainerName && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {session.trainerName}
                                  </span>
                                )}
                              </div>
                              {session.notes && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                  {session.notes}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
