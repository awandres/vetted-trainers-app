"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Trash2,
  Edit,
  Copy,
  Play,
  ExternalLink,
  User,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Dumbbell,
  StretchHorizontal,
  Repeat,
  Sparkles,
  Move,
  Loader2,
  Mail,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from "@vt/ui";

// Types
interface PrescriptionExercise {
  id: string;
  name: string;
  category: string;
  bodyArea: string | null;
  description: string | null;
  cues: string[];
  videoUrl: string | null;
  sets: number | null;
  reps: string | null;
  duration: string | null;
  exerciseNotes: string | null;
  orderIndex: number;
}

interface Prescription {
  id: string;
  name: string | null;
  notes: string | null;
  status: "draft" | "sent" | "viewed";
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  memberId: string;
  memberFirstName: string | null;
  memberLastName: string | null;
  memberEmail: string | null;
  trainerName: string | null;
  exercises: PrescriptionExercise[];
}

// Category config
const CATEGORIES: Record<string, { label: string; icon: typeof Dumbbell; color: string }> = {
  release: { label: "Release", icon: Dumbbell, color: "bg-red-500/10 text-red-600" },
  stretch: { label: "Stretch", icon: StretchHorizontal, color: "bg-blue-500/10 text-blue-600" },
  sequence: { label: "Sequence", icon: Repeat, color: "bg-purple-500/10 text-purple-600" },
  activation: { label: "Activation", icon: Sparkles, color: "bg-orange-500/10 text-orange-600" },
  mobility: { label: "Mobility", icon: Move, color: "bg-green-500/10 text-green-600" },
};

// Status config
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-500/10 text-gray-600", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-500/10 text-blue-600", icon: Send },
  viewed: { label: "Viewed", color: "bg-green-500/10 text-green-600", icon: CheckCircle },
};

// Helper to get YouTube video ID
function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prescriptionId = params.id as string;

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchPrescription() {
      try {
        const res = await fetch(`/api/prescriptions/${prescriptionId}`);
        if (!res.ok) throw new Error("Failed to fetch prescription");
        const data = await res.json();
        setPrescription(data.prescription);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (prescriptionId) {
      fetchPrescription();
    }
  }, [prescriptionId]);

  const handleSend = async () => {
    if (!prescription) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}/send`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      setPrescription({ ...prescription, status: "sent", sentAt: new Date().toISOString() });
      alert(data.message || "Prescription sent!");
    } catch (err) {
      console.error("Error sending prescription:", err);
      alert("Failed to send prescription");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!prescription || !confirm("Are you sure you want to delete this prescription?")) return;
    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/prescriptions");
    } catch (err) {
      console.error("Error deleting prescription:", err);
      alert("Failed to delete prescription");
    }
  };

  const toggleExercise = (index: number) => {
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
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

  if (error || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">
            {error || "Prescription not found"}
          </p>
          <Link href="/prescriptions">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prescriptions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[prescription.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/prescriptions">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">
                  {prescription.name || "Mobility Prescription"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={statusConfig.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {prescription.exercises.length} exercises
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {prescription.status === "draft" && (
                <Button onClick={handleSend} disabled={isSending}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send to Client
                </Button>
              )}
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Exercises */}
          <div className="lg:col-span-2 space-y-4">
            {prescription.exercises.map((exercise, index) => {
              const config = CATEGORIES[exercise.category] || CATEGORIES.mobility;
              const Icon = config.icon;
              const isExpanded = expandedExercises.has(index);
              const videoId = getYouTubeVideoId(exercise.videoUrl);

              return (
                <Card key={exercise.id} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExercise(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          {exercise.bodyArea && (
                            <Badge variant="secondary">
                              {exercise.bodyArea.replace("_", " ")}
                            </Badge>
                          )}
                          {exercise.videoUrl && (
                            <Badge variant="outline" className="gap-1">
                              <Play className="h-3 w-3" />
                              Video
                            </Badge>
                          )}
                        </div>
                        {/* Parameters */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          {exercise.sets && (
                            <span className="text-muted-foreground">
                              <strong>{exercise.sets}</strong> sets
                            </span>
                          )}
                          {exercise.reps && (
                            <span className="text-muted-foreground">
                              <strong>{exercise.reps}</strong> reps
                            </span>
                          )}
                          {exercise.duration && (
                            <span className="text-muted-foreground">
                              <strong>{exercise.duration}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 border-t">
                      <div className="space-y-4 mt-4">
                        {/* Video */}
                        {videoId && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                              title={exercise.name}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}

                        {/* Description */}
                        {exercise.description && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.description}
                            </p>
                          </div>
                        )}

                        {/* Coaching Cues */}
                        {exercise.cues && exercise.cues.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Coaching Cues</h4>
                            <ul className="space-y-2">
                              {exercise.cues.map((cue, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 text-sm bg-muted/50 rounded-md p-3"
                                >
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                    {i + 1}
                                  </span>
                                  <span className="text-muted-foreground">{cue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Exercise Notes */}
                        {exercise.exerciseNotes && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                              {exercise.exerciseNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Right: Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {prescription.memberFirstName} {prescription.memberLastName}
                </p>
                {prescription.memberEmail && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {prescription.memberEmail}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Status & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{formatDate(prescription.createdAt)}</span>
                </div>
                {prescription.sentAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sent</span>
                    <span className="text-sm">{formatDate(prescription.sentAt)}</span>
                  </div>
                )}
                {prescription.viewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Viewed</span>
                    <span className="text-sm">{formatDate(prescription.viewedAt)}</span>
                  </div>
                )}
                {prescription.trainerName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">By</span>
                    <span className="text-sm">{prescription.trainerName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {prescription.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {prescription.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
