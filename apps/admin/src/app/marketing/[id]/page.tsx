"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Trash2,
  Copy,
  Mail,
  Users,
  Eye,
  MousePointer,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  BarChart3,
  TrendingUp,
  Calendar,
  Edit,
  XCircle,
  X,
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
  Progress,
  Input,
  Label,
} from "@vt/ui";

// Types
interface Campaign {
  id: string;
  name: string;
  subject: string;
  previewText: string | null;
  templateType: string;
  templateData: Record<string, unknown>;
  audienceType: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailEvent {
  id: string;
  campaignId: string;
  recipientEmail: string;
  memberId: string | null;
  eventType: string;
  occurredAt: string;
}

// Status configuration
const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Edit, color: "bg-gray-500/10 text-gray-600" },
  scheduled: { label: "Scheduled", icon: Clock, color: "bg-blue-500/10 text-blue-600" },
  sending: { label: "Sending", icon: Loader2, color: "bg-yellow-500/10 text-yellow-600" },
  sent: { label: "Sent", icon: CheckCircle, color: "bg-green-500/10 text-green-600" },
  failed: { label: "Failed", icon: AlertCircle, color: "bg-red-500/10 text-red-600" },
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`/api/marketing/campaigns/${campaignId}`);
        if (!res.ok) throw new Error("Failed to fetch campaign");
        const data = await res.json();
        setCampaign(data.campaign);
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const handleSend = async () => {
    if (!campaign || !confirm("Are you sure you want to send this campaign?")) return;
    
    setIsSending(true);
    try {
      const res = await fetch(`/api/marketing/campaigns/${campaign.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      
      setCampaign(data.campaign);
      alert(`Campaign sent to ${data.sentCount} recipients!`);
    } catch (err) {
      console.error("Error sending campaign:", err);
      alert("Failed to send campaign");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!campaign || !confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      const res = await fetch(`/api/marketing/campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/marketing");
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert("Failed to delete campaign");
    }
  };

  const handleCancelSchedule = async () => {
    if (!campaign || !confirm("Are you sure you want to cancel this scheduled campaign?")) return;
    
    setIsCanceling(true);
    try {
      const res = await fetch(`/api/marketing/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft", scheduledAt: null }),
      });
      
      if (!res.ok) throw new Error("Failed to cancel");
      const data = await res.json();
      setCampaign({ ...campaign, ...data.campaign });
      alert("Schedule cancelled. Campaign moved to drafts.");
    } catch (err) {
      console.error("Error canceling schedule:", err);
      alert("Failed to cancel schedule");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReschedule = async () => {
    if (!campaign || !rescheduleDate || !rescheduleTime) return;
    
    const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
    
    if (new Date(scheduledAt) <= new Date()) {
      alert("Please select a future date and time");
      return;
    }

    setIsRescheduling(true);
    try {
      const res = await fetch(`/api/marketing/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled", scheduledAt }),
      });
      
      if (!res.ok) throw new Error("Failed to reschedule");
      const data = await res.json();
      setCampaign({ ...campaign, ...data.campaign });
      setShowRescheduleModal(false);
      
      const formattedDate = new Date(scheduledAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      alert(`Campaign rescheduled for ${formattedDate}`);
    } catch (err) {
      console.error("Error rescheduling:", err);
      alert("Failed to reschedule campaign");
    } finally {
      setIsRescheduling(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-medium">{error || "Campaign not found"}</p>
          <Link href="/marketing">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[campaign.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/marketing">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{campaign.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={statusConfig.color}>
                    <StatusIcon className={`h-3 w-3 mr-1 ${campaign.status === "sending" ? "animate-spin" : ""}`} />
                    {statusConfig.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {campaign.templateType} • {campaign.audienceType}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === "draft" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button onClick={handleSend} disabled={isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Now
                  </Button>
                </>
              )}
              {campaign.status === "scheduled" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelSchedule}
                    disabled={isCanceling}
                  >
                    {isCanceling ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Cancel Schedule
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {campaign.status === "sent" && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.sentCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  of {campaign.recipientCount.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.deliveredCount.toLocaleString()}</div>
                <Progress 
                  value={campaign.sentCount > 0 ? (campaign.deliveredCount / campaign.sentCount) * 100 : 0} 
                  className="h-1 mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Opened</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.openRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {campaign.openedCount.toLocaleString()} opens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicked</CardTitle>
                <MousePointer className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.clickRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {campaign.clickedCount.toLocaleString()} clicks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounced</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.bouncedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {campaign.unsubscribedCount} unsubscribed
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{campaign.subject}</p>
                </div>
                {campaign.previewText && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preview Text</p>
                    <p>{campaign.previewText}</p>
                  </div>
                )}
                {campaign.templateData && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Template Data</p>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(campaign.templateData, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            {events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest email events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.slice(0, 20).map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-mono text-sm">
                              {event.recipientEmail}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {event.eventType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(event.occurredAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{formatDate(campaign.createdAt)}</span>
                </div>
                {campaign.status === "scheduled" && campaign.scheduledAt && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Scheduled for</span>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(campaign.scheduledAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                {campaign.status === "sent" && campaign.scheduledAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Originally Scheduled</span>
                    <span className="text-sm">{formatDate(campaign.scheduledAt)}</span>
                  </div>
                )}
                {campaign.sentAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sent</span>
                    <span className="text-sm">{formatDate(campaign.sentAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audience Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Audience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Segment</span>
                    <Badge variant="secondary" className="capitalize">
                      {campaign.audienceType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recipients</span>
                    <span className="font-medium">{campaign.recipientCount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Comparison */}
            {campaign.status === "sent" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Open Rate</span>
                      <span className="font-medium">{campaign.openRate}%</span>
                    </div>
                    <Progress value={campaign.openRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Industry avg: 21%
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Click Rate</span>
                      <span className="font-medium">{campaign.clickRate}%</span>
                    </div>
                    <Progress value={campaign.clickRate * 4} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Industry avg: 2.5%
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {campaign.status === "scheduled" ? "Reschedule Campaign" : "Schedule Campaign"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Choose when to send this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rescheduleDate">Date</Label>
                <Input
                  id="rescheduleDate"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={getMinDate()}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rescheduleTime">Time</Label>
                <Input
                  id="rescheduleTime"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              {/* Quick time suggestions */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Suggested times:</p>
                <div className="flex flex-wrap gap-2">
                  {["09:00", "10:00", "12:00", "14:00", "18:00"].map((time) => (
                    <Button
                      key={time}
                      variant={rescheduleTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRescheduleTime(time)}
                    >
                      {time.replace(":00", "")}:00 {parseInt(time) < 12 ? "AM" : "PM"}
                    </Button>
                  ))}
                </div>
              </div>

              {rescheduleDate && rescheduleTime && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-center">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Campaign will be sent on{" "}
                    <span className="font-medium">
                      {new Date(`${rescheduleDate}T${rescheduleTime}`).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || isRescheduling}
                >
                  {isRescheduling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  {campaign.status === "scheduled" ? "Reschedule" : "Schedule"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
