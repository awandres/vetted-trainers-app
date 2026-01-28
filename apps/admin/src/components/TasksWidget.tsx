"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  AlertCircle,
  Loader2,
  ChevronRight,
  X,
  Bell,
  UserPlus,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Checkbox,
} from "@vt/ui";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string;
  dueDate: string | null;
  createdAt: string;
  ownerId?: string;
  ownerName?: string;
}

interface AutoTask {
  id: string;
  type: string;
  title: string;
  description: string;
  memberId: string;
  memberName: string;
  priority: string;
  isAuto: boolean;
}

export function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [autoTasks, setAutoTasks] = useState<AutoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const res = await fetch("/api/trainers/my-tasks?status=pending&includeAuto=true");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setAutoTasks(data.autoTasks || []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/trainers/my-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        setShowAddForm(false);
        loadTasks();
      }
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      const res = await fetch("/api/trainers/my-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: "done" }),
      });
      if (res.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  }

  async function handleDismissAutoTask(memberId: string) {
    // For auto-tasks, we'd typically create a dismissed record
    // For now, just remove from display
    setAutoTasks(prev => prev.filter(t => t.memberId !== memberId));
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-500/10";
      case "medium": return "text-amber-500 bg-amber-500/10";
      case "low": return "text-blue-500 bg-blue-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const combinedTasks = [
    ...autoTasks.slice(0, 3),
    ...tasks.slice(0, 5 - Math.min(autoTasks.length, 3)),
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tasks & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tasks & Reminders
            {(tasks.length + autoTasks.length) > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({tasks.length + autoTasks.length})
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add Task Form */}
        {showAddForm && (
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              placeholder="Add a task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isAdding || !newTaskTitle.trim()}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewTaskTitle("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Empty State */}
        {combinedTasks.length === 0 && !showAddForm && (
          <div className="py-6 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">All caught up!</p>
            <p className="text-xs">No pending tasks or follow-ups</p>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {combinedTasks.map((task) => {
            const isAuto = "isAuto" in task && task.isAuto;
            
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {isAuto ? (
                  <div className="mt-0.5">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="mt-0.5 text-muted-foreground hover:text-green-500 transition-colors"
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  {"description" in task && task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {task.description}
                    </p>
                  )}
                  {isAuto && "memberId" in task && (
                    <Link
                      href={`/members/${task.memberId}`}
                      className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      View client <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {task.priority && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                  {"dueDate" in task && task.dueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {isAuto && "memberId" in task && (
                    <button
                      onClick={() => handleDismissAutoTask(task.memberId)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        {(tasks.length + autoTasks.length) > 5 && (
          <div className="pt-2 border-t">
            <Link
              href="/my-tasks"
              className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
            >
              View all tasks <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
