"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Button,
} from "@vt/ui";
import {
  AlertTriangle,
  Clock,
  UserX,
  FileText,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface MemberAlert {
  id: string;
  name: string;
  lastVisitDate: string | null;
  daysSinceVisit: number | null;
}

interface TrainerGroup {
  trainerId: string | null;
  trainerName: string;
  members: MemberAlert[];
}

interface ExpiringContract {
  id: string;
  contractType: string;
  endDate: string | null;
  memberId: string | null;
  memberFirstName: string | null;
  memberLastName: string | null;
  trainerId: string | null;
  trainerFirstName: string | null;
  trainerLastName: string | null;
}

interface AlertsData {
  summary: {
    totalInactive: number;
    totalChurned: number;
    expiringContracts: number;
  };
  inactiveMembers: TrainerGroup[];
  churnedMembers: TrainerGroup[];
  expiringContracts: ExpiringContract[];
}

export function AlertsWidget() {
  const [data, setData] = useState<AlertsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedTrainers, setExpandedTrainers] = useState<Set<string>>(new Set());
  const [showAllContracts, setShowAllContracts] = useState(false);

  const toggleTrainerExpansion = (trainerId: string) => {
    setExpandedTrainers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trainerId)) {
        newSet.delete(trainerId);
      } else {
        newSet.add(trainerId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("/api/alerts");
        if (!response.ok) throw new Error("Failed to fetch alerts");
        const alertsData = await response.json();
        setData(alertsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alerts & Attention Needed
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alerts & Attention Needed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load alerts
          </p>
        </CardContent>
      </Card>
    );
  }

  const { summary, inactiveMembers, churnedMembers, expiringContracts } = data;
  const hasAlerts = summary.totalInactive > 0 || summary.totalChurned > 0 || summary.expiringContracts > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alerts & Attention Needed
        </CardTitle>
        <CardDescription>
          Members needing follow-up and expiring contracts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAlerts ? (
          <div className="flex items-center gap-3 py-4 text-muted-foreground">
            <div className="rounded-full bg-green-500/10 p-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm">All clear! No alerts at this time.</p>
          </div>
        ) : (
          <>
            {/* Inactive Members */}
            {summary.totalInactive > 0 && (
              <AlertSection
                title="Inactive Members"
                subtitle="14-45 days since last visit"
                count={summary.totalInactive}
                icon={<Clock className="h-4 w-4" />}
                variant="warning"
                isExpanded={expandedSection === "inactive"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "inactive" ? null : "inactive"
                  )
                }
                viewAllLink="/members?status=inactive"
              >
                {inactiveMembers.map((group) => {
                  const trainerId = group.trainerId || "unassigned";
                  const isTrainerExpanded = expandedTrainers.has(`inactive-${trainerId}`);
                  const visibleCount = isTrainerExpanded ? group.members.length : 3;
                  const hiddenCount = group.members.length - 3;
                  
                  return (
                    <div key={trainerId} className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {group.trainerName} ({group.members.length})
                      </p>
                      <div className="space-y-1">
                        {group.members.slice(0, visibleCount).map((member) => (
                          <Link
                            key={member.id}
                            href={`/members/${member.id}`}
                            className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 text-sm"
                          >
                            <span>{member.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {member.daysSinceVisit} days
                            </span>
                          </Link>
                        ))}
                        {hiddenCount > 0 && (
                          <button
                            onClick={() => toggleTrainerExpansion(`inactive-${trainerId}`)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1"
                          >
                            {isTrainerExpanded ? (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-3 w-3" />
                                +{hiddenCount} more
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </AlertSection>
            )}

            {/* Churned Members */}
            {summary.totalChurned > 0 && (
              <AlertSection
                title="Churned Members"
                subtitle="45+ days since last visit"
                count={summary.totalChurned}
                icon={<UserX className="h-4 w-4" />}
                variant="danger"
                isExpanded={expandedSection === "churned"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "churned" ? null : "churned"
                  )
                }
                viewAllLink="/members?status=churned"
              >
                {churnedMembers.slice(0, 5).map((group) => {
                  const trainerId = group.trainerId || "unassigned";
                  const isTrainerExpanded = expandedTrainers.has(`churned-${trainerId}`);
                  const visibleCount = isTrainerExpanded ? group.members.length : 2;
                  const hiddenCount = group.members.length - 2;
                  
                  return (
                    <div key={trainerId} className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {group.trainerName} ({group.members.length})
                      </p>
                      <div className="space-y-1">
                        {group.members.slice(0, visibleCount).map((member) => (
                          <Link
                            key={member.id}
                            href={`/members/${member.id}`}
                            className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 text-sm"
                          >
                            <span>{member.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {member.daysSinceVisit} days
                            </span>
                          </Link>
                        ))}
                        {hiddenCount > 0 && (
                          <button
                            onClick={() => toggleTrainerExpansion(`churned-${trainerId}`)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1"
                          >
                            {isTrainerExpanded ? (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-3 w-3" />
                                +{hiddenCount} more
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </AlertSection>
            )}

            {/* Expiring Contracts */}
            {summary.expiringContracts > 0 && (
              <AlertSection
                title="Expiring Contracts"
                subtitle="Within next 14 days"
                count={summary.expiringContracts}
                icon={<FileText className="h-4 w-4" />}
                variant="info"
                isExpanded={expandedSection === "contracts"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "contracts" ? null : "contracts"
                  )
                }
                viewAllLink="/contracts?status=expiring"
              >
                <div className="space-y-1">
                  {expiringContracts.slice(0, showAllContracts ? expiringContracts.length : 5).map((contract) => (
                    <Link
                      key={contract.id}
                      href={`/contracts/${contract.id}`}
                      className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 text-sm"
                    >
                      <span>
                        {contract.memberFirstName} {contract.memberLastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {contract.endDate}
                      </span>
                    </Link>
                  ))}
                  {expiringContracts.length > 5 && (
                    <button
                      onClick={() => setShowAllContracts(!showAllContracts)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1"
                    >
                      {showAllContracts ? (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3" />
                          +{expiringContracts.length - 5} more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </AlertSection>
            )}
          </>
        )}

        <Separator className="my-2" />

        <Link
          href="/members?status=inactive"
          className="flex items-center justify-between text-sm text-primary hover:underline"
        >
          <span>View all members needing attention</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

// Alert Section Component
function AlertSection({
  title,
  subtitle,
  count,
  icon,
  variant,
  isExpanded,
  onToggle,
  viewAllLink,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  icon: React.ReactNode;
  variant: "warning" | "danger" | "info";
  isExpanded: boolean;
  onToggle: () => void;
  viewAllLink?: string;
  children: React.ReactNode;
}) {
  const variantStyles = {
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    danger: "bg-red-500/10 text-red-600 border-red-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  const badgeVariants = {
    warning: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    danger: "bg-red-500/20 text-red-700 border-red-500/30",
    info: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  };

  return (
    <div className={`rounded-lg border p-3 ${variantStyles[variant]}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-left">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs opacity-80">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={badgeVariants[variant]}
          >
            {count}
          </Badge>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-current/20">
          {children}
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center justify-center gap-1 mt-3 pt-2 border-t border-current/10 text-xs font-medium hover:underline"
            >
              View full list
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
