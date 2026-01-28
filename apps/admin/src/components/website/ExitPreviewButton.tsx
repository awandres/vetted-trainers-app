"use client";

import { ArrowLeft, Pencil, X, Save, RotateCcw, Loader2, Upload, History, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface PublishStatus {
  stats: {
    total: number;
    published: number;
    drafts: number;
  };
  lastPublishedAt: string | null;
  deployHookConfigured: boolean;
}

interface ExitPreviewButtonProps {
  showEditMode?: boolean;
  isAdmin?: boolean;
  onEditModeChange?: (isEditMode: boolean) => void;
  initialEditMode?: boolean;
  // Staging system props
  hasPendingChanges?: boolean;
  onSaveChanges?: () => Promise<void>;
  onDiscardChanges?: () => void;
  isSaving?: boolean;
  pendingCount?: number;
}

export function ExitPreviewButton({ 
  showEditMode = false, 
  isAdmin = false,
  onEditModeChange,
  initialEditMode = false,
  hasPendingChanges = false,
  onSaveChanges,
  onDiscardChanges,
  isSaving = false,
  pendingCount = 0,
}: ExitPreviewButtonProps) {
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);

  useEffect(() => {
    setIsEditMode(initialEditMode);
  }, [initialEditMode]);

  // Fetch publish status when edit mode is enabled
  useEffect(() => {
    if (isEditMode && isAdmin) {
      fetch("/api/website/publish")
        .then(res => res.json())
        .then(data => setPublishStatus(data))
        .catch(console.error);
    }
  }, [isEditMode, isAdmin, hasPendingChanges]);

  const handlePublish = async () => {
    if (hasPendingChanges) {
      alert("Please save your changes first before publishing.");
      return;
    }
    
    if (!confirm("Publish all changes to the live website? This will trigger a rebuild.")) {
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/website/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      
      if (data.success) {
        setShowPublishSuccess(true);
        setTimeout(() => setShowPublishSuccess(false), 3000);
        // Refresh publish status
        const statusRes = await fetch("/api/website/publish");
        const statusData = await statusRes.json();
        setPublishStatus(statusData);
      } else {
        alert("Failed to publish: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Publish failed:", error);
      alert("Failed to publish. Check console for details.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleEdit = () => {
    // Warn if exiting edit mode with unsaved changes
    if (isEditMode && hasPendingChanges) {
      if (!confirm("You have unsaved changes. Discard them?")) {
        return;
      }
      onDiscardChanges?.();
    }
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    onEditModeChange?.(newMode);
  };

  const handleSave = async () => {
    await onSaveChanges?.();
  };

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard all changes?")) {
      onDiscardChanges?.();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2">
      {/* Unsaved changes indicator */}
      {showEditMode && isAdmin && isEditMode && hasPendingChanges && (
        <div className="bg-orange-500 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg whitespace-nowrap animate-pulse">
          {pendingCount} unsaved change{pendingCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Save/Discard buttons - only show when there are pending changes */}
      {showEditMode && isAdmin && isEditMode && hasPendingChanges && (
        <>
          <button
            onClick={handleDiscard}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all font-medium text-sm bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all font-medium text-sm bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </>
      )}

      {/* Edit mode hint - only show when no pending changes */}
      {showEditMode && isAdmin && isEditMode && !hasPendingChanges && (
        <div className="bg-yellow-500 text-yellow-900 px-3 py-2 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
          ✨ Click any highlighted text to edit
        </div>
      )}

      {/* Publish button - show when in edit mode with no pending changes */}
      {showEditMode && isAdmin && isEditMode && !hasPendingChanges && publishStatus && (
        <>
          {showPublishSuccess ? (
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
              <Check className="h-4 w-4" />
              Published!
            </div>
          ) : publishStatus.stats.drafts > 0 ? (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all font-medium text-sm bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              title={publishStatus.deployHookConfigured ? "Publish to live site" : "Vercel deploy hook not configured"}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isPublishing ? "Publishing..." : `Publish ${publishStatus.stats.drafts} draft${publishStatus.stats.drafts !== 1 ? "s" : ""}`}
            </button>
          ) : (
            <div className="bg-gray-600 text-gray-300 px-3 py-2 rounded-full text-sm font-medium shadow-lg whitespace-nowrap flex items-center gap-2">
              <Check className="h-4 w-4" />
              All published
            </div>
          )}
        </>
      )}

      {/* Edit Mode Toggle for Admins */}
      {showEditMode && isAdmin && (
        <button
          onClick={handleToggleEdit}
          disabled={isSaving || isPublishing}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all font-medium text-sm disabled:opacity-50 ${
            isEditMode
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-[#50BFF4] hover:bg-[#3DAEE3] text-black"
          }`}
        >
          {isEditMode ? (
            <>
              <X className="h-4 w-4" />
              Exit Edit
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit Page
            </>
          )}
        </button>
      )}

      {/* Preview indicator */}
      <div className="bg-black/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Preview
      </div>
      
      {/* Exit button - back to admin dashboard */}
      <Link
        href="/"
        className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all hover:shadow-xl flex items-center gap-2 border border-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>
    </div>
  );
}
