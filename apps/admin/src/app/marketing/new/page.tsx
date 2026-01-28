"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Users,
  Mail,
  FileText,
  Megaphone,
  Bell,
  Loader2,
  Check,
  Calendar,
  Clock,
  X,
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

// Types
interface AudienceSegment {
  type: string;
  label: string;
  count: number;
}

// Template options
const TEMPLATES = [
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Regular updates, tips, and announcements",
    icon: FileText,
  },
  {
    id: "promotion",
    name: "Promotion",
    description: "Special offers and discounts",
    icon: Megaphone,
  },
  {
    id: "reminder",
    name: "Reminder",
    description: "Session reminders and check-ins",
    icon: Bell,
  },
];

export default function NewCampaignPage() {
  const router = useRouter();
  
  // Form state
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [templateType, setTemplateType] = useState("newsletter");
  const [audienceType, setAudienceType] = useState("all");
  
  // Template content
  const [headline, setHeadline] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  
  // Promotion-specific
  const [offerAmount, setOfferAmount] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [promoCode, setPromoCode] = useState("");
  
  // Loading states
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [isLoadingSegments, setIsLoadingSegments] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  // Scheduling state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00");

  // Fetch audience segments
  useEffect(() => {
    async function fetchSegments() {
      try {
        const res = await fetch("/api/marketing/audience", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setSegments(data.segments || []);
        }
      } catch (err) {
        console.error("Error fetching segments:", err);
      } finally {
        setIsLoadingSegments(false);
      }
    }

    fetchSegments();
  }, []);

  const selectedSegment = segments.find((s) => s.type === audienceType);

  // Build template data based on type
  const getTemplateData = () => {
    const base = {
      headline,
      bodyContent,
      ctaText,
      ctaUrl,
    };

    if (templateType === "promotion") {
      return {
        ...base,
        offerAmount,
        offerDescription,
        promoCode,
      };
    }

    return base;
  };

  const handleSave = async (sendNow = false) => {
    if (!name.trim() || !subject.trim()) {
      alert("Please enter a campaign name and subject");
      return;
    }

    if (sendNow) {
      setIsSending(true);
    } else {
      setIsSaving(true);
    }

    try {
      // Create the campaign
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          previewText,
          templateType,
          templateData: getTemplateData(),
          audienceType,
        }),
      });

      if (!res.ok) throw new Error("Failed to create campaign");
      const data = await res.json();

      if (sendNow) {
        // Send the campaign
        const sendRes = await fetch(`/api/marketing/campaigns/${data.campaign.id}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!sendRes.ok) throw new Error("Failed to send campaign");
        
        alert("Campaign sent successfully!");
      }

      router.push("/marketing");
    } catch (err) {
      console.error("Error:", err);
      alert(sendNow ? "Failed to send campaign" : "Failed to save campaign");
    } finally {
      setIsSaving(false);
      setIsSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!name.trim() || !subject.trim()) {
      alert("Please enter a campaign name and subject");
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      alert("Please select a date and time");
      return;
    }

    // Combine date and time into ISO string
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    
    // Check if scheduled time is in the future
    if (new Date(scheduledAt) <= new Date()) {
      alert("Please select a future date and time");
      return;
    }

    setIsScheduling(true);

    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          previewText,
          templateType,
          templateData: getTemplateData(),
          audienceType,
          scheduledAt,
        }),
      });

      if (!res.ok) throw new Error("Failed to schedule campaign");
      
      const formattedDate = new Date(scheduledAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      
      alert(`Campaign scheduled for ${formattedDate}`);
      router.push("/marketing");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to schedule campaign");
    } finally {
      setIsScheduling(false);
      setShowScheduleModal(false);
    }
  };

  // Get minimum date for scheduling (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleTestSend = async () => {
    if (!testEmail.trim()) {
      alert("Please enter a test email address");
      return;
    }

    // Create temp campaign and send test
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `[TEST] ${name || "Untitled"}`,
          subject,
          previewText,
          templateType,
          templateData: getTemplateData(),
          audienceType: "all",
        }),
      });

      if (!res.ok) throw new Error("Failed to create test campaign");
      const data = await res.json();

      const sendRes = await fetch(`/api/marketing/campaigns/${data.campaign.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail }),
      });

      if (!sendRes.ok) throw new Error("Failed to send test");
      
      alert(`Test email sent to ${testEmail}`);
      
      // Delete the test campaign
      await fetch(`/api/marketing/campaigns/${data.campaign.id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error sending test:", err);
      alert("Failed to send test email");
    }
  };

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
                <h1 className="text-xl font-bold">New Campaign</h1>
                <p className="text-sm text-muted-foreground">
                  Create and send marketing emails
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving || isSending || isScheduling}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(true)}
                disabled={isSaving || isSending || isScheduling}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving || isSending || isScheduling}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Email Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., January Newsletter"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Internal name, not shown to recipients
                  </p>
                </div>
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Start the year strong 💪"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="preview">Preview Text</Label>
                  <Input
                    id="preview"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Text that appears after the subject in inbox"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Email Template</CardTitle>
                <CardDescription>Choose a template for your campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    const isSelected = templateType === template.id;

                    return (
                      <div
                        key={template.id}
                        onClick={() => setTemplateType(template.id)}
                        className={`
                          relative p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-muted-foreground/50"
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <Icon className={`h-8 w-8 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Main heading of the email"
                    className="mt-1"
                  />
                </div>

                {/* Promotion-specific fields */}
                {templateType === "promotion" && (
                  <>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="offerAmount">Offer Amount</Label>
                        <Input
                          id="offerAmount"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="e.g., 50% OFF"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="promoCode">Promo Code (optional)</Label>
                        <Input
                          id="promoCode"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="e.g., NEWYEAR50"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="offerDescription">Offer Description</Label>
                      <Input
                        id="offerDescription"
                        value={offerDescription}
                        onChange={(e) => setOfferDescription(e.target.value)}
                        placeholder="e.g., Your first month of training"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="bodyContent">Body Content</Label>
                  <Textarea
                    id="bodyContent"
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder="Write your email message here..."
                    rows={6}
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
                      placeholder="e.g., Learn More"
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

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Audience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Audience
                </CardTitle>
                <CardDescription>Who will receive this email</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSegments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {segments.map((segment) => (
                      <div
                        key={segment.type}
                        onClick={() => setAudienceType(segment.type)}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                          ${audienceType === segment.type
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          {audienceType === segment.type && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                          <span className="font-medium">{segment.label}</span>
                        </div>
                        <Badge variant="secondary">{segment.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSegment && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-center">
                      <span className="font-bold text-lg">{selectedSegment.count}</span>
                      <br />
                      <span className="text-muted-foreground">recipients</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Send */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Test Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTestSend}
                  disabled={!testEmail.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Preview your email before sending
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Keep subject lines under 50 characters</p>
                <p>• Personalize when possible</p>
                <p>• Use a clear call-to-action</p>
                <p>• Send at optimal times (Tues-Thurs, 10am)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Campaign
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
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
                <Label htmlFor="scheduleDate">Date</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={getMinDate()}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="scheduleTime">Time</Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
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
                      variant={scheduleTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScheduleTime(time)}
                    >
                      {time.replace(":00", "")}:00 {parseInt(time) < 12 ? "AM" : "PM"}
                    </Button>
                  ))}
                </div>
              </div>

              {scheduleDate && scheduleTime && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-center">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Campaign will be sent on{" "}
                    <span className="font-medium">
                      {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleDateString("en-US", {
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
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSchedule}
                  disabled={!scheduleDate || !scheduleTime || isScheduling}
                >
                  {isScheduling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
