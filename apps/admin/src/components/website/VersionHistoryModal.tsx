"use client";

import { useState, useEffect } from "react";
import { X, History, RotateCcw, Clock, Eye, Loader2, ChevronRight } from "lucide-react";

interface VersionRecord {
  id: string;
  blockId: string;
  pageSlug: string;
  version: number;
  content: { doc?: object; html?: string };
  editedAt: string;
  changeNotes?: string;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageSlug: string;
  blockId: string;
  currentVersion: number;
  onRestore: (version: number, content: object) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  pageSlug,
  blockId,
  currentVersion,
  onRestore,
}: VersionHistoryModalProps) {
  const [history, setHistory] = useState<VersionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionRecord | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch history when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function fetchHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/website/blocks/history?pageSlug=${pageSlug}&blockId=${blockId}&limit=20`
        );
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [isOpen, pageSlug, blockId]);

  const handleRestore = async (version: VersionRecord) => {
    if (!confirm(`Restore to version ${version.version}? This will create a new version.`)) {
      return;
    }

    setIsRestoring(true);
    try {
      const res = await fetch("/api/website/blocks/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug,
          blockId,
          targetVersion: version.version,
        }),
      });

      if (!res.ok) throw new Error("Failed to restore version");

      const data = await res.json();
      
      // Notify parent component
      if (version.content?.doc) {
        onRestore(data.newVersion, version.content.doc);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore");
    } finally {
      setIsRestoring(false);
    }
  };

  // Extract text from Tiptap document for preview
  const extractPreviewText = (content: { doc?: object } | null): string => {
    if (!content?.doc) return "No content";
    
    function getText(node: unknown): string {
      if (!node || typeof node !== "object") return "";
      const n = node as Record<string, unknown>;
      if (n.text && typeof n.text === "string") return n.text;
      if (Array.isArray(n.content)) {
        return n.content.map(getText).join(" ");
      }
      return "";
    }
    
    const text = getText(content.doc);
    return text.length > 100 ? text.slice(0, 100) + "..." : text || "No content";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#50BFF4]/20 rounded-lg">
              <History className="h-5 w-5 text-[#50BFF4]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Version History</h2>
              <p className="text-sm text-gray-400">
                {blockId} · Current: v{currentVersion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Version List */}
          <div className="w-1/2 border-r border-gray-800 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#50BFF4]" />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-400">{error}</div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No previous versions</p>
                <p className="text-sm mt-1">Edit and save content to create history</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {history.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors ${
                      selectedVersion?.id === version.id ? "bg-gray-800/70" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">
                          v{version.version}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Version {version.version}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getRelativeTime(version.editedAt)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {extractPreviewText(version.content)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedVersion ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#50BFF4]" />
                    Preview: Version {selectedVersion.version}
                  </h3>
                  <button
                    onClick={() => handleRestore(selectedVersion)}
                    disabled={isRestoring}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isRestoring ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Restore
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  {formatDate(selectedVersion.editedAt)}
                </div>

                {selectedVersion.changeNotes && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
                    <span className="text-gray-500">Note:</span> {selectedVersion.changeNotes}
                  </div>
                )}

                <div className="p-4 bg-[#252525] rounded-lg border border-gray-700">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {extractPreviewText(selectedVersion.content)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <p className="text-xs text-gray-500 text-center">
            Restoring a version creates a new version with the old content
          </p>
        </div>
      </div>
    </div>
  );
}

export default VersionHistoryModal;
