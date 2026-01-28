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

// Status configuration
const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Edit, color: "bg-gray-500/10 text-gray-600" },
  scheduled: { label: "Scheduled", icon: Clock, color: "bg-blue-500/10 text-blue-600" },
  sending: { label: "Sending", icon: Loader2, color: "bg-yellow-500/10 text-yellow-600" },
  sent: { label: "Sent", icon: CheckCircle, color: "bg-green-500/10 text-green-600" },
  failed: { label: "Failed", icon: AlertCircle, color: "bg-red-500/10 text-red-600" },
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch("/api/marketing/campaigns");
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaigns();
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
    totalSent: campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
    avgOpenRate: campaigns.filter((c) => c.status === "sent").length > 0
      ? (campaigns.filter((c) => c.status === "sent").reduce((sum, c) => sum + (c.openRate || 0), 0) / 
         campaigns.filter((c) => c.status === "sent").length).toFixed(1)
      : "0.0",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
                Email campaigns and member communication
              </p>
            </div>
            <Link href="/marketing/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
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
                {stats.draft} draft, {stats.sent} sent
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
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className={`h-3 w-3 mr-1 ${campaign.status === "sending" ? "animate-spin" : ""}`} />
                              {statusConfig.label}
                            </Badge>
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
      </main>
    </div>
  );
}
