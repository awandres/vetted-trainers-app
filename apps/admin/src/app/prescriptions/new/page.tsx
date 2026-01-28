"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Search,
  Save,
  Send,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Play,
  Filter,
  Loader2,
  User,
  FileText,
  Dumbbell,
  StretchHorizontal,
  Repeat,
  Sparkles,
  Move,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
  Label,
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
  Separator,
} from "@vt/ui";

// Types
interface VTExercise {
  id: string;
  name: string;
  category: "release" | "stretch" | "sequence" | "activation" | "mobility";
  bodyArea: string | null;
  description: string | null;
  cues: string[];
  videoUrl: string | null;
  difficultyLevel: number;
}

interface VTMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface PrescriptionExercise {
  id: string;
  exerciseId: string;
  exercise: VTExercise;
  sets: number;
  reps: string;
  duration: string;
  notes: string;
  orderIndex: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  trainerName: string | null;
  exerciseCount: number;
  exercises: Array<{
    id: string;
    name: string;
    category: string;
    bodyArea: string | null;
    videoUrl: string | null;
    orderIndex: number;
    sets: number | null;
    reps: string | null;
    duration: string | null;
    exerciseNotes: string | null;
  }>;
}

// Category config
const CATEGORIES = {
  release: { label: "Release", icon: Dumbbell, color: "bg-red-500/10 text-red-600" },
  stretch: { label: "Stretch", icon: StretchHorizontal, color: "bg-blue-500/10 text-blue-600" },
  sequence: { label: "Sequence", icon: Repeat, color: "bg-purple-500/10 text-purple-600" },
  activation: { label: "Activation", icon: Sparkles, color: "bg-orange-500/10 text-orange-600" },
  mobility: { label: "Mobility", icon: Move, color: "bg-green-500/10 text-green-600" },
};

// Small exercise card for the builder
function ExerciseBuilderCard({
  item,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdate,
  isFirst,
  isLast,
}: {
  item: PrescriptionExercise;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: (updates: Partial<PrescriptionExercise>) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORIES[item.exercise.category] || CATEGORIES.mobility;
  const Icon = config.icon;

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle & Order Controls */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center w-6 h-6 rounded bg-muted text-xs font-medium">
              {index + 1}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveDown}
              disabled={isLast}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{item.exercise.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${config.color}`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  {item.exercise.bodyArea && (
                    <Badge variant="secondary" className="text-xs">
                      {item.exercise.bodyArea.replace("_", " ")}
                    </Badge>
                  )}
                  {item.exercise.videoUrl && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Play className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Config Row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Sets:</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.sets}
                  onChange={(e) => onUpdate({ sets: parseInt(e.target.value) || 1 })}
                  className="w-16 h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Reps:</Label>
                <Input
                  value={item.reps}
                  onChange={(e) => onUpdate({ reps: e.target.value })}
                  placeholder="10-12"
                  className="w-20 h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Duration:</Label>
                <Input
                  value={item.duration}
                  onChange={(e) => onUpdate({ duration: e.target.value })}
                  placeholder="30s"
                  className="w-20 h-8 text-sm"
                />
              </div>
            </div>

            {/* Expanded Section */}
            {expanded && (
              <div className="mt-4 space-y-3 pt-3 border-t">
                {item.exercise.description && (
                  <p className="text-sm text-muted-foreground">{item.exercise.description}</p>
                )}
                {item.exercise.cues && item.exercise.cues.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Coaching Cues:</Label>
                    <ul className="mt-1 space-y-1">
                      {item.exercise.cues.map((cue, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span>
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Notes for client:</Label>
                  <Textarea
                    value={item.notes}
                    onChange={(e) => onUpdate({ notes: e.target.value })}
                    placeholder="Add specific notes for this exercise..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Save as template dialog
function SaveAsTemplateDialog({
  open,
  onOpenChange,
  defaultName,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  onSave: (name: string, isPublic: boolean) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(defaultName);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    setName(defaultName);
  }, [defaultName, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this workout as a reusable template for future prescriptions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hip Mobility Routine"
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is-public" className="text-sm">
              Make this template available to all trainers
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(name, isPublic)} disabled={isLoading || !name.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Template picker dialog
function TemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: WorkoutTemplate[];
  onSelect: (template: WorkoutTemplate) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Load from Template</DialogTitle>
          <DialogDescription>
            Select a template to pre-fill the prescription with exercises
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates available</p>
              <p className="text-sm mt-2">Create your first template by saving a prescription</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {template.exerciseCount} exercise{template.exerciseCount !== 1 ? "s" : ""}
                          </Badge>
                          {template.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Exercise picker dialog
function ExercisePickerDialog({
  open,
  onOpenChange,
  exercises,
  selectedIds,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: VTExercise[];
  selectedIds: Set<string>;
  onAdd: (exercise: VTExercise) => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = exercises.filter((ex) => {
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && ex.category !== categoryFilter) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Exercises</DialogTitle>
          <DialogDescription>
            Click on exercises to add them to the prescription
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 py-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORIES).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exercise) => {
              const isSelected = selectedIds.has(exercise.id);
              const config = CATEGORIES[exercise.category] || CATEGORIES.mobility;
              const Icon = config.icon;

              return (
                <Card
                  key={exercise.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => onAdd(exercise)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <span className="text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{exercise.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className={`text-xs ${config.color}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          {exercise.bodyArea && (
                            <Badge variant="secondary" className="text-xs">
                              {exercise.bodyArea.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No exercises found matching your criteria
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PrescriptionBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get("member");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exercises, setExercises] = useState<VTExercise[]>([]);
  const [members, setMembers] = useState<VTMember[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Prescription state
  const [selectedMemberId, setSelectedMemberId] = useState<string>(memberId || "");
  const [prescriptionName, setPrescriptionName] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionExercise[]>([]);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [exercisesRes, membersRes, templatesRes] = await Promise.all([
          fetch("/api/exercises"),
          fetch("/api/members"),
          fetch("/api/templates"),
        ]);

        if (exercisesRes.ok) {
          const data = await exercisesRes.json();
          setExercises(data.exercises || []);
        }

        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(data.members || []);
        }

        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setTemplates(data.templates || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Add exercise to prescription
  const addExercise = useCallback((exercise: VTExercise) => {
    const newItem: PrescriptionExercise = {
      id: `item-${Date.now()}-${Math.random()}`,
      exerciseId: exercise.id,
      exercise,
      sets: 3,
      reps: "10-12",
      duration: "",
      notes: "",
      orderIndex: prescriptionItems.length,
    };
    setPrescriptionItems((prev) => [...prev, newItem]);
  }, [prescriptionItems.length]);

  // Remove exercise
  const removeExercise = useCallback((id: string) => {
    setPrescriptionItems((prev) => 
      prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, orderIndex: i }))
    );
  }, []);

  // Update exercise
  const updateExercise = useCallback((id: string, updates: Partial<PrescriptionExercise>) => {
    setPrescriptionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Move exercise
  const moveExercise = useCallback((index: number, direction: "up" | "down") => {
    setPrescriptionItems((prev) => {
      const newItems = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;
      
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      return newItems.map((item, i) => ({ ...item, orderIndex: i }));
    });
  }, []);

  // Load from template
  const loadFromTemplate = useCallback((template: WorkoutTemplate) => {
    const items: PrescriptionExercise[] = template.exercises.map((ex, i) => {
      // Find the full exercise data
      const fullExercise = exercises.find((e) => e.id === ex.id);
      if (!fullExercise) return null;

      return {
        id: `item-${Date.now()}-${i}`,
        exerciseId: ex.id,
        exercise: fullExercise,
        sets: ex.sets ?? 3,
        reps: ex.reps || "10-12",
        duration: ex.duration || "",
        notes: ex.exerciseNotes || "",
        orderIndex: i,
      };
    }).filter(Boolean) as PrescriptionExercise[];

    setPrescriptionItems(items);
    setPrescriptionName(template.name);
    setPrescriptionNotes(template.description || "");
    setTemplatePickerOpen(false);
  }, [exercises]);

  // Save as template
  const saveAsTemplate = async (templateName: string, isPublic: boolean) => {
    if (prescriptionItems.length === 0) {
      alert("Please add at least one exercise first");
      return;
    }

    setIsSavingTemplate(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName || prescriptionName || "New Template",
          description: prescriptionNotes,
          isPublic,
          exercises: prescriptionItems.map((item) => ({
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: item.reps,
            duration: item.duration,
            notes: item.notes,
            orderIndex: item.orderIndex,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save template");
      
      const data = await res.json();
      
      // Refresh templates list
      const templatesRes = await fetch("/api/templates");
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }

      setSaveAsTemplateOpen(false);
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Save prescription
  const savePrescription = async (status: "draft" | "sent") => {
    if (!selectedMemberId) {
      alert("Please select a client");
      return;
    }

    if (prescriptionItems.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMemberId,
          name: prescriptionName || "Mobility Prescription",
          notes: prescriptionNotes,
          status,
          exercises: prescriptionItems.map((item) => ({
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: item.reps,
            duration: item.duration,
            notes: item.notes,
            orderIndex: item.orderIndex,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save prescription");

      router.push("/prescriptions");
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Failed to save prescription");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedExerciseIds = new Set(prescriptionItems.map((item) => item.exerciseId));
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  if (isLoading) {
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
                <h1 className="text-xl font-bold">New Prescription</h1>
                <p className="text-sm text-muted-foreground">
                  {prescriptionItems.length} exercise{prescriptionItems.length !== 1 ? "s" : ""} added
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {templates.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setTemplatePickerOpen(true)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => savePrescription("draft")}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => savePrescription("sent")}
                disabled={isSaving}
              >
                <Send className="h-4 w-4 mr-2" />
                Save & Send
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Prescription Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                        {member.email && ` (${member.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Prescription Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Prescription Name (optional)</Label>
                  <Input
                    value={prescriptionName}
                    onChange={(e) => setPrescriptionName(e.target.value)}
                    placeholder="e.g., Daily Mobility Routine"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Notes for Client</Label>
                  <Textarea
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    placeholder="Add any general notes or instructions..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Exercises */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Exercises</h2>
                <div className="flex items-center gap-2">
                  {prescriptionItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSaveAsTemplateOpen(true)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  )}
                  <Button onClick={() => setPickerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercises
                  </Button>
                </div>
              </div>

              {prescriptionItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No exercises added yet</p>
                    <p className="text-muted-foreground mb-4">
                      Click "Add Exercises" to start building the prescription
                    </p>
                    <Button onClick={() => setPickerOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercises
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {prescriptionItems.map((item, index) => (
                    <ExerciseBuilderCard
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={() => removeExercise(item.id)}
                      onMoveUp={() => moveExercise(index, "up")}
                      onMoveDown={() => moveExercise(index, "down")}
                      onUpdate={(updates) => updateExercise(item.id, updates)}
                      isFirst={index === 0}
                      isLast={index === prescriptionItems.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMember ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">
                          {selectedMember.firstName} {selectedMember.lastName}
                        </p>
                        {selectedMember.email && (
                          <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                        )}
                      </div>

                      {prescriptionName && (
                        <div>
                          <p className="text-sm text-muted-foreground">Prescription</p>
                          <p className="font-medium">{prescriptionName}</p>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {prescriptionItems.length} Exercise{prescriptionItems.length !== 1 ? "s" : ""}
                        </p>
                        <div className="space-y-2">
                          {prescriptionItems.slice(0, 5).map((item, i) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                                {i + 1}
                              </span>
                              <span className="truncate">{item.exercise.name}</span>
                            </div>
                          ))}
                          {prescriptionItems.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{prescriptionItems.length - 5} more exercises
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a client to preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Exercise Picker Dialog */}
      <ExercisePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        exercises={exercises}
        selectedIds={selectedExerciseIds}
        onAdd={addExercise}
      />

      {/* Template Picker Dialog */}
      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        templates={templates}
        onSelect={loadFromTemplate}
      />

      {/* Save as Template Dialog */}
      <SaveAsTemplateDialog
        open={saveAsTemplateOpen}
        onOpenChange={setSaveAsTemplateOpen}
        defaultName={prescriptionName || "New Template"}
        onSave={saveAsTemplate}
        isLoading={isSavingTemplate}
      />
    </div>
  );
}
