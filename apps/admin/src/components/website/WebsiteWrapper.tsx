"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ExitPreviewButton } from "./ExitPreviewButton";

// Type for pending changes
interface PendingChange {
  pageSlug: string;
  blockId: string;
  type: "text" | "image";
  content: object;
}

interface WebsiteEditContextValue {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  toggleEditMode: () => void;
  // Staging system
  pendingChanges: Map<string, PendingChange>;
  addPendingChange: (change: PendingChange) => void;
  removePendingChange: (blockId: string) => void;
  hasPendingChanges: boolean;
  saveAllChanges: () => Promise<void>;
  discardAllChanges: () => void;
  isSaving: boolean;
  // Get pending content for a block (if any)
  getPendingContent: (blockId: string) => object | null;
}

const WebsiteEditContext = createContext<WebsiteEditContextValue | null>(null);

export function useWebsiteEdit() {
  const context = useContext(WebsiteEditContext);
  if (!context) {
    return { 
      isEditMode: false, 
      setEditMode: () => {}, 
      toggleEditMode: () => {},
      pendingChanges: new Map(),
      addPendingChange: () => {},
      removePendingChange: () => {},
      hasPendingChanges: false,
      saveAllChanges: async () => {},
      discardAllChanges: () => {},
      isSaving: false,
      getPendingContent: () => null,
    };
  }
  return context;
}

interface WebsiteWrapperProps {
  children: ReactNode;
  isAdmin: boolean;
  showEditMode?: boolean;
}

export function WebsiteWrapper({ children, isAdmin, showEditMode = true }: WebsiteWrapperProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const addPendingChange = useCallback((change: PendingChange) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.set(change.blockId, change);
      return next;
    });
  }, []);

  const removePendingChange = useCallback((blockId: string) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.delete(blockId);
      return next;
    });
  }, []);

  const getPendingContent = useCallback((blockId: string): object | null => {
    const change = pendingChanges.get(blockId);
    return change?.content || null;
  }, [pendingChanges]);

  const saveAllChanges = useCallback(async () => {
    if (pendingChanges.size === 0) return;

    setIsSaving(true);
    try {
      // Save all pending changes
      const promises = Array.from(pendingChanges.values()).map(async (change) => {
        const response = await fetch("/api/website/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageSlug: change.pageSlug,
            blockId: change.blockId,
            type: change.type,
            content: change.content,
          }),
        });
        return response.ok;
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every(Boolean);

      if (allSuccessful) {
        setPendingChanges(new Map());
      } else {
        console.error("Some changes failed to save");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges]);

  const discardAllChanges = useCallback(() => {
    setPendingChanges(new Map());
    // Force a re-render of components by toggling edit mode briefly
    setIsEditMode(false);
    setTimeout(() => setIsEditMode(true), 50);
  }, []);

  const value: WebsiteEditContextValue = {
    isEditMode,
    setEditMode: setIsEditMode,
    toggleEditMode: () => setIsEditMode(prev => !prev),
    pendingChanges,
    addPendingChange,
    removePendingChange,
    hasPendingChanges: pendingChanges.size > 0,
    saveAllChanges,
    discardAllChanges,
    isSaving,
    getPendingContent,
  };

  return (
    <WebsiteEditContext.Provider value={value}>
      {children}
      <ExitPreviewButton 
        showEditMode={showEditMode}
        isAdmin={isAdmin}
        initialEditMode={isEditMode}
        onEditModeChange={setIsEditMode}
        hasPendingChanges={pendingChanges.size > 0}
        onSaveChanges={saveAllChanges}
        onDiscardChanges={discardAllChanges}
        isSaving={isSaving}
        pendingCount={pendingChanges.size}
      />
    </WebsiteEditContext.Provider>
  );
}
