"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vt/ui";
import {
  ArrowLeft,
  Search,
  Plus,
  User,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  UserCog,
} from "lucide-react";

interface VTTrainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  sessionRate: number;
  nonSessionRate: number;
  isActive: boolean;
  bio: string | null;
  specializations: string[];
  certifications: string[];
  imageUrl: string | null;
  createdAt: string;
}

function formatRate(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<VTTrainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/trainers");
        if (!res.ok) throw new Error("Failed to fetch trainers");
        const data = await res.json();
        setTrainers(data.trainers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredTrainers = trainers.filter((trainer) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${trainer.firstName} ${trainer.lastName}`.toLowerCase();
      const email = trainer.email?.toLowerCase() || "";
      if (!fullName.includes(query) && !email.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const activeCount = trainers.filter((t) => t.isActive).length;

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Trainers</h1>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Error loading trainers</p>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Trainers</h1>
              <p className="text-muted-foreground">
                Manage trainer profiles, rates, and performance
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Trainer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trainers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trainers ({filteredTrainers.length})</CardTitle>
            <CardDescription>
              Click on a trainer to view details and manage their profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No trainers found</p>
                <p className="text-muted-foreground">
                  {trainers.length === 0
                    ? "Add trainers to get started"
                    : "Try adjusting your search"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Session Rate</TableHead>
                      <TableHead>Non-Session Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrainers.map((trainer) => (
                      <TableRow key={trainer.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {trainer.imageUrl ? (
                                <img
                                  src={trainer.imageUrl}
                                  alt={`${trainer.firstName} ${trainer.lastName}`}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {trainer.firstName} {trainer.lastName}
                              </p>
                              {trainer.specializations && trainer.specializations.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  {trainer.specializations.slice(0, 2).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {trainer.email && (
                              <p className="text-sm flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {trainer.email}
                              </p>
                            )}
                            {trainer.phone && (
                              <p className="text-sm flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {trainer.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatRate(trainer.sessionRate)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatRate(trainer.nonSessionRate)}/hr</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={trainer.isActive ? "default" : "secondary"}
                            className={trainer.isActive ? "bg-green-500/10 text-green-600" : ""}
                          >
                            {trainer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/trainers/${trainer.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
