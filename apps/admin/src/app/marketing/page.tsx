"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Send,
  Calendar,
  BarChart3,
  Trash2,
  Copy,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  MousePointer,
  TrendingUp,
  XCircle,
  Zap,
  Settings,
  Play,
  Pause,
  Bell,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vt/ui";

// Types
interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateType: string;
  audienceType: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
}

interface AutomatedEmail {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  triggerMode: "always" | "optional" | "disabled";
  subject: string;
  previewText: string | null;
  templateType: string;
  isActive: boolean;
  testMode: boolean;
  testEmails: string | null;
  sentCount: number;
  lastSentAt: string | null;
  createdAt: string;
}

// Trigger display names
const TRIGGER_LABELS: Record<string, { label: string; icon: typeof Bell; description: string }> = {
  session_booked: { label: "Session Booked", icon: Calendar, description: "When a session is scheduled" },
  session_reminder_24h: { label: "24h Reminder", icon: Clock, description: "24 hours before a session" },
  session_reminder_1h: { label: "1h Reminder", icon: Clock, description: "1 hour before a session" },
  session_completed: { label: "Session Complete", icon: CheckCircle, description: "After a session is marked complete" },
  session_cancelled: { label: "Session Cancelled", icon: XCircle, description: "When a session is cancelled" },
  session_rescheduled: { label: "Session Rescheduled", icon: Calendar, description: "When a session time changes" },
  prescription_sent: { label: "Prescription Sent", icon: Mail, description: "When a prescription is sent" },
  welcome_new_member: { label: "Welcome Email", icon: Users, description: "When a new member joins" },
  membership_expiring: { label: "Membership Expiring", icon: AlertCircle, description: "Before membership expires" },
  inactivity_reminder: { label: "Inactivity Reminder", icon: Clock, description: "When member hasn't visited" },
  birthday: { label: "Birthday", icon: Bell, description: "On member's birthday" },
  custom: { label: "Custom", icon: Settings, description: "Custom trigger" },
};

const TRIGGER_MODE_LABELS = {
  always: { label: "Always", color: "bg-green-500/10 text-green-600" },
  optional: { label: "Optional", color: "bg-blue-500/10 text-blue-600" },
  disabled: { label: "Disabled", color: "bg-gray-500/10 text-gray-500" },
};

// Status configuration
const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Edit, color: "bg-background0/10 text-gray-600" },
  scheduled: { label: "Scheduled", icon: Clock, color: "bg-blue-500/10 text-blue-600" },
  sending: { label: "Sending", icon: Loader2, color: "bg-yellow-500/10 text-yellow-600" },
  sent: { label: "Sent", icon: CheckCircle, color: "bg-green-500/10 text-green-600" },
  failed: { label: "Failed", icon: AlertCircle, color: "bg-red-500/10 text-red-600" },
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automatedEmails, setAutomatedEmails] = useState<AutomatedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"campaigns" | "automated">("campaigns");

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignsRes, automatedRes] = await Promise.all([
          fetch("/api/marketing/campaigns"),
          fetch("/api/marketing/automated"),
        ]);
        
        if (!campaignsRes.ok) throw new Error("Failed to fetch campaigns");
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns || []);

        if (automatedRes.ok) {
          const automatedData = await automatedRes.json();
          setAutomatedEmails(automatedData.automatedEmails || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting campaign:", err);
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${campaign.name} (Copy)`,
          subject: campaign.subject,
          templateType: campaign.templateType,
          audienceType: campaign.audienceType,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      const data = await res.json();
      setCampaigns([data.campaign, ...campaigns]);
    } catch (err) {
      console.error("Error duplicating campaign:", err);
    }
  };

  const handleCancelSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled campaign?")) return;
    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft", scheduledAt: null }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      const data = await res.json();
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, ...data.campaign } : c)));
    } catch (err) {
      console.error("Error canceling schedule:", err);
    }
  };

  const handleToggleAutomated = async (id: string) => {
    try {
      const res = await fetch(`/api/marketing/automated/${id}/toggle`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to toggle");
      const data = await res.json();
      setAutomatedEmails(automatedEmails.map((a) => 
        a.id === id ? { ...a, isActive: data.automatedEmail.isActive } : a
      ));
    } catch (err) {
      console.error("Error toggling automated email:", err);
    }
  };

  const handleDeleteAutomated = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automated email?")) return;
    try {
      const res = await fetch(`/api/marketing/automated/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setAutomatedEmails(automatedEmails.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting automated email:", err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Stats
  const stats = {
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === "sent").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
    avgOpenRate: campaigns.filter((c) => c.status === "sent").length > 0
      ? (campaigns.filter((c) => c.status === "sent").reduce((sum, c) => sum + (c.openRate || 0), 0) / 
         campaigns.filter((c) => c.status === "sent").length).toFixed(1)
      : "0.0",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Marketing
              </h1>
              <p className="text-sm text-muted-foreground">
                Email campaigns and automated communications
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "campaigns" ? (
                <Link href="/marketing/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </Link>
              ) : (
                <Link href="/marketing/automated/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Automated Email
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <Button
              variant={activeTab === "campaigns" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("campaigns")}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Campaigns
              <Badge variant="secondary" className="ml-1">{campaigns.length}</Badge>
            </Button>
            <Button
              variant={activeTab === "automated" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("automated")}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Automated Emails
              <Badge variant="secondary" className="ml-1">{automatedEmails.length}</Badge>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {activeTab === "campaigns" && (
          <>
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.draft} draft, {stats.scheduled} scheduled, {stats.sent} sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Send className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
              <p className="text-xs text-muted-foreground">Across sent campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Good</div>
              <p className="text-xs text-muted-foreground">Industry avg: 21%</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>
              Create and manage marketing emails to your members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <p className="text-lg font-medium">{error}</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No campaigns yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Create your first email campaign to engage your members
                </p>
                <Link href="/marketing/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead className="text-right">Sent</TableHead>
                      <TableHead className="text-right">Open Rate</TableHead>
                      <TableHead className="text-right">Click Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => {
                      const statusConfig = STATUS_CONFIG[campaign.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow
                          key={campaign.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => window.location.href = `/marketing/${campaign.id}`}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {campaign.subject}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className={`h-3 w-3 mr-1 ${campaign.status === "sending" ? "animate-spin" : ""}`} />
                                {statusConfig.label}
                              </Badge>
                              {campaign.status === "scheduled" && campaign.scheduledAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(campaign.scheduledAt)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {campaign.audienceType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.sentCount > 0 ? campaign.sentCount.toLocaleString() : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.status === "sent" ? `${campaign.openRate}%` : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {campaign.status === "sent" ? `${campaign.clickRate}%` : "—"}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {campaign.status === "scheduled" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelSchedule(campaign.id)}
                                  title="Cancel Schedule"
                                >
                                  <XCircle className="h-4 w-4 text-orange-500" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(campaign)}
                                title="Duplicate"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(campaign.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
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
          </>
        )}

        {activeTab === "automated" && (
          <>
            {/* Automated Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Automated</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{automatedEmails.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {automatedEmails.filter(a => a.isActive).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emails Triggered</CardTitle>
                  <Send className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {automatedEmails.reduce((sum, a) => sum + (a.sentCount || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Always Active</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {automatedEmails.filter(a => a.triggerMode === "always" && a.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Mandatory triggers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Optional</CardTitle>
                  <Settings className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {automatedEmails.filter(a => a.triggerMode === "optional").length}
                  </div>
                  <p className="text-xs text-muted-foreground">User-configurable</p>
                </CardContent>
              </Card>
            </div>

            {/* Automated Emails Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automated Emails
                </CardTitle>
                <CardDescription>
                  System-triggered emails sent automatically based on events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {automatedEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No automated emails yet</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Create automated emails to engage members at key moments
                    </p>
                    <Link href="/marketing/automated/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Automated Email
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Trigger</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Sent</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {automatedEmails.map((autoEmail) => {
                          const triggerInfo = TRIGGER_LABELS[autoEmail.trigger] || TRIGGER_LABELS.custom;
                          const TriggerIcon = triggerInfo.icon;
                          const modeInfo = TRIGGER_MODE_LABELS[autoEmail.triggerMode];

                          return (
                            <TableRow
                              key={autoEmail.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => window.location.href = `/marketing/automated/${autoEmail.id}`}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{autoEmail.name}</p>
                                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                                    {autoEmail.subject}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <TriggerIcon className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{triggerInfo.label}</p>
                                    <p className="text-xs text-muted-foreground">{triggerInfo.description}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={modeInfo.color}>
                                  {modeInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge 
                                    variant="outline" 
                                    className={autoEmail.isActive 
                                      ? "bg-green-500/10 text-green-600" 
                                      : "bg-gray-500/10 text-gray-500"
                                    }
                                  >
                                    {autoEmail.isActive ? (
                                      <><Play className="h-3 w-3 mr-1" /> Active</>
                                    ) : (
                                      <><Pause className="h-3 w-3 mr-1" /> Paused</>
                                    )}
                                  </Badge>
                                  {autoEmail.testMode && (
                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 text-xs">
                                      🧪 Test Mode
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {autoEmail.sentCount > 0 ? autoEmail.sentCount.toLocaleString() : "—"}
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleAutomated(autoEmail.id)}
                                    title={autoEmail.isActive ? "Pause" : "Activate"}
                                  >
                                    {autoEmail.isActive ? (
                                      <Pause className="h-4 w-4 text-orange-500" />
                                    ) : (
                                      <Play className="h-4 w-4 text-green-500" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAutomated(autoEmail.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
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
          </>
        )}
      </main>
    </div>
  );
}
