"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@vt/ui";
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  CheckCircle,
  Send,
  Eye,
} from "lucide-react";

// Types
interface Prescription {
  id: string;
  name: string | null;
  notes: string | null;
  status: string;
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  exerciseCount: number;
}

export default function PrescriptionsPage() {
  const { member, isLoading: authLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        const res = await fetch("/api/prescriptions", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setPrescriptions(data.prescriptions || []);
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (member) {
      fetchPrescriptions();
    }
  }, [member]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                My Prescriptions
              </h1>
              <p className="text-sm text-muted-foreground">
                Your exercise routines and workout plans
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No prescriptions yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your trainer will send you personalized exercise plans and workout
              routines. They'll appear here when ready.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((prescription) => {
              const isNew = prescription.status === "sent";
              
              return (
                <Link
                  key={prescription.id}
                  href={`/prescriptions/${prescription.id}`}
                  className="block"
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                    {isNew && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                        NEW
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                          <Dumbbell className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {prescription.name || "Exercise Prescription"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span>{prescription.exerciseCount} exercises</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {prescription.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {prescription.notes}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(prescription.sentAt)}
                        </div>
                        <Badge 
                          variant={isNew ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {isNew ? (
                            <>
                              <Send className="h-3 w-3" />
                              New
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" />
                              Viewed
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
