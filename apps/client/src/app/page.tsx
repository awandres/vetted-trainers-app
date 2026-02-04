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
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import Image from "next/image";

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
  notes: string | null;
}

interface SessionStats {
  total: number;
  thisMonth: number;
  lastSession: string | null;
}

interface UpcomingSession {
  id: string;
  date: string;
  time: string;
  type: string;
  trainerName: string;
}

export default function MemberDashboard() {
  const { user, member, isLoading: authLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!member) {
        setIsLoading(false);
        return;
      }

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
          
          // For now, generate some mock upcoming sessions
          // In a real app, this would come from a scheduling system
          const today = new Date();
          const mockUpcoming: UpcomingSession[] = [
            {
              id: "upcoming-1",
              date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              time: "10:00 AM",
              type: "Personal Training",
              trainerName: member.trainerName || "Your Trainer",
            },
            {
              id: "upcoming-2", 
              date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              time: "2:00 PM",
              type: "Personal Training",
              trainerName: member.trainerName || "Your Trainer",
            },
          ];
          setUpcomingSessions(mockUpcoming);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user, member]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login via AuthProvider
  }

  // If user is logged in but no member profile is linked
  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Image
          src="/images/vt/VT_Logo_white.png"
          alt="Vetted Trainers Logo"
          width={100}
          height={100}
          className="mx-auto mb-6"
        />
        <Card className="w-full max-w-md bg-[#353840] border-[#454850]">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-white">Account Setup Incomplete</CardTitle>
            <CardDescription className="text-gray-400">
              Your user account is not yet linked to a member profile. Please contact your trainer or administrator to complete your setup.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Welcome back, {member.firstName}!
        </h1>
        <p className="text-gray-400">
          Here's an overview of your training progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3b82f6]/10 p-2">
                <Calendar className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <div>
                <CardDescription className="text-gray-400">Sessions This Month</CardDescription>
                <CardTitle className="text-2xl text-white">
                  {sessionStats?.thisMonth ?? 0}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Dumbbell className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardDescription className="text-gray-400">Active Prescriptions</CardDescription>
                <CardTitle className="text-2xl text-white">
                  {prescriptions.length}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardDescription className="text-gray-400">Total Sessions</CardDescription>
                <CardTitle className="text-2xl text-white">
                  {sessionStats?.total ?? 0}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <User className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardDescription className="text-gray-400">Your Trainer</CardDescription>
                <CardTitle className="text-lg text-white">
                  {member.trainerName || "Not assigned"}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card className="bg-[#353840] border-[#454850] mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <CalendarClock className="h-5 w-5 text-[#3b82f6]" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription className="text-gray-400">Your scheduled training sessions</CardDescription>
            </div>
            <Link href="/sessions">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-[#454850] bg-[#2a2d36] hover:bg-[#3a3d46] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-[#3b82f6]/10 p-3">
                        <Clock className="h-5 w-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{formatFullDate(session.date)}</p>
                        <p className="text-sm text-gray-400">
                          {session.time} • {session.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          with {session.trainerName}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Prescriptions */}
        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Dumbbell className="h-5 w-5" />
                Your Prescriptions
              </CardTitle>
              <CardDescription className="text-gray-400">Exercise routines from your trainer</CardDescription>
            </div>
            <Link href="/prescriptions">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
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
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#454850] hover:bg-[#2a2d36] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-[#3b82f6]/10 p-2">
                          <Dumbbell className="h-4 w-4 text-[#3b82f6]" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {prescription.name || "Exercise Prescription"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {prescription.exerciseCount} exercises • {formatDate(prescription.sentAt)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={prescription.status === "viewed" ? "secondary" : "default"}
                        className={prescription.status === "viewed" 
                          ? "bg-gray-600 text-gray-200" 
                          : "bg-[#3b82f6] text-white"
                        }
                      >
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
        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5" />
                Session History
              </CardTitle>
              <CardDescription className="text-gray-400">Your recent training sessions</CardDescription>
            </div>
            <Link href="/sessions">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No sessions recorded yet</p>
                <p className="text-sm mt-1">Your training history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#454850] hover:bg-[#2a2d36] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-500/10 p-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{formatDate(session.visitDate)}</p>
                          <p className="text-sm text-gray-400">
                            {session.sessionType || "Training"} with {session.trainerName || "Trainer"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
