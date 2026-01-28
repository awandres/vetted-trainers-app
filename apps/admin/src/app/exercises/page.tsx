"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
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
} from "@vt/ui";
import {
  ArrowLeft,
  Search,
  Plus,
  Activity,
  Edit,
  Trash2,
  Video,
  Filter,
  Dumbbell,
  StretchHorizontal,
  Repeat,
  Sparkles,
  Move,
  Play,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

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
  isActive: boolean;
  createdAt: string;
}

// Category config
const CATEGORIES = {
  release: { label: "Release", icon: Dumbbell, color: "bg-red-500/10 text-red-600" },
  stretch: { label: "Stretch", icon: StretchHorizontal, color: "bg-blue-500/10 text-blue-600" },
  sequence: { label: "Sequence", icon: Repeat, color: "bg-purple-500/10 text-purple-600" },
  activation: { label: "Activation", icon: Sparkles, color: "bg-orange-500/10 text-orange-600" },
  mobility: { label: "Mobility", icon: Move, color: "bg-green-500/10 text-green-600" },
};

const BODY_AREAS = [
  { value: "lower_body", label: "Lower Body", icon: "🦵" },
  { value: "upper_body", label: "Upper Body", icon: "💪" },
  { value: "core", label: "Core", icon: "🎯" },
  { value: "full_body", label: "Full Body", icon: "🏃" },
  { value: "hips", label: "Hips", icon: "🔄" },
  { value: "shoulders", label: "Shoulders", icon: "🤷" },
  { value: "spine", label: "Spine", icon: "🦴" },
  { value: "feet_ankles", label: "Feet & Ankles", icon: "🦶" },
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: "Beginner", color: "text-green-600 bg-green-500/10" },
  { value: 2, label: "Intermediate", color: "text-amber-600 bg-amber-500/10" },
  { value: 3, label: "Advanced", color: "text-red-600 bg-red-500/10" },
];

// Category badge component
function CategoryBadge({ category }: { category: keyof typeof CATEGORIES }) {
  const config = CATEGORIES[category] || CATEGORIES.mobility;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.color}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Difficulty badge component
function DifficultyBadge({ level }: { level: number }) {
  const config = DIFFICULTY_LEVELS.find(d => d.value === level) || DIFFICULTY_LEVELS[0];
  return (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {config.label}
    </Badge>
  );
}

// Body area badge component
function BodyAreaBadge({ area }: { area: string }) {
  const config = BODY_AREAS.find(b => b.value === area);
  if (!config) return null;
  return (
    <Badge variant="secondary" className="text-xs gap-1">
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  );
}

// Exercise card component
function ExerciseCard({
  exercise,
  onClick,
  onEdit,
  onDelete,
  selectable = false,
  selected = false,
  onSelect,
}: {
  exercise: VTExercise;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer group ${
        selected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      onClick={selectable ? onSelect : onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-start gap-2">
              {selectable && (
                <div 
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selected 
                      ? "bg-primary border-primary text-white" 
                      : "border-muted-foreground/30"
                  }`}
                >
                  {selected && <span className="text-xs">✓</span>}
                </div>
              )}
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {exercise.name}
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={exercise.category} />
              {exercise.bodyArea && <BodyAreaBadge area={exercise.bodyArea} />}
              <DifficultyBadge level={exercise.difficultyLevel} />
            </div>
          </div>
          {!selectable && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {exercise.videoUrl && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Play className="h-3 w-3" />
                  Video
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {(exercise.description || (exercise.cues && exercise.cues.length > 0)) && (
        <CardContent>
          {exercise.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {exercise.description}
            </p>
          )}
          {exercise.cues && exercise.cues.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Cues:</p>
              <ul className="text-sm space-y-1">
                {exercise.cues.slice(0, 2).map((cue, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground line-clamp-1">{cue}</span>
                  </li>
                ))}
                {exercise.cues.length > 2 && (
                  <li className="text-xs text-muted-foreground">
                    +{exercise.cues.length - 2} more cues
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Helper to extract YouTube video ID
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

// Exercise detail dialog
function ExerciseDetailDialog({
  exercise,
  open,
  onOpenChange,
  onEdit,
}: {
  exercise: VTExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  if (!exercise) return null;
  const videoId = getYouTubeVideoId(exercise.videoUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{exercise.name}</DialogTitle>
          <div className="flex items-center gap-2">
            <CategoryBadge category={exercise.category} />
            {exercise.bodyArea && (
              <Badge variant="secondary">{exercise.bodyArea.replace("_", " ")}</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {videoId ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video Demonstration
              </h4>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={exercise.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          ) : exercise.videoUrl ? (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Open video in new tab
            </a>
          ) : null}

          {exercise.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
            </div>
          )}

          {exercise.cues && exercise.cues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Coaching Cues</h4>
              <ul className="space-y-2">
                {exercise.cues.map((cue, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm bg-muted/50 rounded-md p-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Exercise form dialog
function ExerciseFormDialog({
  exercise,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: {
  exercise?: VTExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<VTExercise>) => Promise<void>;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "mobility" as VTExercise["category"],
    bodyArea: "none",
    description: "",
    cues: "",
    videoUrl: "",
    difficultyLevel: 1,
  });

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        category: exercise.category,
        bodyArea: exercise.bodyArea || "none",
        description: exercise.description || "",
        cues: exercise.cues?.join("\n") || "",
        videoUrl: exercise.videoUrl || "",
        difficultyLevel: exercise.difficultyLevel,
      });
    } else {
      setFormData({
        name: "",
        category: "mobility",
        bodyArea: "none",
        description: "",
        cues: "",
        videoUrl: "",
        difficultyLevel: 1,
      });
    }
  }, [exercise, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name: formData.name,
      category: formData.category,
      bodyArea: formData.bodyArea !== "none" ? formData.bodyArea : null,
      description: formData.description || null,
      cues: formData.cues.split("\n").filter((c) => c.trim()),
      videoUrl: formData.videoUrl || null,
      difficultyLevel: formData.difficultyLevel,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{exercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
            <DialogDescription>
              {exercise ? "Update the exercise details" : "Add a new exercise to your library"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., TFL Release"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as VTExercise["category"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Body Area</Label>
                <Select
                  value={formData.bodyArea}
                  onValueChange={(value) => setFormData({ ...formData, bodyArea: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {BODY_AREAS.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        <span className="flex items-center gap-2">
                          <span>{area.icon}</span>
                          <span>{area.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label>Coaching Cues (one per line)</Label>
              <Textarea
                value={formData.cues}
                onChange={(e) => setFormData({ ...formData, cues: e.target.value })}
                placeholder="Keep your core engaged&#10;Breathe slowly"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>Video URL</Label>
              <Input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !formData.name}>
              {isLoading ? "Saving..." : exercise ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<VTExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [bodyAreaFilter, setBodyAreaFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<VTExercise | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingExercise, setViewingExercise] = useState<VTExercise | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/exercises");
        if (!res.ok) throw new Error("Failed to fetch exercises");
        const data = await res.json();
        setExercises(data.exercises || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchExercises();
  }, []);

  const filteredExercises = exercises.filter((exercise) => {
    if (searchQuery && !exercise.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter !== "all" && exercise.category !== categoryFilter) return false;
    if (bodyAreaFilter !== "all" && exercise.bodyArea !== bodyAreaFilter) return false;
    if (difficultyFilter !== "all" && exercise.difficultyLevel !== parseInt(difficultyFilter)) return false;
    return true;
  });
  
  const hasActiveFilters = categoryFilter !== "all" || bodyAreaFilter !== "all" || difficultyFilter !== "all" || searchQuery !== "";
  
  const clearFilters = () => {
    setCategoryFilter("all");
    setBodyAreaFilter("all");
    setDifficultyFilter("all");
    setSearchQuery("");
  };

  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    const category = exercise.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, VTExercise[]>);

  const handleSave = async (data: Partial<VTExercise>) => {
    setIsSaving(true);
    try {
      const url = editingExercise ? `/api/exercises/${editingExercise.id}` : "/api/exercises";
      const method = editingExercise ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save exercise");
      const result = await res.json();
      if (editingExercise) {
        setExercises(exercises.map((e) => e.id === editingExercise.id ? result.exercise : e));
      } else {
        setExercises([...exercises, result.exercise]);
      }
      setDialogOpen(false);
      setEditingExercise(null);
    } catch (err) {
      console.error("Error saving exercise:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (exerciseId: string) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return;
    try {
      const res = await fetch(`/api/exercises/${exerciseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete exercise");
      setExercises(exercises.filter((e) => e.id !== exerciseId));
    } catch (err) {
      console.error("Error deleting exercise:", err);
    }
  };

  const categoryStats = Object.entries(CATEGORIES).map(([key, config]) => ({
    category: key,
    label: config.label,
    count: exercises.filter((e) => e.category === key).length,
  }));

  return (
    <div className="space-y-6 p-8">
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
            <h1 className="text-2xl font-bold">Exercise Library</h1>
            <p className="text-muted-foreground">Manage mobility exercises for prescriptions</p>
          </div>
        </div>
        <Button onClick={() => { setEditingExercise(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {categoryStats.map((stat) => (
          <Card
            key={stat.category}
            className={`cursor-pointer transition-all ${categoryFilter === stat.category ? "ring-2 ring-primary" : "hover:shadow-md"}`}
            onClick={() => setCategoryFilter(categoryFilter === stat.category ? "all" : stat.category)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Search & Filter
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={bodyAreaFilter} onValueChange={setBodyAreaFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Body Area" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Body Areas</SelectItem>
                {BODY_AREAS.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    <span className="flex items-center gap-2">
                      <span>{area.icon}</span>
                      <span>{area.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={String(level.value)}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <p className="text-sm text-muted-foreground mt-3">
              Showing {filteredExercises.length} of {exercises.length} exercises
            </p>
          )}
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Error loading exercises</p>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No exercises found</p>
            <p className="text-muted-foreground">
              {exercises.length === 0 ? "Add your first exercise to get started" : "Try adjusting your filters"}
            </p>
          </CardContent>
        </Card>
      ) : categoryFilter === "all" ? (
        <div className="space-y-8">
          {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <CategoryBadge category={category as keyof typeof CATEGORIES} />
                <span className="text-sm text-muted-foreground">({categoryExercises.length} exercises)</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onClick={() => { setViewingExercise(exercise); setDetailDialogOpen(true); }}
                    onEdit={() => { setEditingExercise(exercise); setDialogOpen(true); }}
                    onDelete={() => handleDelete(exercise.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => { setViewingExercise(exercise); setDetailDialogOpen(true); }}
              onEdit={() => { setEditingExercise(exercise); setDialogOpen(true); }}
              onDelete={() => handleDelete(exercise.id)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ExerciseFormDialog
        exercise={editingExercise}
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingExercise(null); }}
        onSave={handleSave}
        isLoading={isSaving}
      />
      <ExerciseDetailDialog
        exercise={viewingExercise}
        open={detailDialogOpen}
        onOpenChange={(open) => { setDetailDialogOpen(open); if (!open) setViewingExercise(null); }}
        onEdit={() => { setDetailDialogOpen(false); setEditingExercise(viewingExercise); setDialogOpen(true); }}
      />
    </div>
  );
}
