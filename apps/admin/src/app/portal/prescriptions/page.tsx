"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@vt/ui";
import {
  Dumbbell,
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  Send,
  Eye,
} from "lucide-react";

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

export default function PortalPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        const res = await fetch("/api/portal/prescriptions", { credentials: "include" });
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
    fetchPrescriptions();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-[#3b82f6]" />
          My Prescriptions
        </h1>
        <p className="text-gray-400 mt-1">Your exercise routines and workout plans</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </div>
      ) : prescriptions.length === 0 ? (
        <Card className="bg-[#353840] border-[#454850]">
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">No prescriptions yet</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Your trainer will send you personalized exercise plans. They'll appear here when ready.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription) => {
            const isNew = prescription.status === "sent";
            return (
              <Link key={prescription.id} href={`/portal/prescriptions/${prescription.id}`}>
                <Card className="h-full hover:bg-[#3a3d46] transition-colors cursor-pointer relative overflow-hidden bg-[#353840] border-[#454850]">
                  {isNew && (
                    <div className="absolute top-0 right-0 bg-[#3b82f6] text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                      NEW
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[#3b82f6]/10 p-3 flex-shrink-0">
                        <Dumbbell className="h-6 w-6 text-[#3b82f6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate text-white">
                          {prescription.name || "Exercise Prescription"}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {prescription.exerciseCount} exercises
                        </CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {prescription.notes && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4">{prescription.notes}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {formatDate(prescription.sentAt)}
                      </div>
                      <Badge className={isNew ? "bg-[#3b82f6] text-white" : "bg-[#454850] text-gray-300"}>
                        {isNew ? <><Send className="h-3 w-3 mr-1" />New</> : <><Eye className="h-3 w-3 mr-1" />Viewed</>}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
