"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
    Separator,
    Progress,
} from "@vt/ui";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    DollarSign,
    Users,
    Activity,
    TrendingUp,
    Calendar,
    Edit,
    Save,
    X,
    AlertTriangle,
    CheckCircle,
    Clock,
    Target,
} from "lucide-react";

// Types
interface Trainer {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    sessionRate: number;
    nonSessionRate: number;
    isActive: boolean;
    bio: string | null;
    goalSessions: number | null;
    lastRaiseDate: string | null;
    createdAt: string;
}

interface Member {
    id: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    lastVisitDate: string | null;
    daysSinceVisit: number | null;
    pricePerSession: number | null;
}

interface Session {
    id: string;
    sessionDate: string;
    sessionType: string;
    sessionValue: string;
    priceCharged: number | null;
    memberId: string | null;
    memberFirstName: string | null;
    memberLastName: string | null;
}

interface TrainerMetric {
    id: string;
    weekEnding: string;
    activeMembers: number | null;
    totalSessions: string | null;
    earnings: number | null;
}

// Helper functions
function formatCurrency(cents: number | null): string {
    if (cents === null || cents === 0) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: "bg-green-500/10 text-green-600 border-green-500/30",
        inactive: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        churned: "bg-red-500/10 text-red-600 border-red-500/30",
        paused: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    };

    return (
        <Badge variant="outline" className={styles[status as keyof typeof styles] || ""}>
            {status}
        </Badge>
    );
}

export default function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [memberStats, setMemberStats] = useState({ total: 0, active: 0, inactive: 0, churned: 0, paused: 0 });
    const [recentSessions, setRecentSessions] = useState<Session[]>([]);
    const [sessionStats, setSessionStats] = useState({ last30Days: 0, totalRevenue: 0 });
    const [retentionRate, setRetentionRate] = useState(0);
    const [avgPrice, setAvgPrice] = useState(0);
    const [metrics, setMetrics] = useState<TrainerMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        sessionRate: "",
        nonSessionRate: "",
        goalSessions: "",
        bio: "",
    });

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/trainers/${resolvedParams.id}`);
                if (res.status === 404) throw new Error("Trainer not found");
                if (!res.ok) throw new Error("Failed to fetch trainer");

                const data = await res.json();
                setTrainer(data.trainer);
                setMembers(data.members || []);
                setMemberStats(data.memberStats || { total: 0, active: 0, inactive: 0, churned: 0, paused: 0 });
                setRecentSessions(data.recentSessions || []);
                setSessionStats(data.sessionStats || { last30Days: 0, totalRevenue: 0 });
                setRetentionRate(data.retentionRate || 0);
                setAvgPrice(data.avgPricePerSession || 0);
                setMetrics(data.metrics || []);

                // Initialize edit form
                const t = data.trainer;
                setEditForm({
                    firstName: t.firstName || "",
                    lastName: t.lastName || "",
                    email: t.email || "",
                    phone: t.phone || "",
                    sessionRate: t.sessionRate ? (t.sessionRate / 100).toFixed(2) : "",
                    nonSessionRate: t.nonSessionRate ? (t.nonSessionRate / 100).toFixed(2) : "",
                    goalSessions: t.goalSessions?.toString() || "",
                    bio: t.bio || "",
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [resolvedParams.id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/trainers/${resolvedParams.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    email: editForm.email || null,
                    phone: editForm.phone || null,
                    sessionRate: editForm.sessionRate ? parseFloat(editForm.sessionRate) : null,
                    nonSessionRate: editForm.nonSessionRate ? parseFloat(editForm.nonSessionRate) : null,
                    goalSessions: editForm.goalSessions ? parseInt(editForm.goalSessions) : null,
                    bio: editForm.bio || null,
                }),
            });

            if (!response.ok) throw new Error("Failed to save changes");

            // Refresh trainer data
            const res = await fetch(`/api/trainers/${resolvedParams.id}`);
            const data = await res.json();
            setTrainer(data.trainer);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (error || !trainer) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="container mx-auto space-y-6">
                    <Link href="/trainers">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Trainers
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4 text-destructive">
                        <AlertTriangle className="h-8 w-8" />
                        <p className="text-lg">{error || "Trainer not found"}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/trainers">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {trainer.firstName} {trainer.lastName}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Badge variant={trainer.isActive ? "default" : "secondary"}>
                                        {trainer.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Members</p>
                                    <p className="text-2xl font-bold">{memberStats.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {memberStats.active} active, {memberStats.inactive} inactive
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Retention</p>
                                    <p className="text-2xl font-bold">{formatPercent(retentionRate)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <Progress value={retentionRate * 100} className="h-2 mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sessions (30d)</p>
                                    <p className="text-2xl font-bold">{sessionStats.last30Days.toFixed(1)}</p>
                                </div>
                                <Activity className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(avgPrice)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Revenue (30d)</p>
                                    <p className="text-2xl font-bold">{formatCurrency(sessionStats.totalRevenue)}</p>
                                </div>
                                <Target className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Profile Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Contact details and rates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={editForm.firstName}
                                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={editForm.lastName}
                                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sessionRate">Session Rate ($)</Label>
                                            <Input
                                                id="sessionRate"
                                                type="number"
                                                step="0.01"
                                                value={editForm.sessionRate}
                                                onChange={(e) => setEditForm({ ...editForm, sessionRate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nonSessionRate">Non-Session Rate ($/hr)</Label>
                                            <Input
                                                id="nonSessionRate"
                                                type="number"
                                                step="0.01"
                                                value={editForm.nonSessionRate}
                                                onChange={(e) => setEditForm({ ...editForm, nonSessionRate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="goalSessions">Weekly Session Goal</Label>
                                        <Input
                                            id="goalSessions"
                                            type="number"
                                            value={editForm.goalSessions}
                                            onChange={(e) => setEditForm({ ...editForm, goalSessions: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p>{trainer.email || "Not provided"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p>{trainer.phone || "Not provided"}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Session Rate</p>
                                            <p className="text-lg font-semibold">{formatCurrency(trainer.sessionRate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Non-Session Rate</p>
                                            <p className="text-lg font-semibold">{formatCurrency(trainer.nonSessionRate)}/hr</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weekly Session Goal</p>
                                        <p className="text-lg font-semibold">{trainer.goalSessions || "—"}</p>
                                    </div>
                                    {trainer.lastRaiseDate && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Raise</p>
                                            <p>{formatDate(trainer.lastRaiseDate)}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Member Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Members</CardTitle>
                            <CardDescription>{memberStats.total} members assigned</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Status breakdown */}
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="p-3 rounded-lg bg-green-500/10">
                                        <p className="text-2xl font-bold text-green-600">{memberStats.active}</p>
                                        <p className="text-xs text-green-600">Active</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-amber-500/10">
                                        <p className="text-2xl font-bold text-amber-600">{memberStats.inactive}</p>
                                        <p className="text-xs text-amber-600">Inactive</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-500/10">
                                        <p className="text-2xl font-bold text-red-600">{memberStats.churned}</p>
                                        <p className="text-xs text-red-600">Churned</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-500/10">
                                        <p className="text-2xl font-bold text-gray-600">{memberStats.paused}</p>
                                        <p className="text-xs text-gray-600">Paused</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Member list */}
                                <div className="max-h-[300px] overflow-y-auto space-y-2">
                                    {members.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">No members assigned</p>
                                    ) : (
                                        members.slice(0, 20).map((member) => (
                                            <Link key={member.id} href={`/members/${member.id}`}>
                                                <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                                                    <div>
                                                        <p className="font-medium">
                                                            {member.firstName} {member.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {member.daysSinceVisit !== null
                                                                ? `${member.daysSinceVisit} days since visit`
                                                                : "Never visited"}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={member.status} />
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                    {members.length > 20 && (
                                        <p className="text-center text-sm text-muted-foreground">
                                            +{members.length - 20} more members
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Sessions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sessions</CardTitle>
                        <CardDescription>Last 30 days of training sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSessions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No sessions recorded in the last 30 days</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 font-medium">Date</th>
                                            <th className="text-left py-3 px-2 font-medium">Member</th>
                                            <th className="text-left py-3 px-2 font-medium">Type</th>
                                            <th className="text-right py-3 px-2 font-medium">Value</th>
                                            <th className="text-right py-3 px-2 font-medium">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSessions.slice(0, 15).map((session) => (
                                            <tr key={session.id} className="border-b hover:bg-muted/50">
                                                <td className="py-2 px-2">{formatDate(session.sessionDate)}</td>
                                                <td className="py-2 px-2">
                                                    {session.memberId ? (
                                                        <Link href={`/members/${session.memberId}`} className="hover:underline">
                                                            {session.memberFirstName} {session.memberLastName}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground">Walk-in</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Badge variant="outline">{session.sessionType}</Badge>
                                                </td>
                                                <td className="py-2 px-2 text-right">{session.sessionValue}</td>
                                                <td className="py-2 px-2 text-right font-medium">
                                                    {formatCurrency(session.priceCharged)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
