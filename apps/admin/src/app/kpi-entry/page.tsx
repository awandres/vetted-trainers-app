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
    Label,
    Badge,
    Separator,
} from "@vt/ui";
import {
    ArrowLeft,
    Save,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Calculator,
    Loader2,
    CheckCircle,
    Activity,
} from "lucide-react";

// Types
interface Trainer {
    id: string;
    firstName: string | null;
    lastName: string | null;
    sessionRate: number | null;
    nonSessionRate: number | null;
    goalSessions: number | null;
}

interface TrainerKPIEntry {
    trainerId: string;
    trainerName: string;
    inGymSessions: number;
    ninetyMinSessions: number;
    releaseSessions: number;
    releaseModifier: number;
    strengthAssessment: number;
    nonSessionHours: number;
    memberJourney: number;
    damageAssessment: number;
    notes: string;
    // Calculated
    totalSessions: number;
    totalNonSession: number;
    goalSessions: number;
    utilization: number;
}

// Session value constants (from spreadsheet)
const SESSION_VALUES = {
    inGym: 1.0,
    ninetyMin: 1.5,
    release: 1.0,
    releaseModifier: 0.5,
    strengthAssessment: 1.0,
    memberJourney: 0.5,
    damageAssessment: 1.5,
};

// Helper functions
function getWeekDates(weekEnding: string): { start: string; end: string } {
    const end = new Date(weekEnding + "T12:00:00");
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return {
        start: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        end: end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
}

function calculateTotalSessions(entry: TrainerKPIEntry): number {
    return (
        entry.inGymSessions * SESSION_VALUES.inGym +
        entry.ninetyMinSessions * SESSION_VALUES.ninetyMin +
        entry.releaseSessions * SESSION_VALUES.release +
        entry.releaseModifier * SESSION_VALUES.releaseModifier +
        entry.strengthAssessment * SESSION_VALUES.strengthAssessment
    );
}

function calculateTotalNonSession(entry: TrainerKPIEntry): number {
    return (
        entry.nonSessionHours +
        entry.memberJourney * SESSION_VALUES.memberJourney +
        entry.damageAssessment * SESSION_VALUES.damageAssessment
    );
}

function getCurrentWeekEnding(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (6 - dayOfWeek));
    return saturday.toISOString().split("T")[0];
}

function getPreviousWeekEnding(weekEnding: string): string {
    const date = new Date(weekEnding + "T12:00:00");
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
}

function getNextWeekEnding(weekEnding: string): string {
    const date = new Date(weekEnding + "T12:00:00");
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
}

export default function KPIEntryPage() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [entries, setEntries] = useState<TrainerKPIEntry[]>([]);
    const [weekEnding, setWeekEnding] = useState(getCurrentWeekEnding());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Goals for the team
    const [teamGoalSessions, setTeamGoalSessions] = useState(436);
    const [targetRevenue, setTargetRevenue] = useState(25000);
    const [fixedExpenses, setFixedExpenses] = useState(1648);

    useEffect(() => {
        fetchData();
    }, [weekEnding]);

    async function fetchData() {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch trainers
            const trainersRes = await fetch("/api/trainers");
            const trainersData = await trainersRes.json();
            const trainersList = trainersData.trainers || [];
            setTrainers(trainersList);

            // Initialize entries for each trainer
            const initialEntries: TrainerKPIEntry[] = trainersList.map((t: Trainer) => ({
                trainerId: t.id,
                trainerName: `${t.firstName || ""} ${t.lastName || ""}`.trim(),
                inGymSessions: 0,
                ninetyMinSessions: 0,
                releaseSessions: 0,
                releaseModifier: 0,
                strengthAssessment: 0,
                nonSessionHours: 0,
                memberJourney: 0,
                damageAssessment: 0,
                notes: "",
                totalSessions: 0,
                totalNonSession: 0,
                goalSessions: t.goalSessions || 30,
                utilization: 0,
            }));

            // TODO: Fetch existing KPI data for this week if available
            // For now, just use empty entries

            setEntries(initialEntries);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    function updateEntry(trainerId: string, field: keyof TrainerKPIEntry, value: number | string) {
        setEntries((prev) =>
            prev.map((entry) => {
                if (entry.trainerId !== trainerId) return entry;

                const updated = { ...entry, [field]: value };
                // Recalculate totals
                updated.totalSessions = calculateTotalSessions(updated);
                updated.totalNonSession = calculateTotalNonSession(updated);
                updated.utilization = updated.goalSessions > 0
                    ? updated.totalSessions / updated.goalSessions
                    : 0;

                return updated;
            })
        );
    }

    async function handleSave() {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            // Calculate team totals
            const teamTotalSessions = entries.reduce((sum, e) => sum + e.totalSessions, 0);
            const teamTotalNonSession = entries.reduce((sum, e) => sum + e.totalNonSession, 0);

            // Save to KPI API
            const response = await fetch("/api/kpi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weekEnding,
                    totalSessions: teamTotalSessions,
                    goalSessions: teamGoalSessions,
                    targetRevenue: targetRevenue * 100, // Convert to cents
                    fixedExpenses: fixedExpenses * 100, // Convert to cents
                    entries: entries.map((e) => ({
                        trainerId: e.trainerId,
                        totalSessions: e.totalSessions,
                        nonSessionHours: e.totalNonSession,
                        notes: e.notes,
                    })),
                }),
            });

            if (!response.ok) throw new Error("Failed to save KPI data");

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    }

    // Calculate team totals
    const teamTotals = {
        totalSessions: entries.reduce((sum, e) => sum + e.totalSessions, 0),
        totalNonSession: entries.reduce((sum, e) => sum + e.totalNonSession, 0),
        utilization: teamGoalSessions > 0
            ? entries.reduce((sum, e) => sum + e.totalSessions, 0) / teamGoalSessions
            : 0,
    };

    const weekDates = getWeekDates(weekEnding);
    const isCurrentWeek = weekEnding === getCurrentWeekEnding();
    const isFutureWeek = new Date(weekEnding + "T12:00:00") > new Date();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Weekly KPI Entry</h1>
                            <p className="text-muted-foreground">
                                Enter session production data for each trainer
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveSuccess && (
                            <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Saved
                            </Badge>
                        )}
                        <Button onClick={handleSave} disabled={isSaving || isFutureWeek}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Week
                        </Button>
                    </div>
                </div>

                {/* Week Selector */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWeekEnding(getPreviousWeekEnding(weekEnding))}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous Week
                            </Button>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="font-semibold text-lg">
                                        {weekDates.start} - {weekDates.end}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Week Ending Saturday
                                        {isCurrentWeek && (
                                            <Badge variant="secondary" className="ml-2">
                                                Current
                                            </Badge>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWeekEnding(getNextWeekEnding(weekEnding))}
                                disabled={isFutureWeek}
                            >
                                Next Week
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Goals */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Team Goals & Targets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="teamGoal">Goal Sessions</Label>
                                <Input
                                    id="teamGoal"
                                    type="number"
                                    value={teamGoalSessions}
                                    onChange={(e) => setTeamGoalSessions(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="targetRevenue">Target Revenue ($)</Label>
                                <Input
                                    id="targetRevenue"
                                    type="number"
                                    value={targetRevenue}
                                    onChange={(e) => setTargetRevenue(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fixedExpenses">Fixed Expenses ($)</Label>
                                <Input
                                    id="fixedExpenses"
                                    type="number"
                                    value={fixedExpenses}
                                    onChange={(e) => setFixedExpenses(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Summary */}
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <Activity className="h-8 w-8 mx-auto text-primary mb-2" />
                                <p className="text-3xl font-bold">{teamTotals.totalSessions.toFixed(1)}</p>
                                <p className="text-sm text-muted-foreground">Total Sessions</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <Calculator className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                                <p className="text-3xl font-bold">{(teamTotals.utilization * 100).toFixed(1)}%</p>
                                <p className="text-sm text-muted-foreground">Utilization</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold">{teamTotals.totalNonSession.toFixed(1)}</p>
                                <p className="text-sm text-muted-foreground">Non-Session Hours</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold">{entries.length}</p>
                                <p className="text-sm text-muted-foreground">Trainers</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Entry Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trainer Session Entry</CardTitle>
                        <CardDescription>
                            Enter session counts for each trainer. Totals are calculated automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-2 font-medium sticky left-0 bg-muted/50 min-w-[150px]">
                                            Trainer
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">
                                            <div>In-Gym</div>
                                            <div className="text-xs font-normal text-muted-foreground">×1.0</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">
                                            <div>90min</div>
                                            <div className="text-xs font-normal text-muted-foreground">×1.5</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">
                                            <div>Release</div>
                                            <div className="text-xs font-normal text-muted-foreground">×1.0</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">
                                            <div>Rel Mod</div>
                                            <div className="text-xs font-normal text-muted-foreground">×0.5</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">
                                            <div>Strength</div>
                                            <div className="text-xs font-normal text-muted-foreground">×1.0</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium bg-blue-50 min-w-[100px]">
                                            <div>Total Sessions</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">
                                            <div>Non-Sess</div>
                                            <div className="text-xs font-normal text-muted-foreground">hrs</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">
                                            <div>Goal</div>
                                        </th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[100px]">
                                            <div>Utilization</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry) => (
                                        <tr key={entry.trainerId} className="border-b hover:bg-muted/30">
                                            <td className="py-2 px-2 font-medium sticky left-0 bg-background">
                                                {entry.trainerName}
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.inGymSessions || ""}
                                                    onChange={(e) =>
                                                        updateEntry(entry.trainerId, "inGymSessions", parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.ninetyMinSessions || ""}
                                                    onChange={(e) =>
                                                        updateEntry(entry.trainerId, "ninetyMinSessions", parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.releaseSessions || ""}
                                                    onChange={(e) =>
                                                        updateEntry(entry.trainerId, "releaseSessions", parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.releaseModifier || ""}
                                                    onChange={(e) =>
                                                        updateEntry(entry.trainerId, "releaseModifier", parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.strengthAssessment || ""}
                                                    onChange={(e) =>
                                                        updateEntry(entry.trainerId, "strengthAssessment", parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center font-bold bg-blue-50">
                                                {entry.totalSessions.toFixed(1)}
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.5"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.nonSessionHours || ""}
                                                    onChange={(e) =>
                                                        updateEntry(entry.trainerId, "nonSessionHours", parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center text-muted-foreground">
                                                {entry.goalSessions}
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <Badge
                                                    variant={entry.utilization >= 0.9 ? "default" : entry.utilization >= 0.7 ? "secondary" : "destructive"}
                                                >
                                                    {(entry.utilization * 100).toFixed(0)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 bg-muted/30 font-bold">
                                        <td className="py-3 px-2 sticky left-0 bg-muted/30">TEAM TOTALS</td>
                                        <td className="py-3 px-2 text-center">
                                            {entries.reduce((sum, e) => sum + e.inGymSessions, 0)}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {entries.reduce((sum, e) => sum + e.ninetyMinSessions, 0)}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {entries.reduce((sum, e) => sum + e.releaseSessions, 0)}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {entries.reduce((sum, e) => sum + e.releaseModifier, 0)}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {entries.reduce((sum, e) => sum + e.strengthAssessment, 0)}
                                        </td>
                                        <td className="py-3 px-2 text-center bg-blue-100">
                                            {teamTotals.totalSessions.toFixed(1)}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {teamTotals.totalNonSession.toFixed(1)}
                                        </td>
                                        <td className="py-3 px-2 text-center">{teamGoalSessions}</td>
                                        <td className="py-3 px-2 text-center">
                                            <Badge variant={teamTotals.utilization >= 0.8 ? "default" : "secondary"}>
                                                {(teamTotals.utilization * 100).toFixed(1)}%
                                            </Badge>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Error display */}
                {error && (
                    <Card className="border-red-500/50 bg-red-500/5">
                        <CardContent className="py-4">
                            <p className="text-red-600">{error}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
