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
  Progress,
} from "@vt/ui";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Dumbbell,
  Loader2,
  Flame,
  Zap,
  Star,
} from "lucide-react";

export default function ProgressPage() {
  const { member, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalSessions: 0,
    thisMonth: 0,
    prescriptionsCompleted: 0,
    streak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const sessionsRes = await fetch("/api/sessions", { credentials: "include" });
        const prescriptionsRes = await fetch("/api/prescriptions", { credentials: "include" });

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setStats((prev) => ({
            ...prev,
            totalSessions: data.stats?.total || 0,
            thisMonth: data.stats?.thisMonth || 0,
          }));
        }

        if (prescriptionsRes.ok) {
          const data = await prescriptionsRes.json();
          const viewedCount = (data.prescriptions || []).filter(
            (p: { status: string }) => p.status === "viewed"
          ).length;
          setStats((prev) => ({
            ...prev,
            prescriptionsCompleted: viewedCount,
          }));
        }

        // Calculate a simple "streak" based on consistency (mock for now)
        // In a real app, you'd calculate this from actual visit dates
        setStats((prev) => ({
          ...prev,
          streak: Math.min(prev.thisMonth * 2, 30), // Simple mock
        }));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (member) {
      fetchStats();
    }
  }, [member]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate mock goals/achievements
  const monthlyGoal = 12; // Example: 12 sessions per month
  const monthlyProgress = Math.min((stats.thisMonth / monthlyGoal) * 100, 100);

  const achievements = [
    {
      id: "first-session",
      title: "First Steps",
      description: "Complete your first training session",
      icon: Dumbbell,
      unlocked: stats.totalSessions >= 1,
    },
    {
      id: "10-sessions",
      title: "Dedicated",
      description: "Complete 10 training sessions",
      icon: Target,
      unlocked: stats.totalSessions >= 10,
    },
    {
      id: "25-sessions",
      title: "Committed",
      description: "Complete 25 training sessions",
      icon: Flame,
      unlocked: stats.totalSessions >= 25,
    },
    {
      id: "50-sessions",
      title: "Fitness Warrior",
      description: "Complete 50 training sessions",
      icon: Award,
      unlocked: stats.totalSessions >= 50,
    },
    {
      id: "prescription-viewer",
      title: "Student",
      description: "View your first prescription",
      icon: Star,
      unlocked: stats.prescriptionsCompleted >= 1,
    },
    {
      id: "consistent",
      title: "Consistency King",
      description: "Train 8+ times in a month",
      icon: Zap,
      unlocked: stats.thisMonth >= 8,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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
                <TrendingUp className="h-5 w-5" />
                My Progress
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your fitness journey
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Sessions</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalSessions}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>This Month</CardDescription>
                  <CardTitle className="text-3xl">{stats.thisMonth}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Prescriptions Viewed</CardDescription>
                  <CardTitle className="text-3xl">{stats.prescriptionsCompleted}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Activity Score
                  </CardDescription>
                  <CardTitle className="text-3xl">{stats.streak}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Monthly Goal */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Monthly Goal
                    </CardTitle>
                    <CardDescription>
                      {stats.thisMonth} of {monthlyGoal} sessions this month
                    </CardDescription>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(monthlyProgress)}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={monthlyProgress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {monthlyGoal - stats.thisMonth > 0
                    ? `${monthlyGoal - stats.thisMonth} more sessions to reach your goal!`
                    : "🎉 You've reached your monthly goal!"}
                </p>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                    <CardDescription>
                      {unlockedCount} of {achievements.length} unlocked
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div
                        key={achievement.id}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all
                          ${achievement.unlocked
                            ? "border-primary bg-primary/5"
                            : "border-muted bg-muted/30 opacity-60"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                              rounded-full p-2
                              ${achievement.unlocked ? "bg-primary/10" : "bg-muted"}
                            `}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                achievement.unlocked ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <div className="absolute top-2 right-2 text-lg">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Motivational Footer */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Keep up the great work! Every session brings you closer to your goals. 💪
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
