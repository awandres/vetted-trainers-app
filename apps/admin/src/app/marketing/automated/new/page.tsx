"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Eye,
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
} from "@vt/ui";

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

export default function NewAutomatedEmailPage() {
  const router = useRouter();
  
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
  
  // Test mode
  const [testMode, setTestMode] = useState(true); // Default to test mode ON for safety
  const [testEmails, setTestEmails] = useState("");
  
  // Loading state
  const [isSaving, setIsSaving] = useState(false);
  
  // Preview state
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const handleSave = async () => {
    if (!name.trim() || !trigger || !subject.trim()) {
      alert("Please fill in name, trigger, and subject");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/marketing/automated", {
        method: "POST",
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
        throw new Error(error.error || "Failed to create automated email");
      }

      router.push("/marketing?tab=automated");
    } catch (err) {
      console.error("Error creating automated email:", err);
      alert(err instanceof Error ? err.message : "Failed to create automated email");
    } finally {
      setIsSaving(false);
    }
  };

  // Dev autofill
  const handleDevAutofill = () => {
    const samples = [
      {
        name: "Session Confirmation",
        trigger: "session_booked",
        subject: "Your Training Session is Confirmed! 💪",
        previewText: "We're excited to train with you",
        headline: "Session Confirmed!",
        bodyContent: `Hi {{name}}!

Great news - your training session has been confirmed!

📅 Date: {{sessionDate}}
⏰ Time: {{sessionTime}}
👤 Trainer: {{trainerName}}

A few reminders:
• Arrive 5-10 minutes early
• Bring a water bottle
• Wear comfortable workout clothes

See you at the gym!`,
        ctaText: "View My Schedule",
        ctaUrl: "https://vettedtrainers.com/my-sessions",
      },
      {
        name: "24h Session Reminder",
        trigger: "session_reminder_24h",
        subject: "Tomorrow: Your Training Session 🏋️",
        previewText: "Just a friendly reminder about your session",
        headline: "See You Tomorrow!",
        bodyContent: `Hi {{name}},

This is a friendly reminder that you have a training session scheduled for tomorrow!

📅 {{sessionDate}} at {{sessionTime}}
👤 With: {{trainerName}}

Tips for a great session:
• Get a good night's sleep
• Stay hydrated
• Have a light meal 1-2 hours before

We can't wait to see you!`,
        ctaText: "View Session Details",
        ctaUrl: "https://vettedtrainers.com/my-sessions",
      },
      {
        name: "Post-Session Follow Up",
        trigger: "session_completed",
        subject: "Great Session Today! 🎉",
        previewText: "How are you feeling after today's workout?",
        headline: "Amazing Work Today!",
        bodyContent: `Hi {{name}},

Congratulations on completing your training session today! 💪

{{trainerName}} was impressed with your effort. Keep up the great work!

Remember:
• Stay hydrated throughout the day
• Get plenty of rest tonight
• Follow any exercises your trainer prescribed

See you at your next session!`,
        ctaText: "Book Next Session",
        ctaUrl: "https://vettedtrainers.com/book",
      },
    ];

    const sample = samples[Math.floor(Math.random() * samples.length)];
    setName(sample.name);
    setTrigger(sample.trigger);
    setSubject(sample.subject);
    setPreviewText(sample.previewText);
    setHeadline(sample.headline);
    setBodyContent(sample.bodyContent);
    setCtaText(sample.ctaText);
    setCtaUrl(sample.ctaUrl);
    setTriggerMode("optional");
    setIsActive(true);
  };

  const selectedTrigger = TRIGGERS.find(t => t.value === trigger);
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
                  New Automated Email
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDevAutofill}>
                Dev Autofill
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                    placeholder="e.g., Session Confirmation Email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of when this email is sent"
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
                <CardDescription>
                  When should this email be automatically sent?
                </CardDescription>
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
                    placeholder="Your Training Session is Confirmed!"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{{name}}"} to personalize with member name
                  </p>
                </div>
                <div>
                  <Label htmlFor="previewText">Preview Text</Label>
                  <Input
                    id="previewText"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Short preview shown in inbox"
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
                    placeholder="Main heading in the email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bodyContent">Body Content</Label>
                  <Textarea
                    id="bodyContent"
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder="Write your email message here..."
                    rows={8}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available variables: {"{{name}}, {{trainerName}}, {{sessionDate}}, {{sessionTime}}"}
                  </p>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="ctaText">Button Text (Optional)</Label>
                    <Input
                      id="ctaText"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="View My Schedule"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaUrl">Button URL</Label>
                    <Input
                      id="ctaUrl"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://..."
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
                <CardDescription>How should this email behave?</CardDescription>
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

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onClick={() => setIsActive(!isActive)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isActive
                      ? "border-green-500 bg-green-500/10"
                      : "border-gray-300 bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{isActive ? "Active" : "Paused"}</p>
                      <p className="text-xs text-muted-foreground">
                        {isActive ? "Email will be sent when triggered" : "Email is paused"}
                      </p>
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "ON" : "OFF"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Mode */}
            <Card className={testMode ? "border-orange-500/50 bg-orange-500/5" : ""}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  🧪 Test Mode
                  {testMode && <Badge variant="outline" className="bg-orange-500/10 text-orange-600">Enabled</Badge>}
                </CardTitle>
                <CardDescription>
                  When enabled, emails only go to test addresses
                </CardDescription>
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
                        {testMode 
                          ? "Emails go to test addresses only" 
                          : "Emails go to actual recipients"}
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
                      placeholder="test@example.com, test2@example.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Comma-separated. All triggered emails will go here instead.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  💡 Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Use personalization like {"{{name}}"} for engagement</li>
                  <li>• Keep subject lines under 50 characters</li>
                  <li>• "Always" mode emails send regardless of preferences</li>
                  <li>• "Optional" emails can be toggled by trainers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
