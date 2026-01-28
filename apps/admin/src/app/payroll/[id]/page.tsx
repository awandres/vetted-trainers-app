"use client";

import { useState, useEffect, use } from "react";
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
    DollarSign,
    Users,
    Activity,
    Calculator,
    Loader2,
    CheckCircle,
    Clock,
    FileText,
    TrendingUp,
} from "lucide-react";

// Types
interface Trainer {
    id: string;
    firstName: string | null;
    lastName: string | null;
    sessionRate: number;
    nonSessionRate: number;
}

interface PayrollEntry {
    trainerId: string;
    trainerName: string;
    sessionRate: number;
    nonSessionRate: number;
    totalSessions: number;
    nonSessionHours: number;
    sessionPay: number;
    nonSessionPay: number;
    s2sCommission: number;
    salesCommission: number;
    leadershipBonus: number;
    otherBonus: number;
    totalPay: number;
}

// Helper functions
function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getWeekDates(weekEnding: string): { start: string; end: string } {
    const end = new Date(weekEnding + "T12:00:00");
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return {
        start: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        end: end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
}

export default function PayrollCalculatorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const isNewPayroll = resolvedParams.id === "new";

    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [entries, setEntries] = useState<PayrollEntry[]>([]);
    const [weekEnding, setWeekEnding] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [periodLoaded, setPeriodLoaded] = useState(false);
    const [savedDetails, setSavedDetails] = useState<any[]>([]);

    // Team-level inputs
    const [s2sRevenue, setS2sRevenue] = useState(0);
    const [contractedRevenue, setContractedRevenue] = useState(0);
    const [fixedExpenses, setFixedExpenses] = useState(164835); // $1,648.35 in cents
    const [targetRevenue, setTargetRevenue] = useState(2500000); // $25,000 in cents

    // Load existing period data if viewing an existing payroll
    useEffect(() => {
        async function loadPeriod() {
            if (isNewPayroll) {
                // For new payroll, default to this Saturday
                const today = new Date();
                const dayOfWeek = today.getDay();
                const saturday = new Date(today);
                saturday.setDate(today.getDate() + (6 - dayOfWeek));
                setWeekEnding(saturday.toISOString().split("T")[0]);
                setPeriodLoaded(true);
                return;
            }

            try {
                const res = await fetch(`/api/payroll/${resolvedParams.id}`);
                if (!res.ok) {
                    throw new Error("Failed to load payroll period");
                }
                const data = await res.json();
                const period = data.period;

                // Set values from the loaded period
                setWeekEnding(period.weekEnding);
                setS2sRevenue(period.s2sRevenue || 0);
                setContractedRevenue(period.contractedRevenue || 0);
                setFixedExpenses(period.fixedExpenses || 800000);
                setTargetRevenue(period.targetRevenue || 2500000);

                // Save the details to merge with trainers later
                setSavedDetails(data.details || []);
                setPeriodLoaded(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load period");
                setPeriodLoaded(true);
            }
        }

        loadPeriod();
    }, [isNewPayroll, resolvedParams.id]);

    // Fetch trainers after week is loaded
    useEffect(() => {
        if (periodLoaded && weekEnding) {
            fetchData();
        }
    }, [periodLoaded, weekEnding]);

    async function fetchData() {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch trainers
            const trainersRes = await fetch("/api/trainers");
            const trainersData = await trainersRes.json();
            const trainersList = trainersData.trainers || [];
            setTrainers(trainersList);

            // Initialize entries for each trainer, merging with any saved details
            const initialEntries: PayrollEntry[] = trainersList.map((t: Trainer) => {
                // Find saved detail for this trainer if it exists
                const savedDetail = savedDetails.find((d: any) => d.trainerId === t.id);

                if (savedDetail) {
                    // Use saved values
                    const totalSessions = parseFloat(savedDetail.totalSessions || "0");
                    const nonSessionHours = parseFloat(savedDetail.nonSessionHours || "0");
                    const sessionRate = savedDetail.sessionRate || t.sessionRate || 0;
                    const nonSessionRate = savedDetail.nonSessionRate || t.nonSessionRate || 0;

                    return {
                        trainerId: t.id,
                        trainerName: `${t.firstName || ""} ${t.lastName || ""}`.trim(),
                        sessionRate: sessionRate,
                        nonSessionRate: nonSessionRate,
                        totalSessions: totalSessions,
                        nonSessionHours: nonSessionHours,
                        sessionPay: savedDetail.sessionPaySubtotal || Math.round(totalSessions * sessionRate),
                        nonSessionPay: savedDetail.nonSessionPaySubtotal || Math.round(nonSessionHours * nonSessionRate),
                        s2sCommission: savedDetail.s2sCommission || 0,
                        salesCommission: savedDetail.salesCommission || 0,
                        leadershipBonus: savedDetail.leadershipBonus || 0,
                        otherBonus: savedDetail.otherBonus || 0,
                        totalPay: savedDetail.totalPay || 0,
                    };
                }

                // Default for new entries
                return {
                    trainerId: t.id,
                    trainerName: `${t.firstName || ""} ${t.lastName || ""}`.trim(),
                    sessionRate: t.sessionRate || 0,
                    nonSessionRate: t.nonSessionRate || 0,
                    totalSessions: 0,
                    nonSessionHours: 0,
                    sessionPay: 0,
                    nonSessionPay: 0,
                    s2sCommission: 0,
                    salesCommission: 0,
                    leadershipBonus: 0,
                    otherBonus: 0,
                    totalPay: 0,
                };
            });

            setEntries(initialEntries);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    function updateEntry(trainerId: string, field: keyof PayrollEntry, value: number) {
        setEntries((prev) =>
            prev.map((entry) => {
                if (entry.trainerId !== trainerId) return entry;

                const updated = { ...entry, [field]: value };

                // Recalculate pay amounts
                updated.sessionPay = Math.round(updated.totalSessions * updated.sessionRate);
                updated.nonSessionPay = Math.round(updated.nonSessionHours * updated.nonSessionRate);
                updated.totalPay =
                    updated.sessionPay +
                    updated.nonSessionPay +
                    updated.s2sCommission +
                    updated.salesCommission +
                    updated.leadershipBonus +
                    updated.otherBonus;

                return updated;
            })
        );
    }

    async function handleSave() {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const teamTotals = calculateTeamTotals();

            const response = await fetch("/api/payroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weekEnding,
                    totalSessions: teamTotals.totalSessions,
                    s2sRevenue,
                    contractedRevenue,
                    totalRevenue: s2sRevenue + contractedRevenue,
                    targetRevenue,
                    totalPayout: teamTotals.totalPay,
                    fixedExpenses,
                    status: "draft",
                    entries: entries.map((e) => ({
                        trainerId: e.trainerId,
                        totalSessions: e.totalSessions,
                        nonSessionHours: e.nonSessionHours,
                        sessionPay: e.sessionPay,
                        nonSessionPay: e.nonSessionPay,
                        s2sCommission: e.s2sCommission,
                        salesCommission: e.salesCommission,
                        leadershipBonus: e.leadershipBonus,
                        otherBonus: e.otherBonus,
                        totalPay: e.totalPay,
                    })),
                }),
            });

            if (!response.ok) throw new Error("Failed to save payroll data");

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    }

    function calculateTeamTotals() {
        return entries.reduce(
            (acc, e) => ({
                totalSessions: acc.totalSessions + e.totalSessions,
                nonSessionHours: acc.nonSessionHours + e.nonSessionHours,
                sessionPay: acc.sessionPay + e.sessionPay,
                nonSessionPay: acc.nonSessionPay + e.nonSessionPay,
                commissions: acc.commissions + e.s2sCommission + e.salesCommission,
                bonuses: acc.bonuses + e.leadershipBonus + e.otherBonus,
                totalPay: acc.totalPay + e.totalPay,
            }),
            { totalSessions: 0, nonSessionHours: 0, sessionPay: 0, nonSessionPay: 0, commissions: 0, bonuses: 0, totalPay: 0 }
        );
    }

    const teamTotals = calculateTeamTotals();
    const totalRevenue = s2sRevenue + contractedRevenue;
    const totalExpenses = teamTotals.totalPay + fixedExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;

    const weekDates = getWeekDates(weekEnding);

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
                        <Link href="/payroll">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Payroll Calculator</h1>
                            <p className="text-muted-foreground">
                                Week of {weekDates.start} - {weekDates.end}
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
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Payroll
                        </Button>
                    </div>
                </div>

                {/* Revenue & Expenses Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Payout</p>
                                    <p className="text-2xl font-bold">{formatCurrency(teamTotals.totalPay)}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                                    <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {formatCurrency(netProfit)}
                                    </p>
                                </div>
                                <TrendingUp className={`h-8 w-8 ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                                    <p className={`text-2xl font-bold ${profitMargin >= 0.15 ? "text-green-600" : "text-amber-600"}`}>
                                        {(profitMargin * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <Calculator className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Inputs */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Revenue & Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="s2sRevenue">S2S Revenue ($)</Label>
                                <Input
                                    id="s2sRevenue"
                                    type="number"
                                    step="0.01"
                                    value={(s2sRevenue / 100).toFixed(2)}
                                    onChange={(e) => setS2sRevenue(Math.round(parseFloat(e.target.value || "0") * 100))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="contractedRevenue">Contracted Revenue ($)</Label>
                                <Input
                                    id="contractedRevenue"
                                    type="number"
                                    step="0.01"
                                    value={(contractedRevenue / 100).toFixed(2)}
                                    onChange={(e) => setContractedRevenue(Math.round(parseFloat(e.target.value || "0") * 100))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fixedExpenses">Fixed Expenses ($)</Label>
                                <Input
                                    id="fixedExpenses"
                                    type="number"
                                    step="0.01"
                                    value={(fixedExpenses / 100).toFixed(2)}
                                    onChange={(e) => setFixedExpenses(Math.round(parseFloat(e.target.value || "0") * 100))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="targetRevenue">Target Revenue ($)</Label>
                                <Input
                                    id="targetRevenue"
                                    type="number"
                                    step="0.01"
                                    value={(targetRevenue / 100).toFixed(2)}
                                    onChange={(e) => setTargetRevenue(Math.round(parseFloat(e.target.value || "0") * 100))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Summary */}
                <div className="grid grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Activity className="h-6 w-6 mx-auto text-primary mb-2" />
                            <p className="text-2xl font-bold">{teamTotals.totalSessions.toFixed(1)}</p>
                            <p className="text-sm text-muted-foreground">Total Sessions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-2xl font-bold">{formatCurrency(teamTotals.sessionPay)}</p>
                            <p className="text-sm text-muted-foreground">Session Pay</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-2xl font-bold">{formatCurrency(teamTotals.nonSessionPay)}</p>
                            <p className="text-sm text-muted-foreground">Non-Session Pay</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-2xl font-bold">{formatCurrency(teamTotals.commissions)}</p>
                            <p className="text-sm text-muted-foreground">Commissions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-2xl font-bold">{formatCurrency(teamTotals.bonuses)}</p>
                            <p className="text-sm text-muted-foreground">Bonuses</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Entry Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trainer Payroll</CardTitle>
                        <CardDescription>
                            Enter sessions and bonuses for each trainer. Pay is calculated automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-2 font-medium sticky left-0 bg-muted/50 min-w-[140px]">Trainer</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[70px]">Rate</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">Sessions</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[90px]">Session Pay</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">Non-Sess</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[90px]">Non-Sess Pay</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">S2S Comm</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">Sales Comm</th>
                                        <th className="text-center py-3 px-2 font-medium min-w-[80px]">Bonus</th>
                                        <th className="text-center py-3 px-2 font-medium bg-green-50 min-w-[100px]">Total Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry) => (
                                        <tr key={entry.trainerId} className="border-b hover:bg-muted/30">
                                            <td className="py-2 px-2 font-medium sticky left-0 bg-background">
                                                {entry.trainerName}
                                            </td>
                                            <td className="py-2 px-2 text-center text-muted-foreground text-xs">
                                                {formatCurrency(entry.sessionRate)}
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.5"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.totalSessions || ""}
                                                    onChange={(e) => updateEntry(entry.trainerId, "totalSessions", parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center font-medium">
                                                {formatCurrency(entry.sessionPay)}
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.5"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.nonSessionHours || ""}
                                                    onChange={(e) => updateEntry(entry.trainerId, "nonSessionHours", parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                {formatCurrency(entry.nonSessionPay)}
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.s2sCommission ? (entry.s2sCommission / 100).toFixed(0) : ""}
                                                    onChange={(e) => updateEntry(entry.trainerId, "s2sCommission", Math.round(parseFloat(e.target.value || "0") * 100))}
                                                />
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.salesCommission ? (entry.salesCommission / 100).toFixed(0) : ""}
                                                    onChange={(e) => updateEntry(entry.trainerId, "salesCommission", Math.round(parseFloat(e.target.value || "0") * 100))}
                                                />
                                            </td>
                                            <td className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    className="h-8 w-16 text-center mx-auto"
                                                    value={entry.leadershipBonus + entry.otherBonus ? ((entry.leadershipBonus + entry.otherBonus) / 100).toFixed(0) : ""}
                                                    onChange={(e) => updateEntry(entry.trainerId, "otherBonus", Math.round(parseFloat(e.target.value || "0") * 100))}
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-center font-bold bg-green-50 text-green-700">
                                                {formatCurrency(entry.totalPay)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 bg-muted/30 font-bold">
                                        <td className="py-3 px-2 sticky left-0 bg-muted/30">TEAM TOTALS</td>
                                        <td className="py-3 px-2"></td>
                                        <td className="py-3 px-2 text-center">{teamTotals.totalSessions.toFixed(1)}</td>
                                        <td className="py-3 px-2 text-center">{formatCurrency(teamTotals.sessionPay)}</td>
                                        <td className="py-3 px-2 text-center">{teamTotals.nonSessionHours.toFixed(1)}</td>
                                        <td className="py-3 px-2 text-center">{formatCurrency(teamTotals.nonSessionPay)}</td>
                                        <td className="py-3 px-2 text-center" colSpan={2}>{formatCurrency(teamTotals.commissions)}</td>
                                        <td className="py-3 px-2 text-center">{formatCurrency(teamTotals.bonuses)}</td>
                                        <td className="py-3 px-2 text-center bg-green-100 text-green-800">
                                            {formatCurrency(teamTotals.totalPay)}
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
