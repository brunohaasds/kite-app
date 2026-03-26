"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (url: string) => void;
  context: "instructors" | "organizations" | "users" | "global_spots";
  /** Para `organizations`: `logo` (padrão) ou `hero` (fundo do hero na landing). */
  purpose?: "logo" | "hero";
  entityId?: string | null;
  /** `avatar` = círculo (logo/perfil); `cover` = retângulo largo (hero). */
  variant?: "avatar" | "cover";
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Texto auxiliar abaixo do controle */
  description?: string;
}

const AVATAR_SIZE_CLASSES = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function ImageUpload({
  currentImageUrl,
  onUpload,
  context,
  purpose = "logo",
  entityId,
  variant = "avatar",
  className,
  size = "md",
  description,
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
      if (context === "organizations" && purpose) {
        params.set("purpose", purpose);
      }

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

  const isCover = variant === "cover";

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("relative", isCover ? "w-full max-w-md" : "inline-block")}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "relative overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex items-center justify-center bg-muted",
            isCover
              ? "aspect-[21/9] w-full max-h-40 rounded-lg sm:max-h-44"
              : cn("rounded-full", AVATAR_SIZE_CLASSES[size]),
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt=""
              className={cn(
                "h-full w-full object-cover",
                isCover ? "rounded-lg" : "rounded-full",
              )}
            />
          ) : (
            <Camera className={cn("text-muted-foreground", isCover ? "h-10 w-10" : "h-6 w-6")} />
          )}
          {uploading && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40",
                isCover ? "rounded-lg" : "rounded-full",
              )}
            >
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
      {description ? (
        <p className="text-xs text-muted-foreground max-w-md">{description}</p>
      ) : null}
    </div>
  );
}
