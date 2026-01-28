"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Checkbox,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Separator,
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
  Activity,
  Send,
  Eye,
  Trash2,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";

// Types
interface VTExercise {
  id: string;
  name: string;
  category: string;
  bodyArea: string | null;
  videoUrl: string | null;
}

interface VTMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface VTPrescription {
  id: string;
  memberId: string;
  memberFirstName: string | null;
  memberLastName: string | null;
  memberEmail: string | null;
  status: "draft" | "sent" | "viewed";
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
  exercises: Array<{
    id: string;
    name: string;
    category: string;
    orderIndex: number;
  }>;
}

// Status badge
function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { label: "Draft", className: "bg-gray-500/10 text-gray-600", icon: FileText },
    sent: { label: "Sent", className: "bg-blue-500/10 text-blue-600", icon: Send },
    viewed: { label: "Viewed", className: "bg-green-500/10 text-green-600", icon: Eye },
  }[status] || { label: status, className: "", icon: FileText };

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Category badge
function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    release: "bg-red-500/10 text-red-600",
    stretch: "bg-blue-500/10 text-blue-600",
    sequence: "bg-purple-500/10 text-purple-600",
    activation: "bg-orange-500/10 text-orange-600",
    mobility: "bg-green-500/10 text-green-600",
  };

  return (
    <Badge variant="outline" className={colors[category] || ""}>
      {category}
    </Badge>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Prescription Builder Dialog
function PrescriptionBuilderDialog({
  open,
  onOpenChange,
  members,
  exercises,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: VTMember[];
  exercises: VTExercise[];
  onSave: (data: { memberId: string; exerciseIds: string[]; notes: string }) => Promise<void>;
  isLoading: boolean;
}) {
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<VTExercise[]>([]);
  const [notes, setNotes] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (open) {
      setSelectedMember("");
      setSelectedExercises([]);
      setNotes("");
      setExerciseSearch("");
      setCategoryFilter("all");
    }
  }, [open]);

  const filteredExercises = exercises.filter((exercise) => {
    if (exerciseSearch && !exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())) return false;
    if (categoryFilter !== "all" && exercise.category !== categoryFilter) return false;
    return true;
  });

  const toggleExercise = (exercise: VTExercise) => {
    if (selectedExercises.find((e) => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter((e) => e.id !== exercise.id));
    } else if (selectedExercises.length < 5) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const handleSubmit = async () => {
    await onSave({
      memberId: selectedMember,
      exerciseIds: selectedExercises.map((e) => e.id),
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Mobility Prescription</DialogTitle>
          <DialogDescription>Select a member and up to 5 exercises</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Member Selection */}
          <div className="grid gap-2">
            <Label>Select Member *</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger><SelectValue placeholder="Choose a member..." /></SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                    {member.email && <span className="text-muted-foreground ml-2">({member.email})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Exercises */}
          {selectedExercises.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Exercises ({selectedExercises.length}/5)</Label>
              <div className="flex flex-wrap gap-2">
                {selectedExercises.map((exercise, index) => (
                  <Badge key={exercise.id} variant="secondary" className="py-1.5 px-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{index + 1}.</span>
                    {exercise.name}
                    <button onClick={() => setSelectedExercises(selectedExercises.filter((e) => e.id !== exercise.id))} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Exercise Selection */}
          <div className="space-y-4">
            <Label>Add Exercises</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="sequence">Sequence</SelectItem>
                  <SelectItem value="activation">Activation</SelectItem>
                  <SelectItem value="mobility">Mobility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-md max-h-60 overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No exercises found</div>
              ) : (
                <div className="divide-y">
                  {filteredExercises.map((exercise) => {
                    const isSelected = selectedExercises.some((e) => e.id === exercise.id);
                    const isDisabled = !isSelected && selectedExercises.length >= 5;

                    return (
                      <div
                        key={exercise.id}
                        className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer ${isDisabled ? "opacity-50" : ""}`}
                        onClick={() => !isDisabled && toggleExercise(exercise)}
                      >
                        <Checkbox checked={isSelected} disabled={isDisabled} />
                        <div className="flex-1">
                          <p className="font-medium">{exercise.name}</p>
                        </div>
                        <CategoryBadge category={exercise.category} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedMember || selectedExercises.length === 0}>
            {isLoading ? "Creating..." : "Create Prescription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<VTPrescription[]>([]);
  const [members, setMembers] = useState<VTMember[]>([]);
  const [exercises, setExercises] = useState<VTExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [prescriptionsRes, membersRes, exercisesRes] = await Promise.all([
          fetch("/api/prescriptions"),
          fetch("/api/members"),
          fetch("/api/exercises"),
        ]);

        const [prescriptionsData, membersData, exercisesData] = await Promise.all([
          prescriptionsRes.json(),
          membersRes.json(),
          exercisesRes.json(),
        ]);

        setPrescriptions(prescriptionsData.prescriptions || []);
        setMembers(membersData.members || []);
        setExercises(exercisesData.exercises || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreate = async (data: { memberId: string; exerciseIds: string[]; notes: string }) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create prescription");
      
      // Refetch prescriptions
      const prescriptionsRes = await fetch("/api/prescriptions");
      const prescriptionsData = await prescriptionsRes.json();
      setPrescriptions(prescriptionsData.prescriptions || []);
      setDialogOpen(false);
    } catch (err) {
      console.error("Error creating prescription:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async (id: string) => {
    try {
      const res = await fetch(`/api/prescriptions/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send");
      setPrescriptions(prescriptions.map((p) => 
        p.id === id ? { ...p, status: "sent" as const, sentAt: new Date().toISOString() } : p
      ));
    } catch (err) {
      console.error("Error sending prescription:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/prescriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPrescriptions(prescriptions.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting prescription:", err);
    }
  };

  const stats = {
    total: prescriptions.length,
    draft: prescriptions.filter((p) => p.status === "draft").length,
    sent: prescriptions.filter((p) => p.status === "sent").length,
    viewed: prescriptions.filter((p) => p.status === "viewed").length,
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Mobility Prescriptions</h1>
            <p className="text-muted-foreground">Create and send exercise prescriptions</p>
          </div>
        </div>
        <Link href="/prescriptions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.draft}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.sent}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viewed</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.viewed}</div></CardContent>
        </Card>
      </div>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
          <CardDescription>Manage mobility prescriptions for members</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-lg font-medium">Error loading prescriptions</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No prescriptions yet</p>
              <Link href="/prescriptions/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />Create Prescription
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription</TableHead>
                    <TableHead>Exercises</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow 
                      key={prescription.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => window.location.href = `/prescriptions/${prescription.id}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{prescription.name || "Mobility Prescription"}</p>
                          <p className="text-sm text-muted-foreground">
                            {prescription.memberFirstName} {prescription.memberLastName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {prescription.exercises.slice(0, 3).map((ex) => (
                            <Badge key={ex.id} variant="secondary" className="text-xs">{ex.name}</Badge>
                          ))}
                          {prescription.exercises.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{prescription.exercises.length - 3} more</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(prescription.createdAt)}</TableCell>
                      <TableCell><StatusBadge status={prescription.status} /></TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {prescription.status === "draft" && (
                            <Button variant="ghost" size="sm" onClick={() => handleSend(prescription.id)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(prescription.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PrescriptionBuilderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        members={members}
        exercises={exercises}
        onSave={handleCreate}
        isLoading={isSaving}
      />
    </div>
  );
}
