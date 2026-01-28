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
} from "@vt/ui";
import {
  ArrowLeft,
  Search,
  Plus,
  FileText,
  AlertTriangle,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Types
interface Contract {
  id: string;
  contractType: string;
  pricePerSession: number;
  weeklySessions: number;
  lengthWeeks: number | null;
  totalValue: number | null;
  startDate: string;
  endDate: string | null;
  status: string;
  commissionRate: string | null;
  commissionAmount: number | null;
  hasEnrollmentFee: boolean;
  alertStatus: string | null;
  contractNotes: string | null;
  createdAt: string;
  member: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
  trainer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

interface Stats {
  active: number;
  completed: number;
  cancelled: number;
  total: number;
  expiringSoon: number;
}

// Helper functions
function formatCurrency(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatContractType(type: string): string {
  switch (type) {
    case "training_agreement":
      return "Training Agreement";
    case "price_lock":
      return "Price Lock";
    case "session_to_session":
      return "Session to Session";
    default:
      return type;
  }
}

function getDaysUntilExpiry(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-600 border-green-500/30",
    completed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
    expired: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  };

  return (
    <Badge variant="outline" className={styles[status] || ""}>
      {status}
    </Badge>
  );
}

function ExpiryBadge({ daysUntil }: { daysUntil: number | null }) {
  if (daysUntil === null) return null;
  
  if (daysUntil < 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expired
      </Badge>
    );
  }
  
  if (daysUntil <= 7) {
    return (
      <Badge variant="destructive" className="text-xs">
        {daysUntil} days left
      </Badge>
    );
  }
  
  if (daysUntil <= 14) {
    return (
      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
        {daysUntil} days left
      </Badge>
    );
  }
  
  return null;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<Stats>({ active: 0, completed: 0, cancelled: 0, total: 0, expiringSoon: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (typeFilter !== "all") params.set("contractType", typeFilter);
        if (showExpiringSoon) params.set("expiringSoon", "true");

        const res = await fetch(`/api/contracts?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch contracts");
        const data = await res.json();
        setContracts(data.contracts || []);
        setStats(data.stats || { active: 0, completed: 0, cancelled: 0, total: 0, expiringSoon: 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [statusFilter, typeFilter, showExpiringSoon]);

  const filteredContracts = contracts.filter((contract) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const memberName = `${contract.member?.firstName || ""} ${contract.member?.lastName || ""}`.toLowerCase();
      const trainerName = `${contract.trainer?.firstName || ""} ${contract.trainer?.lastName || ""}`.toLowerCase();
      if (!memberName.includes(query) && !trainerName.includes(query)) {
        return false;
      }
    }
    return true;
  });

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
            <h1 className="text-2xl font-bold">Contracts</h1>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Error loading contracts</p>
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
              <h1 className="text-2xl font-bold">Contracts</h1>
              <p className="text-muted-foreground">
                Manage member contracts and agreements
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-colors ${showExpiringSoon ? "ring-2 ring-amber-500" : ""}`}
            onClick={() => setShowExpiringSoon(!showExpiringSoon)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Within 14 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member or trainer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="training_agreement">Training Agreement</SelectItem>
                  <SelectItem value="price_lock">Price Lock</SelectItem>
                  <SelectItem value="session_to_session">Session to Session</SelectItem>
                </SelectContent>
              </Select>
              {showExpiringSoon && (
                <Button variant="outline" onClick={() => setShowExpiringSoon(false)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear Expiring Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contracts ({filteredContracts.length})</CardTitle>
            <CardDescription>
              {showExpiringSoon
                ? "Contracts expiring within the next 14 days"
                : "All member contracts and agreements"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No contracts found</p>
                <p className="text-muted-foreground">
                  {contracts.length === 0
                    ? "Create a contract to get started"
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price/Session</TableHead>
                      <TableHead>Weekly</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => {
                      const daysUntil = getDaysUntilExpiry(contract.endDate);
                      return (
                        <TableRow key={contract.id} className="hover:bg-muted/50">
                          <TableCell>
                            {contract.member ? (
                              <Link
                                href={`/members/${contract.member.id}`}
                                className="font-medium hover:underline"
                              >
                                {contract.member.firstName} {contract.member.lastName}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                            {contract.trainer && (
                              <p className="text-sm text-muted-foreground">
                                Sold by {contract.trainer.firstName} {contract.trainer.lastName}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {formatContractType(contract.contractType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(contract.pricePerSession)}</TableCell>
                          <TableCell>{contract.weeklySessions}x</TableCell>
                          <TableCell>
                            {contract.lengthWeeks ? `${contract.lengthWeeks} weeks` : "Ongoing"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(contract.totalValue)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{formatDate(contract.endDate)}</span>
                              <ExpiryBadge daysUntil={daysUntil} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={contract.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
