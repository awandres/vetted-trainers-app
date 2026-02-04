"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Zap,
  Mail,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
  Settings,
  Loader2,
  Trash2,
  Play,
  Pause,
  Send,
  History,
  FileText,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vt/ui";

interface EmailLog {
  id: string;
  recipientEmail: string;
  memberId: string | null;
  status: "pending" | "sent" | "failed";
  errorMessage: string | null;
  triggerData: Record<string, unknown> | null;
  triggeredAt: string;
  sentAt: string | null;
}

// Trigger options
const TRIGGERS = [
  { value: "session_booked", label: "Session Booked", icon: Calendar, description: "When a training session is scheduled" },
  { value: "session_reminder_24h", label: "24h Session Reminder", icon: Clock, description: "24 hours before a scheduled session" },
  { value: "session_reminder_1h", label: "1h Session Reminder", icon: Clock, description: "1 hour before a scheduled session" },
  { value: "session_completed", label: "Session Completed", icon: CheckCircle, description: "After a session is marked complete" },
  { value: "session_cancelled", label: "Session Cancelled", icon: XCircle, description: "When a session is cancelled" },
  { value: "session_rescheduled", label: "Session Rescheduled", icon: Calendar, description: "When a session time is changed" },
  { value: "prescription_sent", label: "Prescription Sent", icon: Mail, description: "When an exercise prescription is sent" },
  { value: "welcome_new_member", label: "Welcome New Member", icon: Users, description: "When a new member signs up" },
  { value: "membership_expiring", label: "Membership Expiring", icon: AlertCircle, description: "Before membership expires" },
  { value: "inactivity_reminder", label: "Inactivity Reminder", icon: Clock, description: "When member hasn't visited in X days" },
  { value: "birthday", label: "Birthday", icon: Bell, description: "On the member's birthday" },
];

const TRIGGER_MODES = [
  { value: "always", label: "Always Send", description: "This email will always be sent when triggered" },
  { value: "optional", label: "Optional", description: "Can be enabled/disabled per trainer or member" },
  { value: "disabled", label: "Disabled", description: "This email is currently disabled" },
];

interface AutomatedEmail {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  triggerMode: string;
  subject: string;
  previewText: string | null;
  templateType: string;
  templateData: Record<string, unknown> | null;
  isActive: boolean;
  testMode: boolean;
  testEmails: string | null;
  sentCount: number;
  lastSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AutomatedEmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("session_booked");
  const [triggerMode, setTriggerMode] = useState("optional");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [headline, setHeadline] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [testEmails, setTestEmails] = useState("");
  const [sentCount, setSentCount] = useState(0);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  
  // Logs state
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    async function fetchEmail() {
      try {
        const res = await fetch(`/api/marketing/automated/${emailId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Automated email not found");
            return;
          }
          throw new Error("Failed to fetch");
        }
        const data = await res.json();
        const email: AutomatedEmail = data.automatedEmail;

        setName(email.name);
        setDescription(email.description || "");
        setTrigger(email.trigger);
        setTriggerMode(email.triggerMode);
        setSubject(email.subject);
        setPreviewText(email.previewText || "");
        setIsActive(email.isActive);
        setTestMode(email.testMode || false);
        setTestEmails(email.testEmails || "");
        setSentCount(email.sentCount || 0);
        setLastSentAt(email.lastSentAt);

        // Parse template data
        const templateData = email.templateData || {};
        setHeadline((templateData.headline as string) || "");
        setBodyContent((templateData.bodyContent as string) || "");
        setCtaText((templateData.ctaText as string) || "");
        setCtaUrl((templateData.ctaUrl as string) || "");
      } catch (err) {
        console.error("Error fetching automated email:", err);
        setError("Failed to load automated email");
      } finally {
        setIsLoading(false);
      }
    }

    if (emailId) {
      fetchEmail();
      fetchLogs();
    }
  }, [emailId]);

  async function fetchLogs() {
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/marketing/automated/${emailId}/logs?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      alert("Please fill in name and subject");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/marketing/automated/${emailId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          trigger,
          triggerMode,
          subject,
          previewText,
          templateType: "reminder",
          templateData: {
            headline: headline || name,
            bodyContent,
            ctaText,
            ctaUrl,
          },
          isActive,
          testMode,
          testEmails: testEmails.trim() || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      alert("Saved successfully!");
    } catch (err) {
      console.error("Error saving:", err);
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this automated email?")) return;

    try {
      const res = await fetch(`/api/marketing/automated/${emailId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      router.push("/marketing");
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete");
    }
  };

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/marketing/automated/${emailId}/toggle`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to toggle");
      const data = await res.json();
      setIsActive(data.automatedEmail.isActive);
    } catch (err) {
      console.error("Error toggling:", err);
    }
  };

  const handleTestSend = async () => {
    const testTo = testEmails || prompt("Enter test email address:");
    if (!testTo) return;

    try {
      const res = await fetch("/api/marketing/automated/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger,
          recipientEmail: testTo.split(",")[0].trim(),
          recipientName: "Test User",
          data: {
            sessionDate: "Monday, February 10, 2026",
            sessionTime: "10:00 AM",
            trainerName: "Demo Trainer",
          },
        }),
      });

      const data = await res.json();
      if (data.triggered > 0) {
        alert(`Test email sent to ${testTo}!`);
      } else {
        alert("No emails triggered. Make sure this email is active.");
      }
    } catch (err) {
      console.error("Error sending test:", err);
      alert("Failed to send test email");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <Link href="/marketing">
            <Button className="mt-4">Back to Marketing</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedTrigger = TRIGGERS.find((t) => t.value === trigger);
  const TriggerIcon = selectedTrigger?.icon || Zap;

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
                  Back to Marketing
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Paused"}
                  </Badge>
                  {testMode && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                      🧪 Test Mode
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleTestSend}>
                <Send className="h-4 w-4 mr-2" />
                Test Send
              </Button>
              <Button variant="outline" onClick={handleToggleActive}>
                {isActive ? (
                  <><Pause className="h-4 w-4 mr-2" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Activate</>
                )}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <Button
              variant={activeTab === "details" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("details")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Details
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Send History
              {logs.length > 0 && (
                <Badge variant="secondary" className="ml-1">{logs.length}</Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {activeTab === "details" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sentCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Last Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {lastSentAt
                      ? new Date(lastSentAt).toLocaleDateString()
                      : "Never"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Email Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trigger Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Trigger Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {TRIGGERS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.value}
                        onClick={() => setTrigger(t.value)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          trigger === t.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${trigger === t.value ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium text-sm">{t.label}</p>
                            <p className="text-xs text-muted-foreground">{t.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Email Content */}
            <Card>
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="previewText">Preview Text</Label>
                  <Input
                    id="previewText"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bodyContent">Body Content</Label>
                  <Textarea
                    id="bodyContent"
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    rows={8}
                    className="mt-1"
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="ctaText">Button Text</Label>
                    <Input
                      id="ctaText"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaUrl">Button URL</Label>
                    <Input
                      id="ctaUrl"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Selected Trigger */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Trigger</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <TriggerIcon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">{selectedTrigger?.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedTrigger?.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trigger Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trigger Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TRIGGER_MODES.map((mode) => (
                  <div
                    key={mode.value}
                    onClick={() => setTriggerMode(mode.value)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      triggerMode === mode.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-sm">{mode.label}</p>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Test Mode */}
            <Card className={testMode ? "border-orange-500/50 bg-orange-500/5" : ""}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  🧪 Test Mode
                  {testMode && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                      Enabled
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => setTestMode(!testMode)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    testMode
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-gray-300 bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{testMode ? "Test Mode ON" : "Test Mode OFF"}</p>
                      <p className="text-xs text-muted-foreground">
                        {testMode ? "Emails go to test addresses only" : "Emails go to actual recipients"}
                      </p>
                    </div>
                    <Badge variant={testMode ? "default" : "secondary"} className={testMode ? "bg-orange-500" : ""}>
                      {testMode ? "TEST" : "LIVE"}
                    </Badge>
                  </div>
                </div>

                {testMode && (
                  <div>
                    <Label htmlFor="testEmails" className="text-sm">Test Email Address(es)</Label>
                    <Input
                      id="testEmails"
                      value={testEmails}
                      onChange={(e) => setTestEmails(e.target.value)}
                      placeholder="test@example.com"
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Send History
              </CardTitle>
              <CardDescription>
                Last 50 triggered sends for this automated email
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No emails sent yet</p>
                  <p className="text-sm mt-1">Emails will appear here when this automation is triggered</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Triggered</TableHead>
                        <TableHead>Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => {
                        const triggerData = log.triggerData || {};
                        const isTestMode = triggerData.testMode === true;
                        
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{log.recipientEmail}</p>
                                {isTestMode && triggerData.originalRecipient && (
                                  <p className="text-xs text-muted-foreground">
                                    Original: {triggerData.originalRecipient as string}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  log.status === "sent"
                                    ? "bg-green-500/10 text-green-600"
                                    : log.status === "failed"
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-yellow-500/10 text-yellow-600"
                                }
                              >
                                {log.status === "sent" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {log.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                                {log.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {log.status}
                              </Badge>
                              {log.errorMessage && (
                                <p className="text-xs text-red-500 mt-1 max-w-xs truncate">{log.errorMessage}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              {isTestMode ? (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                                  🧪 Test
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                                  Live
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(log.triggeredAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.sentAt
                                ? new Date(log.sentAt).toLocaleString()
                                : "—"}
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
        )}
      </main>
    </div>
  );
}
