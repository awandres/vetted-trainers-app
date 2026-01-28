"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X, Loader2, ImageIcon } from "lucide-react";
import { useWebsiteEdit } from "./WebsiteWrapper";

interface VTEditableImageProps {
  blockId: string;
  defaultSrc: string;
  alt: string;
  isEditMode?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  quality?: number;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none";
  pageSlug?: string;
}

export function VTEditableImage({
  blockId,
  defaultSrc,
  alt,
  isEditMode = false,
  fill = false,
  width,
  height,
  className = "",
  containerClassName = "",
  quality = 85,
  priority = false,
  objectFit = "cover",
  pageSlug = "home",
}: VTEditableImageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedSrc, setSavedSrc] = useState<string | null>(null);
  const [showUploadUI, setShowUploadUI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get staging system from context
  const { addPendingChange, getPendingContent } = useWebsiteEdit();

  // Load saved image URL (check pending changes first)
  useEffect(() => {
    async function loadImage() {
      // First check if there's a pending change for this block
      const pendingContent = getPendingContent(blockId);
      if (pendingContent && (pendingContent as { src?: string }).src) {
        setSavedSrc((pendingContent as { src: string }).src);
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
          if (data.block?.content?.src) {
            setSavedSrc(data.block.content.src);
          }
        }
      } catch (error) {
        console.error("Failed to load image:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadImage();
  }, [pageSlug, blockId, getPendingContent]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Step 1: Get presigned upload URL
      const presignResponse = await fetch(
        `/api/upload?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&category=website`
      );
      
      if (!presignResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, publicUrl, fileKey } = await presignResponse.json();

      // Step 2: Upload file directly to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 3: Save photo metadata (this happens immediately to track the upload)
      await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey,
          fileName: file.name,
          fileUrl: publicUrl,
          fileSize: file.size,
          mimeType: file.type,
          category: "website",
          altText: alt,
        }),
      });

      // Step 4: Stage the image URL change (instead of saving directly)
      addPendingChange({
        pageSlug,
        blockId,
        type: "image",
        content: { src: publicUrl, alt },
      });

      // Update local state to show the new image
      setSavedSrc(publicUrl);
      setShowUploadUI(false);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [pageSlug, blockId, alt, addPendingChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const currentSrc = savedSrc || defaultSrc;

  // Render the image
  const renderImage = () => {
    if (fill) {
      return (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          className={`${objectFit === "cover" ? "object-cover" : objectFit === "contain" ? "object-contain" : ""} ${className}`}
          quality={quality}
          priority={priority}
        />
      );
    }
    return (
      <Image
        src={currentSrc}
        alt={alt}
        width={width || 400}
        height={height || 300}
        className={className}
        quality={quality}
        priority={priority}
      />
    );
  };

  // Non-edit mode: just render image
  if (!isEditMode) {
    if (fill) {
      return (
        <div className={containerClassName}>
          <div className="relative w-full h-full">
            {renderImage()}
          </div>
        </div>
      );
    }
    return renderImage();
  }

  // Prevent link navigation when in edit mode
  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChangeImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUploadUI(true);
  };

  // Edit mode UI
  return (
    <div 
      className={`${containerClassName} group`}
      onClick={handleContainerClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Current Image - wrap in relative div for proper sizing when container is absolute */}
      <div className="relative w-full h-full">
        {renderImage()}
      </div>

      {/* Edit Overlay - positioned absolutely within the container */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
        <button
          onClick={handleChangeImageClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#50BFF4] text-black rounded-lg font-medium hover:bg-[#3DAEE3] transition-colors shadow-lg"
        >
          <Camera className="h-5 w-5" />
          Change Image
        </button>
      </div>

      {/* Edit indicator */}
      <div className="absolute top-2 right-2 p-2 bg-[#50BFF4] text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <ImageIcon className="h-4 w-4" />
      </div>

      {/* Upload Modal */}
      {showUploadUI && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-[#252525] rounded-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Change Image</h3>
              <button
                onClick={() => setShowUploadUI(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Current Image Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6 bg-[#181818]">
              <Image
                src={currentSrc}
                alt={alt}
                fill
                className="object-contain"
              />
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isUploading ? "border-[#50BFF4] bg-[#50BFF4]/10" : "border-gray-600 hover:border-[#50BFF4]"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-[#50BFF4] animate-spin" />
                  <p className="text-gray-400">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Drag and drop an image here, or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#50BFF4] text-black rounded-lg font-medium hover:bg-[#3DAEE3] transition-colors"
                  >
                    Browse Files
                  </button>
                  <p className="text-gray-500 text-sm mt-4">
                    Supports: JPG, PNG, GIF, WebP (Max 10MB)
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadUI(false)}
                disabled={isUploading}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VTEditableImage;
