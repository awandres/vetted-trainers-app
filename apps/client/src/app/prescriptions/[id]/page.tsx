"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from "@vt/ui";
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  Play,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  Loader2,
  StretchHorizontal,
  Repeat,
  Sparkles,
  Move,
  Clock,
  Hash,
  Timer,
} from "lucide-react";

// Types
interface Exercise {
  id: string;
  name: string;
  category: string;
  bodyArea: string | null;
  description: string | null;
  cues: string[];
  videoUrl: string | null;
  thumbnailUrl: string | null;
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
  status: string;
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  trainerName: string | null;
  exercises: Exercise[];
}

// Category config
const CATEGORIES: Record<string, { label: string; icon: typeof Dumbbell; color: string }> = {
  release: { label: "Release", icon: Dumbbell, color: "bg-red-500/10 text-red-600" },
  stretch: { label: "Stretch", icon: StretchHorizontal, color: "bg-blue-500/10 text-blue-600" },
  sequence: { label: "Sequence", icon: Repeat, color: "bg-purple-500/10 text-purple-600" },
  activation: { label: "Activation", icon: Sparkles, color: "bg-orange-500/10 text-orange-600" },
  mobility: { label: "Mobility", icon: Move, color: "bg-green-500/10 text-green-600" },
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
  const prescriptionId = params.id as string;
  const { member, isLoading: authLoading } = useAuth();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set([0])); // First expanded by default

  useEffect(() => {
    async function fetchPrescription() {
      try {
        const res = await fetch(`/api/prescriptions/${prescriptionId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 404) {
            setError("Prescription not found");
          } else if (res.status === 403) {
            setError("You don't have access to this prescription");
          } else {
            setError("Failed to load prescription");
          }
          return;
        }
        const data = await res.json();
        setPrescription(data.prescription);
      } catch (err) {
        setError("Failed to load prescription");
      } finally {
        setIsLoading(false);
      }
    }

    if (member && prescriptionId) {
      fetchPrescription();
    }
  }, [member, prescriptionId]);

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

  const expandAll = () => {
    if (!prescription) return;
    setExpandedExercises(new Set(prescription.exercises.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedExercises(new Set());
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading || isLoading) {
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
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{error || "Prescription not found"}</h2>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
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
                  {prescription.name || "Exercise Prescription"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {prescription.exercises.length} exercises
                  {prescription.trainerName && ` • From ${prescription.trainerName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Prescription Info */}
        {prescription.notes && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes from Your Trainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {prescription.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Exercises */}
        <div className="space-y-4">
          {prescription.exercises.map((exercise, index) => {
            const config = CATEGORIES[exercise.category] || CATEGORIES.mobility;
            const Icon = config.icon;
            const isExpanded = expandedExercises.has(index);
            const videoId = getYouTubeVideoId(exercise.videoUrl);

            return (
              <Card key={exercise.id} className="overflow-hidden">
                {/* Exercise Header - Always visible */}
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExercise(index)}
                >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        {exercise.bodyArea && (
                          <Badge variant="secondary" className="capitalize">
                            {exercise.bodyArea.replace("_", " ")}
                          </Badge>
                        )}
                        {videoId && (
                          <Badge variant="outline" className="gap-1">
                            <Play className="h-3 w-3" />
                            Video
                          </Badge>
                        )}
                      </div>

                      {/* Parameters Row */}
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        {exercise.sets && (
                          <div className="flex items-center gap-1 text-sm">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{exercise.sets}</span>
                            <span className="text-muted-foreground">sets</span>
                          </div>
                        )}
                        {exercise.reps && (
                          <div className="flex items-center gap-1 text-sm">
                            <Repeat className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{exercise.reps}</span>
                            <span className="text-muted-foreground">reps</span>
                          </div>
                        )}
                        {exercise.duration && (
                          <div className="flex items-center gap-1 text-sm">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{exercise.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                {isExpanded && (
                  <CardContent className="pt-0 border-t">
                    <div className="space-y-6 mt-4">
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
                          <h4 className="font-medium mb-2">How to do it</h4>
                          <p className="text-sm text-muted-foreground">
                            {exercise.description}
                          </p>
                        </div>
                      )}

                      {/* Coaching Cues */}
                      {exercise.cues && exercise.cues.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Key Points</h4>
                          <div className="grid gap-2">
                            {exercise.cues.map((cue, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 bg-muted/50 rounded-lg p-3"
                              >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                  {i + 1}
                                </span>
                                <span className="text-sm">{cue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trainer Notes */}
                      {exercise.exerciseNotes && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                            Trainer's Note
                          </h4>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300">
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

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Received {formatDate(prescription.sentAt)}
            {prescription.trainerName && ` from ${prescription.trainerName}`}
          </p>
          <p className="mt-1">
            Questions? Contact your trainer directly.
          </p>
        </div>
      </main>
    </div>
  );
}
