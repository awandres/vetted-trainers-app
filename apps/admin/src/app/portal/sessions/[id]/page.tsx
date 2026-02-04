"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@vt/ui";
import {
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  CheckCircle,
  FileText,
  Dumbbell,
} from "lucide-react";

interface SessionDetail {
  id: string;
  sessionDate: string | null;
  sessionType: string | null;
  notes: string | null;
  trainerName: string | null;
  sessionValue: string | null;
}

export default function PortalSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/portal/sessions/${id}`, { credentials: "include" });
        if (!res.ok) {
          setError(res.status === 404 ? "Session not found" : "Failed to load session");
          return;
        }
        const data = await res.json();
        setSession(data.session);
      } catch (err) {
        setError("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSessionTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      in_gym: "In-Gym Training",
      ninety_minute: "90-Minute Session",
      release: "Release Session",
    };
    return type ? labels[type] || type : "Training Session";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-4 lg:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-[#353840] border-[#454850]">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-lg text-white">{error || "Session not found"}</p>
            <Link href="/portal/sessions">
              <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb]">View All Sessions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-400 hover:text-white">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sessions
      </Button>

      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">{getSessionTypeLabel(session.sessionType)}</CardTitle>
                <CardDescription className="text-gray-400 text-lg">{formatDate(session.sessionDate)}</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Completed</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-[#3b82f6]" />
              Trainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-white">{session.trainerName || "Your Trainer"}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-[#3b82f6]" />
              Session Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-white">{getSessionTypeLabel(session.sessionType)}</p>
          </CardContent>
        </Card>
      </div>

      {session.notes && (
        <Card className="bg-[#353840] border-[#454850] mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#3b82f6]" />
              Session Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 whitespace-pre-wrap">{session.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
