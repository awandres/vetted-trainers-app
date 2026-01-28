"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@vt/ui";
import { useAuth } from "@/components/AuthProvider";

interface Session {
  id: string;
  sessionDate: string;
  sessionType: string;
  sessionValue: number;
  priceCharged: number | null;
  notes: string | null;
  memberFirstName: string;
  memberLastName: string;
  memberId: string;
}

interface WeekStats {
  totalSessions: number;
  totalRevenue: number;
  uniqueClients: number;
}

export default function MySessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate week range
  const getWeekRange = (offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek + (offset * 7));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getWeekRange(weekOffset);
  
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const start = startDate.toLocaleDateString("en-US", options);
    const end = endDate.toLocaleDateString("en-US", { ...options, year: "numeric" });
    return `${start} - ${end}`;
  };

  const isCurrentWeek = weekOffset === 0;

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];
        
        const res = await fetch(
          `/api/trainers/my-sessions?startDate=${startStr}&endDate=${endStr}&limit=100`
        );
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, [weekOffset]);

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.sessionDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  // Sort dates
  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate week stats
  const weekStats: WeekStats = {
    totalSessions: sessions.reduce((sum, s) => sum + s.sessionValue, 0),
    totalRevenue: sessions.reduce((sum, s) => sum + (s.priceCharged || 0), 0),
    uniqueClients: new Set(sessions.map(s => s.memberId)).size,
  };

  // Generate week days for calendar view
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDays.push(date);
  }

  const formatDayHeader = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    const isToday = date.toDateString() === new Date().toDateString();
    return { dayName, dayNum, isToday };
  };

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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              My Sessions
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your training sessions
            </p>
          </div>
          <Link href="/visits">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Log New Session
            </Button>
          </Link>
        </div>

        {/* Week Navigator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(weekOffset - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <p className="font-semibold">{formatDateRange()}</p>
              <p className="text-xs text-muted-foreground">
                {isCurrentWeek ? "This Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)} weeks ${weekOffset < 0 ? "ago" : "from now"}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {!isCurrentWeek && (
            <Button variant="outline" onClick={() => setWeekOffset(0)}>
              Today
            </Button>
          )}
        </div>

        {/* Week Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold text-green-600">{weekStats.totalSessions}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${(weekStats.totalRevenue / 100).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clients Trained</p>
                  <p className="text-2xl font-bold">{weekStats.uniqueClients}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week Calendar View */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Week Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const { dayName, dayNum, isToday } = formatDayHeader(date);
                const dateStr = date.toISOString().split("T")[0];
                const daySessions = sessionsByDate[dateStr] || [];
                const sessionCount = daySessions.reduce((sum, s) => sum + s.sessionValue, 0);
                
                return (
                  <div
                    key={dateStr}
                    className={`text-center p-3 rounded-lg border ${
                      isToday 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">{dayName}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>
                      {dayNum}
                    </p>
                    {sessionCount > 0 ? (
                      <div className="mt-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white text-xs font-medium">
                          {sessionCount}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 h-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Session Details</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No sessions this week</p>
                <p className="text-sm mt-1">
                  Log a session to start tracking
                </p>
                <Link href="/visits" className="inline-block mt-4">
                  <Button>Log Session</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map((date) => (
              <div key={date}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                <Card>
                  <CardContent className="p-0 divide-y">
                    {sessionsByDate[date].map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <Link 
                              href={`/members/${session.memberId}`}
                              className="font-medium hover:text-primary"
                            >
                              {session.memberFirstName} {session.memberLastName}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {session.sessionType}
                              {session.notes && ` · ${session.notes.slice(0, 50)}${session.notes.length > 50 ? "..." : ""}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {session.sessionValue} session{session.sessionValue !== 1 ? "s" : ""}
                          </p>
                          {session.priceCharged && (
                            <p className="text-sm text-muted-foreground">
                              ${(session.priceCharged / 100).toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
