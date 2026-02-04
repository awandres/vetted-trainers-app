"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@vt/ui";
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  User,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Timer,
} from "lucide-react";

interface Contract {
  id: string;
  contractType: string;
  lengthWeeks: number | null;
  pricePerSession: number | null;
  weeklySessions: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  totalValue: number | null;
  trainerName: string | null;
  createdAt: string;
}

export default function ContractPage() {
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContract() {
      try {
        const res = await fetch("/api/contract", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setActiveContract(data.activeContract);
          setContracts(data.contracts || []);
        }
      } catch (error) {
        console.error("Error fetching contract:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContract();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getContractTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      training_agreement: "Training Agreement",
      price_lock: "Price Lock Agreement",
      session_to_session: "Session-to-Session",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "expiring_soon":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <Timer className="h-3 w-3 mr-1" />
            Expiring Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">
            {status}
          </Badge>
        );
    }
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <FileText className="h-8 w-8 text-[#3b82f6]" />
          My Contract
        </h1>
        <p className="text-gray-400 mt-1">
          View your current membership agreement and history
        </p>
      </div>

      {/* Active Contract */}
      {activeContract ? (
        <Card className="bg-[#353840] border-[#454850] mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl text-white">
                  {getContractTypeLabel(activeContract.contractType)}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your current membership agreement
                </CardDescription>
              </div>
              {getStatusBadge(activeContract.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Start Date</span>
                </div>
                <p className="text-lg font-medium text-white">
                  {formatDate(activeContract.startDate)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">End Date</span>
                </div>
                <p className="text-lg font-medium text-white">
                  {formatDate(activeContract.endDate)}
                </p>
                {activeContract.endDate && getDaysRemaining(activeContract.endDate) !== null && (
                  <p className="text-sm text-gray-500">
                    {getDaysRemaining(activeContract.endDate)! > 0 
                      ? `${getDaysRemaining(activeContract.endDate)} days remaining`
                      : "Contract has ended"
                    }
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Per Session</span>
                </div>
                <p className="text-lg font-medium text-white">
                  {formatCurrency(activeContract.pricePerSession)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Weekly Sessions</span>
                </div>
                <p className="text-lg font-medium text-white">
                  {activeContract.weeklySessions || 1} session{activeContract.weeklySessions !== 1 ? "s" : ""}/week
                </p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-6 pt-6 border-t border-[#454850] grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Contract Length</p>
                <p className="text-white">
                  {activeContract.lengthWeeks 
                    ? `${activeContract.lengthWeeks} weeks` 
                    : "Session-to-Session"
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Total Contract Value</p>
                <p className="text-white">
                  {formatCurrency(activeContract.totalValue)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Assigned Trainer</p>
                <p className="text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {activeContract.trainerName || "Not assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#353840] border-[#454850] mb-8">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-lg text-white">No Active Contract</p>
            <p className="text-gray-400 mt-2">
              You don't have an active membership agreement. Contact your trainer to set one up.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contract History */}
      {contracts.length > 1 && (
        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader>
            <CardTitle className="text-white">Contract History</CardTitle>
            <CardDescription className="text-gray-400">
              Your previous membership agreements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts
                .filter(c => c.id !== activeContract?.id)
                .map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-[#454850] bg-[#2a2d36]"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {getContractTypeLabel(contract.contractType)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                      </p>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      <Card className="bg-[#2a2d36] border-[#454850] mt-6">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[#3b82f6]/10 p-3">
              <AlertTriangle className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <p className="font-medium text-white">Questions about your contract?</p>
              <p className="text-sm text-gray-400 mt-1">
                Contact your trainer or reach out to Vetted Trainers support for any questions about your membership agreement, pricing, or renewals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
