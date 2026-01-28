"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Check,
  X,
  Pencil,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  History,
} from "lucide-react";
import { useWebsiteEdit } from "./WebsiteWrapper";
import { VersionHistoryModal } from "./VersionHistoryModal";

interface VTEditableSectionProps {
  blockId: string;
  defaultContent: string;
  isEditMode?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  pageSlug?: string;
}

export function VTEditableSection({
  blockId,
  defaultContent,
  isEditMode = false,
  className = "",
  as: Tag = "div",
  pageSlug = "home",
}: VTEditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedContent, setSavedContent] = useState<object | null>(null);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  
  // Get staging system from context
  const { addPendingChange, getPendingContent } = useWebsiteEdit();

  // Create default Tiptap document from string
  const createDoc = (text: string) => ({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  });

  // Load saved content (check pending changes first)
  useEffect(() => {
    async function loadContent() {
      // First check if there's a pending change for this block
      const pendingContent = getPendingContent(blockId);
      if (pendingContent && (pendingContent as { doc?: object }).doc) {
        setSavedContent((pendingContent as { doc: object }).doc);
        setIsLoading(false);
        return;
      }

      // Otherwise load from database
      try {
        const response = await fetch(
          `/api/website/blocks?pageSlug=${pageSlug}&blockId=${blockId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.block?.content?.doc) {
            setSavedContent(data.block.content.doc);
          }
          if (data.block?.version) {
            setCurrentVersion(data.block.version);
          }
        }
      } catch (error) {
        console.error("Failed to load content:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, [pageSlug, blockId, getPendingContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#50BFF4] underline" },
      }),
      Placeholder.configure({ placeholder: "Enter text..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: savedContent || createDoc(defaultContent),
    editable: isEditing,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `focus:outline-none ${className}`,
      },
    },
  });

  // Update editor when saved content loads
  useEffect(() => {
    if (editor && savedContent) {
      editor.commands.setContent(savedContent);
    }
  }, [editor, savedContent]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [editor, isEditing]);

  const handleSave = useCallback(() => {
    if (!editor) return;

    // Stage the change instead of saving directly
    addPendingChange({
      pageSlug,
      blockId,
      type: "text",
      content: { doc: editor.getJSON() },
    });

    // Update local state so the UI reflects the change
    setSavedContent(editor.getJSON());
    setIsEditing(false);
  }, [editor, pageSlug, blockId, addPendingChange]);

  const handleCancel = useCallback(() => {
    if (editor && savedContent) {
      editor.commands.setContent(savedContent);
    } else if (editor) {
      editor.commands.setContent(createDoc(defaultContent));
    }
    setIsEditing(false);
  }, [editor, savedContent, defaultContent]);

  const handleVersionRestore = useCallback((newVersion: number, content: object) => {
    setSavedContent(content);
    setCurrentVersion(newVersion);
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [editor]);

  // Non-edit mode: just render content
  if (!isEditMode) {
    if (isLoading || !editor) {
      return <Tag className={className}>{defaultContent}</Tag>;
    }
    return (
      <Tag className={className}>
        <EditorContent editor={editor} />
      </Tag>
    );
  }

  // Prevent link navigation when in edit mode
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Edit mode UI
  return (
    <div className="relative group" onClick={handleContainerClick}>
      {/* Edit button */}
      {!isEditing && (
        <button
          onClick={handleEditClick}
          className="absolute -top-3 -right-3 p-2 bg-[#50BFF4] text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-[#3DAEE3] z-20"
          title="Edit this section"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {/* Content with edit border */}
      <div
        className={`relative transition-all ${
          isEditing
            ? "ring-2 ring-[#50BFF4] ring-offset-2 ring-offset-[#181818] rounded-lg p-4 bg-[#252525]"
            : "hover:ring-2 hover:ring-[#50BFF4]/50 hover:ring-offset-2 hover:ring-offset-[#181818] rounded-lg"
        }`}
      >
        {/* Formatting toolbar - shown when editing */}
        {isEditing && editor && (
          <div className="flex items-center gap-1 p-2 mb-4 bg-[#181818] border border-[#50BFF4]/30 rounded-lg">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive("bold") ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive("italic") ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-600 mx-1" />
            
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive("heading", { level: 1 }) ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive("heading", { level: 2 }) ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-600 mx-1" />

            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive({ textAlign: "left" }) ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive({ textAlign: "center" }) ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive({ textAlign: "right" }) ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-600 mx-1" />

            <button
              onClick={() => {
                const url = window.prompt("URL", editor.getAttributes("link").href || "");
                if (url === null) return;
                if (url === "") {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                } else {
                  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }
              }}
              className={`p-2 rounded hover:bg-[#50BFF4]/20 ${
                editor.isActive("link") ? "bg-[#50BFF4]/20 text-[#50BFF4]" : "text-white"
              }`}
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-gray-600 mx-1" />

            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-colors"
              title={`Version History (v${currentVersion})`}
            >
              <History className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-500">v{currentVersion}</span>
          </div>
        )}

        {isLoading ? (
          <Tag className={className}>
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 inline" />
          </Tag>
        ) : (
          <EditorContent editor={editor} className={className} />
        )}

        {/* Done/Cancel buttons */}
        {isEditing && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#50BFF4] text-black rounded-lg hover:bg-[#3DAEE3] transition-colors font-medium"
            >
              <Check className="h-4 w-4" />
              Done
            </button>
          </div>
        )}
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        pageSlug={pageSlug}
        blockId={blockId}
        currentVersion={currentVersion}
        onRestore={handleVersionRestore}
      />
    </div>
  );
}

export default VTEditableSection;
