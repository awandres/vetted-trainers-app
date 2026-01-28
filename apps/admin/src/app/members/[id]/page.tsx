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
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@vt/ui";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    Edit,
    Save,
    X,
    Trash2,
    FileText,
    Activity,
    Users,
} from "lucide-react";

// Types
interface Contract {
    id: string;
    contractType: string;
    pricePerSession: number;
    weeklySessions: number;
    startDate: string;
    endDate: string | null;
    status: string;
}

interface Prescription {
    id: string;
    status: string;
    createdAt: string;
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
    email: string | null;
    phone: string | null;
    pricePerSession: number | null;
    status: "active" | "inactive" | "churned" | "paused";
    daysSinceVisit: number | null;
    lastVisitDate: string | null;
    referredBy: string | null;
    notes: string | null;
    tags: string[] | null;
    createdAt: string;
    updatedAt: string;
    trainer: Trainer | null;
    trainerId: string | null;
    contracts: Contract[];
    prescriptions: Prescription[];
}

function StatusBadge({ status, daysSince }: { status: string; daysSince: number | null }) {
    const getStatusConfig = () => {
        switch (status) {
            case "active":
                return { label: "Active", icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/20" };
            case "inactive":
                return { label: `Inactive (${daysSince ?? 0}d)`, icon: Clock, className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" };
            case "churned":
                return { label: `Churned (${daysSince ?? 0}d)`, icon: AlertTriangle, className: "bg-red-500/10 text-red-600 border-red-500/20" };
            case "paused":
                return { label: "Paused", icon: Clock, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
            default:
                return { label: status, icon: User, className: "" };
        }
    };
    const config = getStatusConfig();
    const Icon = config.icon;
    return (
        <Badge variant="outline" className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    );
}

function formatPrice(cents: number | null): string {
    if (cents === null) return "N/A";
    return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatContractType(type: string): string {
    switch (type) {
        case "training_agreement": return "Training Agreement";
        case "price_lock": return "Price Lock";
        case "session_to_session": return "Session to Session";
        default: return type;
    }
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [member, setMember] = useState<Member | null>(null);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        trainerId: "__unassigned__",
        pricePerSession: "",
        status: "active",
        notes: "",
        referredBy: "",
    });

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const [memberRes, trainersRes] = await Promise.all([
                    fetch(`/api/members/${resolvedParams.id}`),
                    fetch("/api/trainers"),
                ]);

                if (!memberRes.ok) {
                    if (memberRes.status === 404) throw new Error("Member not found");
                    throw new Error("Failed to fetch member");
                }

                const memberData = await memberRes.json();
                const trainersData = await trainersRes.json();

                setMember(memberData.member);
                setTrainers(trainersData.trainers || []);

                // Initialize edit form
                const m = memberData.member;
                setEditForm({
                    firstName: m.firstName || "",
                    lastName: m.lastName || "",
                    email: m.email || "",
                    phone: m.phone || "",
                    trainerId: m.trainer?.id || "__unassigned__",
                    pricePerSession: m.pricePerSession ? (m.pricePerSession / 100).toFixed(2) : "",
                    status: m.status || "active",
                    notes: m.notes || "",
                    referredBy: m.referredBy || "",
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
            const response = await fetch(`/api/members/${resolvedParams.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    email: editForm.email || null,
                    phone: editForm.phone || null,
                    trainerId: editForm.trainerId === "__unassigned__" ? null : editForm.trainerId,
                    pricePerSession: editForm.pricePerSession ? parseFloat(editForm.pricePerSession) : null,
                    status: editForm.status,
                    notes: editForm.notes || null,
                    referredBy: editForm.referredBy || null,
                }),
            });

            if (!response.ok) throw new Error("Failed to save changes");

            const data = await response.json();
            // Refresh the full member data
            const memberRes = await fetch(`/api/members/${resolvedParams.id}`);
            const memberData = await memberRes.json();
            setMember(memberData.member);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/members/${resolvedParams.id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete member");
            router.push("/members");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        if (member) {
            setEditForm({
                firstName: member.firstName || "",
                lastName: member.lastName || "",
                email: member.email || "",
                phone: member.phone || "",
                trainerId: member.trainer?.id || "",
                pricePerSession: member.pricePerSession ? (member.pricePerSession / 100).toFixed(2) : "",
                status: member.status || "active",
                notes: member.notes || "",
                referredBy: member.referredBy || "",
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="container mx-auto max-w-4xl space-y-6">
                    <Link href="/members">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Members
                        </Button>
                    </Link>
                    <Card>
                        <CardContent className="py-12 text-center">
                            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                            <p className="text-lg font-medium">{error || "Member not found"}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-5xl p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/members">
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
                                    {member.firstName} {member.lastName}
                                </h1>
                                <StatusBadge status={member.status} daysSince={member.daysSinceVisit} />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Member?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete {member.firstName} {member.lastName} and all associated data. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete Member"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Info Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Member Information</CardTitle>
                            <CardDescription>Personal and contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isEditing ? (
                                <div className="grid gap-4 md:grid-cols-2">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="trainer">Trainer</Label>
                                        <Select value={editForm.trainerId} onValueChange={(v) => setEditForm({ ...editForm, trainerId: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select trainer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__unassigned__">Unassigned</SelectItem>
                                                {trainers.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.firstName} {t.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pricePerSession">Price per Session ($)</Label>
                                        <Input
                                            id="pricePerSession"
                                            type="number"
                                            step="0.01"
                                            value={editForm.pricePerSession}
                                            onChange={(e) => setEditForm({ ...editForm, pricePerSession: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="churned">Churned</SelectItem>
                                                <SelectItem value="paused">Paused</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="referredBy">Referred By</Label>
                                        <Input
                                            id="referredBy"
                                            value={editForm.referredBy}
                                            onChange={(e) => setEditForm({ ...editForm, referredBy: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={editForm.notes}
                                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{member.email || "Not provided"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="font-medium">{member.phone || "Not provided"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Users className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Trainer</p>
                                                <p className="font-medium">
                                                    {member.trainer
                                                        ? `${member.trainer.firstName} ${member.trainer.lastName}`
                                                        : "Unassigned"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Price per Session</p>
                                                <p className="font-medium">{formatPrice(member.pricePerSession)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Last Visit</p>
                                                <p className="font-medium">{formatDate(member.lastVisitDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Referred By</p>
                                                <p className="font-medium">{member.referredBy || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {member.notes && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                                <p className="text-sm">{member.notes}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{formatDate(member.createdAt)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Days Since Last Visit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {member.daysSinceVisit !== null ? member.daysSinceVisit : "N/A"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{member.prescriptions?.length || 0}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Contracts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Contracts
                        </CardTitle>
                        <CardDescription>Training agreements and pricing history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {member.contracts && member.contracts.length > 0 ? (
                            <div className="space-y-4">
                                {member.contracts.map((contract) => (
                                    <div
                                        key={contract.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium">{formatContractType(contract.contractType)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatPrice(contract.pricePerSession)}/session · {contract.weeklySessions}x/week
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(contract.startDate)} - {contract.endDate ? formatDate(contract.endDate) : "Ongoing"}
                                            </p>
                                        </div>
                                        <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                                            {contract.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No contracts on file</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Prescriptions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Mobility Prescriptions
                        </CardTitle>
                        <CardDescription>Assigned exercises and mobility routines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {member.prescriptions && member.prescriptions.length > 0 ? (
                            <div className="space-y-4">
                                {member.prescriptions.map((prescription) => (
                                    <div
                                        key={prescription.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium">Prescription</p>
                                            <p className="text-sm text-muted-foreground">
                                                Created {formatDate(prescription.createdAt)}
                                            </p>
                                        </div>
                                        <Badge variant={prescription.status === "sent" ? "default" : "secondary"}>
                                            {prescription.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No prescriptions assigned</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
