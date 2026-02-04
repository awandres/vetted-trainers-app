"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  User,
  UserCog,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Loader2,
  AlertTriangle,
  Percent,
  Hash,
  CreditCard,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from "@vt/ui";

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
  enrollmentFeeAmount: number | null;
  alertStatus: string | null;
  contractNotes: string | null;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    status: string;
  } | null;
  trainer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

// Helpers
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
  const date = new Date(dateStr);
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
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "bg-green-500/10 text-green-600", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-blue-500/10 text-blue-600", icon: Calendar },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600", icon: XCircle },
  expired: { label: "Expired", color: "bg-background0/10 text-gray-600", icon: Clock },
};

export default function ContractDetailPage() {
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContract() {
      try {
        const res = await fetch(`/api/contracts/${contractId}`);
        if (!res.ok) throw new Error("Failed to fetch contract");
        const data = await res.json();
        setContract(data.contract);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-medium text-destructive">
            {error || "Contract not found"}
          </p>
          <Link href="/contracts">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;
  const daysUntil = getDaysUntilExpiry(contract.endDate);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/contracts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">
                  {formatContractType(contract.contractType)}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={statusConfig.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  {daysUntil !== null && daysUntil >= 0 && daysUntil <= 14 && (
                    <Badge variant="destructive" className="text-xs">
                      {daysUntil} days left
                    </Badge>
                  )}
                  {daysUntil !== null && daysUntil < 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Contract Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Price per Session</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(contract.pricePerSession)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Weekly Sessions</p>
                    <p className="text-2xl font-bold">{contract.weeklySessions}x</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(contract.totalValue)}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="font-medium">
                      {contract.lengthWeeks ? `${contract.lengthWeeks} weeks` : "Ongoing"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Enrollment Fee</span>
                    </div>
                    <span className="font-medium">
                      {contract.hasEnrollmentFee
                        ? formatCurrency(contract.enrollmentFeeAmount || 0)
                        : "None"}
                    </span>
                  </div>
                  {contract.commissionRate && (
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Commission Rate</span>
                      </div>
                      <span className="font-medium">{contract.commissionRate}</span>
                    </div>
                  )}
                  {contract.commissionAmount && (
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Commission Amount</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(contract.commissionAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Contract Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="text-lg font-medium">{formatDate(contract.startDate)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="text-lg font-medium">{formatDate(contract.endDate)}</p>
                  </div>
                </div>

                {daysUntil !== null && (
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    {daysUntil > 0 ? (
                      <p className="text-sm">
                        <span className="font-bold text-primary">{daysUntil}</span> days remaining
                      </p>
                    ) : daysUntil === 0 ? (
                      <p className="text-sm text-amber-600 font-medium">Expires today</p>
                    ) : (
                      <p className="text-sm text-red-600 font-medium">
                        Expired {Math.abs(daysUntil)} days ago
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {contract.contractNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {contract.contractNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Member & Trainer Info */}
          <div className="space-y-6">
            {/* Member Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contract.member ? (
                  <div className="space-y-3">
                    <Link
                      href={`/members/${contract.member.id}`}
                      className="font-medium text-lg hover:underline text-primary"
                    >
                      {contract.member.firstName} {contract.member.lastName}
                    </Link>
                    {contract.member.email && (
                      <p className="text-sm text-muted-foreground">{contract.member.email}</p>
                    )}
                    {contract.member.phone && (
                      <p className="text-sm text-muted-foreground">{contract.member.phone}</p>
                    )}
                    <Badge variant="outline" className="mt-2">
                      {contract.member.status}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No member assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Trainer Info */}
            {contract.trainer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Sold By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {contract.trainer.firstName} {contract.trainer.lastName}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract ID</span>
                  <span className="font-mono text-xs">{contract.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(contract.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{formatDate(contract.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
