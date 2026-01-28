import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardDescription } from "@vt/ui";
import { Calendar, Dumbbell, TrendingUp, User } from "lucide-react";

export default function MemberDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Vetted Trainers</h1>
              <p className="text-sm text-muted-foreground">Member Portal</p>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's an overview of your training progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardDescription>Next Session</CardDescription>
                  <CardTitle className="text-lg">Tomorrow, 9 AM</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardDescription>Sessions This Month</CardDescription>
                  <CardTitle className="text-lg">8 of 12</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardDescription>Active Streak</CardDescription>
                  <CardTitle className="text-lg">14 days</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardDescription>Your Trainer</CardDescription>
                  <CardTitle className="text-lg">John Smith</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/sessions">
            <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Sessions</CardTitle>
                    <CardDescription>View and book training sessions</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/exercises">
            <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>My Exercises</CardTitle>
                    <CardDescription>View your prescribed exercises</CardDescription>
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
                    <CardTitle>Progress</CardTitle>
                    <CardDescription>Track your fitness journey</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
