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
} from "@vt/ui";
import {
  ArrowLeft,
  Search,
  Plus,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Filter,
  RefreshCw,
  TrendingDown,
} from "lucide-react";

// Types
interface VTMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  pricePerSession: number | null;
  status: "active" | "inactive" | "churned" | "paused";
  daysSinceVisit: number | null;
  lastVisitDate: string | null;
  trainer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  referredBy: string | null;
  createdAt: string;
}

interface VTTrainer {
  id: string;
  firstName: string;
  lastName: string;
}

// Status badge component
function StatusBadge({ status, daysSince }: { status: string; daysSince: number | null }) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          icon: CheckCircle,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        };
      case "inactive":
        return {
          label: `Inactive (${daysSince}d)`,
          icon: Clock,
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        };
      case "churned":
        return {
          label: `Churned (${daysSince}d)`,
          icon: AlertTriangle,
          className: "bg-red-500/10 text-red-600 border-red-500/20",
        };
      case "paused":
        return {
          label: "Paused",
          icon: Clock,
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      default:
        return {
          label: status,
          icon: User,
          className: "",
        };
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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Add Member Dialog Component
function AddMemberDialog({
  trainers,
  onMemberCreated,
}: {
  trainers: VTTrainer[];
  onMemberCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    trainerId: "",
    pricePerSession: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || null,
          phone: form.phone || null,
          trainerId: form.trainerId || null,
          pricePerSession: form.pricePerSession ? parseFloat(form.pricePerSession) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create member");
      }

      // Reset form and close
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        trainerId: "",
        pricePerSession: "",
      });
      setOpen(false);
      onMemberCreated();
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
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Enter the member's details to add them to the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainer">Trainer</Label>
              <Select
                value={form.trainerId}
                onValueChange={(v) => setForm({ ...form, trainerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trainer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.firstName} {trainer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Session ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.pricePerSession}
                onChange={(e) => setForm({ ...form, pricePerSession: e.target.value })}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Alert Widget Component
function AlertsWidget({ members }: { members: VTMember[] }) {
  const inactiveMembers = members.filter((m) => m.status === "inactive");
  const churnedMembers = members.filter((m) => m.status === "churned");

  const atRiskCount = inactiveMembers.length;
  const churnedCount = churnedMembers.length;

  if (atRiskCount === 0 && churnedCount === 0) return null;

  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
          <TrendingDown className="h-5 w-5" />
          Member Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {atRiskCount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-700">{atRiskCount} Inactive Members</p>
                  <p className="text-sm text-yellow-600/80">14-45 days since last visit - Reach out soon!</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500/50 text-yellow-700 hover:bg-yellow-500/10"
                onClick={() => {
                  // This would filter to show only inactive
                  const el = document.getElementById("status-filter") as HTMLSelectElement;
                  if (el) el.click();
                }}
              >
                View
              </Button>
            </div>
          )}

          {churnedCount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-700">{churnedCount} Churned Members</p>
                  <p className="text-sm text-red-600/80">45+ days since last visit - Consider win-back campaign</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-700 hover:bg-red-500/10"
              >
                View
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<VTMember[]>([]);
  const [trainers, setTrainers] = useState<VTTrainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trainerFilter, setTrainerFilter] = useState<string>("all");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [membersRes, trainersRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/trainers"),
      ]);

      if (!membersRes.ok) throw new Error("Failed to fetch members");
      if (!trainersRes.ok) throw new Error("Failed to fetch trainers");

      const membersData = await membersRes.json();
      const trainersData = await trainersRes.json();

      setMembers(membersData.members || []);
      setTrainers(trainersData.trainers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecalculateStatus = async () => {
    setIsRecalculating(true);
    try {
      const response = await fetch("/api/members/recalculate-status", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to recalculate");
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const email = member.email?.toLowerCase() || "";
      if (!fullName.includes(query) && !email.includes(query)) {
        return false;
      }
    }

    if (statusFilter !== "all" && member.status !== statusFilter) {
      return false;
    }

    if (trainerFilter !== "all" && member.trainer?.id !== trainerFilter) {
      return false;
    }

    return true;
  });

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    inactive: members.filter((m) => m.status === "inactive").length,
    churned: members.filter((m) => m.status === "churned").length,
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Members</h1>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Error loading members</p>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Members</h1>
              <p className="text-muted-foreground">
                Manage gym members and their training assignments
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRecalculateStatus}
              disabled={isRecalculating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRecalculating ? "animate-spin" : ""}`} />
              Recalculate Status
            </Button>
            <AddMemberDialog trainers={trainers} onMemberCreated={fetchData} />
          </div>
        </div>

        {/* Alerts Widget */}
        <AlertsWidget members={members} />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter("active")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% of members
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter("inactive")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">14-45 days since visit</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter("churned")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churned</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.churned}</div>
              <p className="text-xs text-muted-foreground">45+ days since visit</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={trainerFilter} onValueChange={setTrainerFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trainer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trainers</SelectItem>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.firstName} {trainer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(statusFilter !== "all" || trainerFilter !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setTrainerFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Members ({filteredMembers.length}
              {filteredMembers.length !== members.length && ` of ${members.length}`})
            </CardTitle>
            <CardDescription>
              Click on a member to view details and manage their account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No members found</p>
                <p className="text-muted-foreground">
                  {members.length === 0
                    ? "Add members to get started"
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Price/Session</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                              {member.email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.trainer ? (
                            <span className="text-sm">
                              {member.trainer.firstName} {member.trainer.lastName}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatPrice(member.pricePerSession)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(member.lastVisitDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={member.status} daysSince={member.daysSinceVisit} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/members/${member.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
