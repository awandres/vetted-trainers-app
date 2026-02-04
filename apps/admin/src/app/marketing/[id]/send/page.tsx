"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Mail,
  Eye,
  CheckCircle,
  Users,
  Loader2,
  Plus,
  X,
  AlertCircle,
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
  Badge,
  Separator,
} from "@vt/ui";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  previewText: string | null;
  templateType: string;
}

type WizardStep = "recipients" | "preview" | "confirm";

export default function SendCampaignWizard() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [currentStep, setCurrentStep] = useState<WizardStep>("recipients");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ sentTo: string[]; failed?: { email: string; error: string }[] } | null>(null);

  // Recipients
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");

  // Load campaign and preview
  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch(`/api/marketing/campaigns/${campaignId}/preview`);
        if (!res.ok) throw new Error("Failed to load campaign");
        const data = await res.json();
        setCampaign(data.campaign);
        setPreviewHtml(data.html);
      } catch (err) {
        setError("Failed to load campaign");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const addRecipient = () => {
    const email = newEmail.trim().toLowerCase();
    if (email && !recipients.includes(email) && email.includes("@")) {
      setRecipients([...recipients, email]);
      setNewEmail("");
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      setError("Please add at least one recipient");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/marketing/campaigns/${campaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: recipients.join(",") }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send");
      }

      setSendResult({
        sentTo: data.sentTo || recipients,
        failed: data.failed,
      });
      setCurrentStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send campaign");
    } finally {
      setIsSending(false);
    }
  };

  const steps = [
    { id: "recipients", label: "Recipients", icon: Users },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "confirm", label: "Confirm & Send", icon: Send },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium">Campaign not found</p>
            <Link href="/marketing">
              <Button className="mt-4">Back to Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/marketing/${campaignId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Send Campaign</h1>
                <p className="text-sm text-muted-foreground">{campaign.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = 
              (currentStep === "preview" && step.id === "recipients") ||
              (currentStep === "confirm");
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isActive ? "bg-primary text-primary-foreground" : 
                  isCompleted ? "bg-primary/10 text-primary" : 
                  "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 mx-2 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === "recipients" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipients
              </CardTitle>
              <CardDescription>
                Add email addresses to send this campaign to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Email Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button onClick={addRecipient} disabled={!newEmail.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Recipients List */}
              {recipients.length > 0 ? (
                <div className="space-y-2">
                  <Label>Recipients ({recipients.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
                        <Mail className="h-3 w-3" />
                        {email}
                        <button
                          onClick={() => removeRecipient(email)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recipients added yet</p>
                  <p className="text-sm">Add email addresses above to send this campaign</p>
                </div>
              )}

              <Separator />

              {/* Campaign Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Campaign Details</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{campaign.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <Badge variant="outline">{campaign.templateType}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep("preview")} 
                  disabled={recipients.length === 0}
                >
                  Next: Preview
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "preview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Email Preview
                </CardTitle>
                <CardDescription>
                  Review how your email will appear to recipients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">To:</span> {recipients.join(", ")}</p>
                    <p><span className="text-muted-foreground">Subject:</span> {campaign.subject}</p>
                  </div>
                </div>

                {/* Email Preview Frame */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">Email Preview</span>
                  </div>
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border-0"
                    title="Email Preview"
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep("recipients")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep("confirm")}>
                    Next: Confirm
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "confirm" && !sendResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Confirm & Send
              </CardTitle>
              <CardDescription>
                Review and confirm your campaign details before sending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold text-lg">Ready to Send</h4>
                
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Recipients</p>
                      <p className="text-sm text-muted-foreground">
                        {recipients.length} email address{recipients.length !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Subject Line</p>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {recipients.map((email) => (
                    <Badge key={email} variant="secondary">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("preview")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSend} disabled={isSending}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isSending ? "Sending..." : "Send Campaign"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "confirm" && sendResult && (
          <Card>
            <CardContent className="pt-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold mb-2">Campaign Sent!</h2>
              <p className="text-muted-foreground mb-6">
                Your campaign has been successfully sent to {sendResult.sentTo.length} recipient{sendResult.sentTo.length !== 1 ? "s" : ""}.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium mb-2">Sent to:</h4>
                <div className="flex flex-wrap gap-2">
                  {sendResult.sentTo.map((email) => (
                    <Badge key={email} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {email}
                    </Badge>
                  ))}
                </div>

                {sendResult.failed && sendResult.failed.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-destructive">Failed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {sendResult.failed.map((item) => (
                        <Badge key={item.email} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <X className="h-3 w-3 mr-1" />
                          {item.email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Link href="/marketing">
                  <Button variant="outline">Back to Campaigns</Button>
                </Link>
                <Link href={`/marketing/${campaignId}`}>
                  <Button>View Campaign</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
