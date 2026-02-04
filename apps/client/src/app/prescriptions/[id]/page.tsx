"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@vt/ui";
import {
  ArrowLeft,
  Dumbbell,
  Play,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  StretchHorizontal,
  Repeat,
  Sparkles,
  Move,
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
  release: { label: "Release", icon: Dumbbell, color: "bg-red-500/10 text-red-400" },
  stretch: { label: "Stretch", icon: StretchHorizontal, color: "bg-blue-500/10 text-blue-400" },
  sequence: { label: "Sequence", icon: Repeat, color: "bg-purple-500/10 text-purple-400" },
  activation: { label: "Activation", icon: Sparkles, color: "bg-orange-500/10 text-orange-400" },
  mobility: { label: "Mobility", icon: Move, color: "bg-green-500/10 text-green-400" },
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

export default function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: prescriptionId } = use(params);
  const router = useRouter();
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
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="p-4 lg:p-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-[#353840] border-[#454850]">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-lg text-white">{error || "Prescription not found"}</p>
            <Link href="/prescriptions">
              <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb]">
                Back to Prescriptions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Prescriptions
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={collapseAll}
            className="border-[#454850] text-gray-300 hover:bg-[#2a2d36]"
          >
            Collapse All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={expandAll}
            className="border-[#454850] text-gray-300 hover:bg-[#2a2d36]"
          >
            Expand All
          </Button>
        </div>
      </div>

      {/* Prescription Header */}
      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#3b82f6]/10 p-4">
              <Dumbbell className="h-8 w-8 text-[#3b82f6]" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">
                {prescription.name || "Exercise Prescription"}
              </CardTitle>
              <p className="text-gray-400 mt-1">
                {prescription.exercises.length} exercises
                {prescription.trainerName && ` • From ${prescription.trainerName}`}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prescription Notes */}
      {prescription.notes && (
        <Card className="bg-[#353840] border-[#454850] mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <FileText className="h-4 w-4 text-[#3b82f6]" />
              Notes from Your Trainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
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
            <Card key={exercise.id} className="overflow-hidden bg-[#353840] border-[#454850]">
              {/* Exercise Header - Always visible */}
              <CardHeader
                className="cursor-pointer hover:bg-[#3a3d46] transition-colors"
                onClick={() => toggleExercise(index)}
              >
                <div className="flex items-start gap-4">
                  {/* Number Badge */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3b82f6] text-white font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Exercise Info */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-white">{exercise.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className={`${config.color} border-0`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      {exercise.bodyArea && (
                        <Badge variant="secondary" className="capitalize bg-[#454850] text-gray-300">
                          {exercise.bodyArea.replace("_", " ")}
                        </Badge>
                      )}
                      {videoId && (
                        <Badge variant="outline" className="gap-1 border-[#454850] text-gray-300">
                          <Play className="h-3 w-3" />
                          Video
                        </Badge>
                      )}
                    </div>

                    {/* Parameters Row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {exercise.sets && (
                        <div className="flex items-center gap-1 text-sm">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-white">{exercise.sets}</span>
                          <span className="text-gray-400">sets</span>
                        </div>
                      )}
                      {exercise.reps && (
                        <div className="flex items-center gap-1 text-sm">
                          <Repeat className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-white">{exercise.reps}</span>
                          <span className="text-gray-400">reps</span>
                        </div>
                      )}
                      {exercise.duration && (
                        <div className="flex items-center gap-1 text-sm">
                          <Timer className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-white">{exercise.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="pt-0 border-t border-[#454850]">
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
                        <h4 className="font-medium mb-2 text-white">How to do it</h4>
                        <p className="text-sm text-gray-400">
                          {exercise.description}
                        </p>
                      </div>
                    )}

                    {/* Coaching Cues */}
                    {exercise.cues && exercise.cues.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-white">Key Points</h4>
                        <div className="grid gap-2">
                          {exercise.cues.map((cue, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 bg-[#2a2d36] rounded-lg p-3"
                            >
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center text-sm font-medium">
                                {i + 1}
                              </span>
                              <span className="text-sm text-gray-300">{cue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trainer Notes */}
                    {exercise.exerciseNotes && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-400 mb-1">
                          Trainer's Note
                        </h4>
                        <p className="text-sm text-yellow-300">
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
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>
          Received {formatDate(prescription.sentAt)}
          {prescription.trainerName && ` from ${prescription.trainerName}`}
        </p>
        <p className="mt-1">
          Questions? Contact your trainer directly.
        </p>
      </div>
    </div>
  );
}
