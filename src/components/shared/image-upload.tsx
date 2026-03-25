"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (url: string) => void;
  context: "instructors" | "organizations" | "users";
  entityId?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function ImageUpload({
  currentImageUrl,
  onUpload,
  context,
  entityId,
  className,
  size = "md",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Use PNG, JPEG ou WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo excede 2 MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const params = new URLSearchParams({ context });
      if (entityId) params.set("entityId", entityId);

      const res = await fetch(`/api/upload?${params}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");

      setPreview(data.url);
      onUpload(data.url);
      toast.success("Imagem enviada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "relative overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex items-center justify-center bg-muted",
          SIZE_CLASSES[size],
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
