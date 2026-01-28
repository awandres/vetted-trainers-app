"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from "@vt/ui";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  User,
  Users,
  Dumbbell,
  Activity,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Types
interface Session {
  id: string;
  sessionDate: string;
  sessionType: string;
  sessionValue: string;
  priceCharged: number | null;
  notes: string | null;
  trainer: { id: string; firstName: string; lastName: string } | null;
  member: { id: string; firstName: string; lastName: string } | null;
}

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  pricePerSession: number | null;
  trainer: { id: string; firstName: string; lastName: string } | null;
}

// Session type labels
const SESSION_TYPES: Record<string, string> = {
  in_gym: "In-Gym Session",
  ninety_minute: "90-Minute Session",
  release: "Release Session",
  strength_assessment: "Strength Assessment",
  damage_assessment: "DA Session",
  member_journey: "Member Journey",
};

// Add Session Dialog
function AddSessionDialog({
  trainers,
  members,
  onSessionCreated,
}: {
  trainers: Trainer[];
  members: Member[];
  onSessionCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  
  const [form, setForm] = useState({
    trainerId: "",
    memberId: "",
    sessionDate: today,
    sessionType: "in_gym",
    sessionValue: "1.0",
    notes: "",
  });

  // Filter members by selected trainer
  const filteredMembers = form.trainerId
    ? members.filter((m) => m.trainer?.id === form.trainerId || !m.trainer)
    : members;

  // Get member's default price
  const selectedMember = members.find((m) => m.id === form.memberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: form.trainerId,
          memberId: form.memberId || null,
          sessionDate: form.sessionDate,
          sessionType: form.sessionType,
          sessionValue: form.sessionValue,
          priceCharged: selectedMember?.pricePerSession
            ? selectedMember.pricePerSession / 100
            : null,
          notes: form.notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to log session");
      }

      // Reset form
      setForm({
        trainerId: "",
        memberId: "",
        sessionDate: today,
        sessionType: "in_gym",
        sessionValue: "1.0",
        notes: "",
      });
      setOpen(false);
      onSessionCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Log Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Training Session</DialogTitle>
            <DialogDescription>
              Record a training session for payroll and member tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionDate">Date *</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={form.sessionDate}
                  onChange={(e) =>
                    setForm({ ...form, sessionDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type</Label>
                <Select
                  value={form.sessionType}
                  onValueChange={(v) => setForm({ ...form, sessionType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SESSION_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainerId">Trainer *</Label>
              <Select
                value={form.trainerId}
                onValueChange={(v) =>
                  setForm({ ...form, trainerId: v, memberId: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trainer" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberId">Member</Label>
              <Select
                value={form.memberId || "none"}
                onValueChange={(v) => setForm({ ...form, memberId: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Member (Walk-in)</SelectItem>
                  {filteredMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                      {m.pricePerSession && (
                        <span className="text-muted-foreground ml-2">
                          (${(m.pricePerSession / 100).toFixed(0)}/session)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionValue">Session Value</Label>
                <Select
                  value={form.sessionValue}
                  onValueChange={(v) => setForm({ ...form, sessionValue: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 (Half Session)</SelectItem>
                    <SelectItem value="1.0">1.0 (Standard)</SelectItem>
                    <SelectItem value="1.5">1.5 (90-Min Session)</SelectItem>
                    <SelectItem value="2.0">2.0 (Double)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center">
                  {selectedMember?.pricePerSession
                    ? `$${(selectedMember.pricePerSession / 100).toFixed(2)}`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes about this session..."
                rows={2}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.trainerId}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Logging...
                </>
              ) : (
                "Log Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Quick Log Button Component
function QuickLogButton({
  trainer,
  member,
  onSessionCreated,
}: {
  trainer: Trainer;
  member: Member;
  onSessionCreated: () => void;
}) {
  const [isLogging, setIsLogging] = useState(false);

  const handleQuickLog = async () => {
    setIsLogging(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: trainer.id,
          memberId: member.id,
          sessionDate: today,
          sessionType: "in_gym",
          sessionValue: "1.0",
          priceCharged: member.pricePerSession
            ? member.pricePerSession / 100
            : null,
        }),
      });
      onSessionCreated();
    } catch (err) {
      console.error("Quick log failed:", err);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleQuickLog}
      disabled={isLogging}
    >
      {isLogging ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </Button>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(cents: number | null): string {
  if (cents === null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function getWeekDates(weekOffset: number = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + weekOffset * 7);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return {
    start: startOfWeek.toISOString().split("T")[0],
    end: endOfWeek.toISOString().split("T")[0],
  };
}

// Generate list of past weeks for dropdown
function getPastWeeks(count: number = 12) {
  const weeks = [];
  for (let i = -1; i >= -count; i--) {
    const dates = getWeekDates(i);
    weeks.push({
      offset: i,
      start: dates.start,
      end: dates.end,
      label: `${new Date(dates.start + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(dates.end + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    });
  }
  return weeks;
}

// Weekly summary type
interface WeeklySummary {
  weekEnding: string;
  weekStart: string;
  sessions: number;
  revenue: number;
  uniqueMembers: number;
}

export default function VisitsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Default to previous week (most recent with data)
  const [weekOffset, setWeekOffset] = useState(-1);
  const [selectedTrainer, setSelectedTrainer] = useState<string>("all");
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [showOverview, setShowOverview] = useState(false);

  const weekDates = getWeekDates(weekOffset);
  const pastWeeks = getPastWeeks(12);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sessionsRes, trainersRes, membersRes] = await Promise.all([
        fetch(
          `/api/sessions?startDate=${weekDates.start}&endDate=${weekDates.end}${
            selectedTrainer !== "all" ? `&trainerId=${selectedTrainer}` : ""
          }`
        ),
        fetch("/api/trainers"),
        fetch("/api/members"),
      ]);

      const sessionsData = await sessionsRes.json();
      const trainersData = await trainersRes.json();
      const membersData = await membersRes.json();

      setSessions(sessionsData.sessions || []);
      setTrainers(trainersData.trainers || []);
      setMembers(membersData.members || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weekly summaries for overview
  const fetchWeeklySummaries = async () => {
    try {
      const summaries: WeeklySummary[] = [];
      // Fetch last 12 weeks
      for (const week of pastWeeks) {
        const res = await fetch(`/api/sessions?startDate=${week.start}&endDate=${week.end}&limit=500`);
        const data = await res.json();
        const weekSessions = data.sessions || [];
        
        const uniqueMembers = new Set(weekSessions.map((s: Session) => s.member?.id).filter(Boolean));
        const totalRevenue = weekSessions.reduce((sum: number, s: Session) => sum + (s.priceCharged || 0), 0);
        const totalSessions = weekSessions.reduce((sum: number, s: Session) => sum + parseFloat(s.sessionValue), 0);
        
        summaries.push({
          weekStart: week.start,
          weekEnding: week.end,
          sessions: totalSessions,
          revenue: totalRevenue,
          uniqueMembers: uniqueMembers.size,
        });
      }
      setWeeklySummaries(summaries);
    } catch (err) {
      console.error("Error fetching weekly summaries:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weekOffset, selectedTrainer]);

  useEffect(() => {
    if (showOverview && weeklySummaries.length === 0) {
      fetchWeeklySummaries();
    }
  }, [showOverview]);

  // Calculate stats
  const totalSessions = sessions.reduce(
    (sum, s) => sum + parseFloat(s.sessionValue),
    0
  );
  const totalRevenue = sessions.reduce(
    (sum, s) => sum + (s.priceCharged || 0),
    0
  );

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.sessionDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  // Get week label
  const startDate = new Date(weekDates.start + "T12:00:00");
  const endDate = new Date(weekDates.end + "T12:00:00");
  const weekLabel = `${startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Sessions & Visits</h1>
              <p className="text-muted-foreground">
                Log training sessions and track member attendance
              </p>
            </div>
          </div>
          <AddSessionDialog
            trainers={trainers}
            members={members}
            onSessionCreated={fetchData}
          />
        </div>

        {/* Week Navigation */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekOffset((w) => w - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekOffset((w) => w + 1)}
                  disabled={weekOffset >= 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Week Selector Dropdown */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Select
                  value={weekOffset.toString()}
                  onValueChange={(value) => setWeekOffset(parseInt(value))}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      This Week (Current)
                    </SelectItem>
                    {pastWeeks.map((week) => (
                      <SelectItem key={week.offset} value={week.offset.toString()}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {weekOffset !== -1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWeekOffset(-1)}
                  >
                    Latest
                  </Button>
                )}
              </div>

              {/* Overview Toggle */}
              <Button
                variant={showOverview ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOverview(!showOverview)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showOverview ? "Hide Overview" : "Show Overview"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview Table */}
        {showOverview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sessions Overview (Last 12 Weeks)
              </CardTitle>
              <CardDescription>
                Click on a week to view its sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklySummaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading weekly data...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Unique Members</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg/Session</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklySummaries.map((summary, idx) => {
                      const avgPerSession = summary.sessions > 0 
                        ? summary.revenue / summary.sessions 
                        : 0;
                      const isCurrentSelection = pastWeeks[idx]?.offset === weekOffset;
                      
                      return (
                        <TableRow 
                          key={summary.weekEnding}
                          className={isCurrentSelection ? "bg-muted" : "hover:bg-muted/50 cursor-pointer"}
                          onClick={() => setWeekOffset(pastWeeks[idx]?.offset || -1)}
                        >
                          <TableCell className="font-medium">
                            {new Date(summary.weekStart + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(summary.weekEnding + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {isCurrentSelection && (
                              <Badge variant="secondary" className="ml-2">Selected</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {summary.sessions.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            {summary.uniqueMembers}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(summary.revenue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(avgPerSession)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setWeekOffset(pastWeeks[idx]?.offset || -1);
                                setShowOverview(false);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(sessions.filter((s) => s.member).map((s) => s.member!.id)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Trained this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalRevenue / 100).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From sessions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg per Session
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.length > 0
                  ? formatPrice(Math.round(totalRevenue / sessions.length))
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                Session price
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Filter by Trainer:</Label>
              <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Trainers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trainers</SelectItem>
                  {trainers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Sessions ({sessions.length})
            </CardTitle>
            <CardDescription>
              All training sessions for the selected week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No sessions recorded</p>
                <p className="text-muted-foreground">
                  Log a session to get started tracking attendance
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(sessionsByDate)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dateSessions]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{formatDate(date)}</h3>
                        <Badge variant="secondary">
                          {dateSessions.length} session
                          {dateSessions.length !== 1 && "s"}
                        </Badge>
                      </div>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead>Trainer</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dateSessions.map((session) => (
                              <TableRow key={session.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {session.member ? (
                                      <span>
                                        {session.member.firstName}{" "}
                                        {session.member.lastName}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        Walk-in
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {session.trainer ? (
                                    <span>
                                      {session.trainer.firstName}{" "}
                                      {session.trainer.lastName}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {SESSION_TYPES[session.sessionType] ||
                                      session.sessionType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">
                                    {session.sessionValue}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {formatPrice(session.priceCharged)}
                                </TableCell>
                                <TableCell>
                                  {session.notes ? (
                                    <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block">
                                      {session.notes}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
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
