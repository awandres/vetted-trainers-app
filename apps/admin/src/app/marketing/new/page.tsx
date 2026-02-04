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
  Zap,
  FolderOpen,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
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

interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  templateType: string;
  templateData: Record<string, unknown>;
  usageCount: number;
  createdAt: string;
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
  
  // Template state
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  
  // Preview state
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Generate preview when content changes
  useEffect(() => {
    const generatePreview = async () => {
      if (!headline && !bodyContent) {
        setPreviewHtml("");
        return;
      }

      setIsLoadingPreview(true);
      try {
        // Create a temporary campaign to get the preview
        const res = await fetch("/api/marketing/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateType,
            templateData: getTemplateData(),
            name: name || "Preview",
            previewText: previewText || "",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setPreviewHtml(data.html);
        }
      } catch (err) {
        console.error("Error generating preview:", err);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    // Debounce the preview generation
    const timeoutId = setTimeout(generatePreview, 500);
    return () => clearTimeout(timeoutId);
  }, [headline, bodyContent, ctaText, ctaUrl, templateType, offerAmount, offerDescription, promoCode, name, previewText]);

  // Fetch audience segments and templates
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

    async function fetchTemplates() {
      try {
        const res = await fetch("/api/marketing/templates");
        if (res.ok) {
          const data = await res.json();
          setEmailTemplates(data.templates || []);
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    }

    fetchSegments();
    fetchTemplates();
  }, []);

  const selectedSegment = segments.find((s) => s.type === audienceType);

  // Build template data based on type
  const getTemplateData = () => {
    const base = {
      // Campaign metadata
      subject,
      previewText,
      // Email content
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

  // Load a saved template
  const handleLoadTemplate = (template: EmailTemplate) => {
    setTemplateType(template.templateType);
    
    const data = template.templateData as Record<string, string>;
    
    // Set campaign name from template name
    setName(template.name);
    
    // Set subject and preview text
    setSubject(data.subject || "");
    setPreviewText(data.previewText || "");
    
    // Set email content
    setHeadline(data.headline || "");
    setBodyContent(data.bodyContent || "");
    setCtaText(data.ctaText || "");
    setCtaUrl(data.ctaUrl || "");
    
    // Promotion-specific fields
    if (template.templateType === "promotion") {
      setOfferAmount(data.offerAmount || "");
      setOfferDescription(data.offerDescription || "");
      setPromoCode(data.promoCode || "");
    }
    
    // Close modal
    setShowLoadTemplateModal(false);
  };

  // Save current content as template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    setIsSavingTemplate(true);

    try {
      const res = await fetch("/api/marketing/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          templateType,
          templateData: getTemplateData(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save template");
      
      const data = await res.json();
      setEmailTemplates((prev) => [data.template, ...prev]);
      
      alert("Template saved successfully!");
      setShowSaveTemplateModal(false);
      setTemplateName("");
      setTemplateDescription("");
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Dev Autofill - populate form with sample data
  const handleDevAutofill = () => {
    const sampleCampaigns = [
      {
        name: "February Fitness Challenge",
        subject: "💪 Join Our 30-Day Fitness Challenge!",
        previewText: "Transform your body this month with our guided program",
        headline: "Ready to Transform Your Fitness?",
        bodyContent: `Hi there!

We're excited to announce our February Fitness Challenge! 

Over the next 30 days, you'll get:
• Daily workout plans tailored to your level
• Nutrition tips from our expert trainers  
• Weekly check-ins and progress tracking
• Access to our private challenge community

This is your chance to kickstart your fitness journey with the support of our amazing Vetted Trainers team.

Spots are limited - don't miss out!`,
        ctaText: "Join the Challenge",
        ctaUrl: "https://vettedtrainers.com/challenge",
      },
      {
        name: "New Year Promotion",
        subject: "🎉 New Year Special - 50% Off First Month!",
        previewText: "Start 2026 strong with personalized training",
        headline: "New Year, New You!",
        bodyContent: `Happy New Year!

To help you crush your 2026 fitness goals, we're offering an exclusive deal for our valued clients.

Get 50% off your first month of personal training!

Whether you want to:
• Build strength and muscle
• Lose weight and feel energized
• Improve mobility and flexibility
• Train for a specific goal

Our certified trainers are here to guide you every step of the way.

This offer expires January 31st!`,
        ctaText: "Claim Your Discount",
        ctaUrl: "https://vettedtrainers.com/promo",
        offerAmount: "50% OFF",
        offerDescription: "Your first month of training",
        promoCode: "NEWYEAR50",
      },
      {
        name: "Session Reminder Newsletter",
        subject: "📅 Quick Reminder About Your Upcoming Sessions",
        previewText: "Don't forget - we have great things planned for you",
        headline: "Your Training This Week",
        bodyContent: `Hey there!

Just a friendly reminder that you have training sessions coming up this week!

A few tips to make the most of your sessions:
• Get a good night's sleep before training
• Stay hydrated throughout the day
• Bring a positive attitude - we've got this!
• Don't forget your workout gear and water bottle

If you need to reschedule, just reach out to your trainer directly.

See you at the gym!`,
        ctaText: "View My Schedule",
        ctaUrl: "https://vettedtrainers.com/schedule",
      },
    ];

    // Pick a random sample
    const sample = sampleCampaigns[Math.floor(Math.random() * sampleCampaigns.length)];
    
    setName(sample.name);
    setSubject(sample.subject);
    setPreviewText(sample.previewText);
    setHeadline(sample.headline);
    setBodyContent(sample.bodyContent);
    setCtaText(sample.ctaText);
    setCtaUrl(sample.ctaUrl);
    
    // Set promotion fields if present
    if (sample.offerAmount) {
      setTemplateType("promotion");
      setOfferAmount(sample.offerAmount);
      setOfferDescription(sample.offerDescription || "");
      setPromoCode(sample.promoCode || "");
    } else if (sample.name.includes("Reminder")) {
      setTemplateType("reminder");
    } else {
      setTemplateType("newsletter");
    }
  };

  const handleTestSend = async () => {
    if (!testEmail.trim()) {
      alert("Please enter at least one email address");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter a subject line");
      return;
    }

    setIsSending(true);
    
    // Create temp campaign and send
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Untitled Campaign",
          subject,
          previewText,
          templateType,
          templateData: getTemplateData(),
          audienceType: "all",
        }),
      });

      if (!res.ok) throw new Error("Failed to create campaign");
      const data = await res.json();

      const sendRes = await fetch(`/api/marketing/campaigns/${data.campaign.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail }),
      });

      const sendData = await sendRes.json();
      
      if (!sendRes.ok) {
        throw new Error(sendData.error || "Failed to send email");
      }
      
      const emailCount = testEmail.split(",").filter((e: string) => e.trim()).length;
      alert(`✅ Email sent to ${emailCount} recipient(s)!\n\nSent to: ${sendData.sentTo?.join(", ") || testEmail}`);
      
      // Delete the temp campaign after sending
      await fetch(`/api/marketing/campaigns/${data.campaign.id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error sending:", err);
      alert(`Failed to send email: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSending(false);
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
                variant="ghost"
                onClick={handleDevAutofill}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Zap className="h-4 w-4 mr-2" />
                Dev Autofill
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLoadTemplateModal(true)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveTemplateModal(true)}
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save Template
              </Button>
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

            {/* Email Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Email Preview
                </CardTitle>
                <CardDescription>
                  Live preview of your email as recipients will see it
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Generating preview...
                  </div>
                ) : previewHtml ? (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-none"
                      style={{ height: "600px" }}
                      title="Email Preview"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16 text-muted-foreground border rounded-lg border-dashed">
                    <div className="text-center">
                      <Eye className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>Add content above to see a live preview</p>
                    </div>
                  </div>
                )}
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

            {/* Send Test Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send Test Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="sendEmail" className="text-sm">Recipient Email(s)</Label>
                <Input
                  id="sendEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email@example.com, another@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Enter one or more emails, separated by commas
                </p>
                <Button
                  className="w-full"
                  onClick={handleTestSend}
                  disabled={!testEmail.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isSending ? "Sending..." : "Send Email"}
                </Button>
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

      {/* Load Template Modal */}
      {showLoadTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Load Template
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoadTemplateModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Choose a saved template to start from
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              {emailTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No templates saved yet</p>
                  <p className="text-sm mt-1">Create a campaign and save it as a template to reuse</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailTemplates.map((template) => {
                    const templateData = template.templateData as Record<string, string>;
                    const isExpanded = expandedTemplateId === template.id;
                    
                    return (
                      <div
                        key={template.id}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {template.templateType}
                              </Badge>
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Used {template.usageCount} times
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleLoadTemplate(template)}
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                            {templateData.subject && (
                              <div>
                                <span className="font-medium">Subject:</span>{" "}
                                <span className="text-muted-foreground">{templateData.subject}</span>
                              </div>
                            )}
                            {templateData.previewText && (
                              <div>
                                <span className="font-medium">Preview Text:</span>{" "}
                                <span className="text-muted-foreground">{templateData.previewText}</span>
                              </div>
                            )}
                            {templateData.headline && (
                              <div>
                                <span className="font-medium">Headline:</span>{" "}
                                <span className="text-muted-foreground">{templateData.headline}</span>
                              </div>
                            )}
                            {templateData.bodyContent && (
                              <div>
                                <span className="font-medium">Body:</span>
                                <p className="text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">
                                  {templateData.bodyContent}
                                </p>
                              </div>
                            )}
                            {templateData.ctaText && (
                              <div>
                                <span className="font-medium">CTA:</span>{" "}
                                <span className="text-muted-foreground">{templateData.ctaText}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookmarkPlus className="h-5 w-5" />
                  Save as Template
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSaveTemplateModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Save this campaign's content for future use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Monthly Newsletter"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="templateDescription">Description (optional)</Label>
                <Textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of when to use this template"
                  rows={2}
                  className="mt-1"
                />
              </div>
              
              {/* Preview what will be saved */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Template Content:</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Type: {TEMPLATES.find(t => t.id === templateType)?.name}</p>
                  {subject && <p>Subject: {subject}</p>}
                  {previewText && <p>Preview: {previewText.slice(0, 40)}...</p>}
                  {headline && <p>Headline: {headline}</p>}
                  {bodyContent && <p>Body: {bodyContent.slice(0, 50)}...</p>}
                  {ctaText && <p>CTA: {ctaText}</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSaveTemplateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim() || isSavingTemplate}
                >
                  {isSavingTemplate ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                  )}
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
