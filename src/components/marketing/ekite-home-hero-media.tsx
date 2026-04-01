"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type EkiteHomeHeroMediaProps = {
  /** Imagem usada como base, poster do vídeo e fallback se o vídeo falhar */
  posterSrc: string;
  /** Caminho público, ex.: /marketing/hero.mp4 */
  videoSrc: string;
  className?: string;
};

/**
 * Hero com vídeo em cima da imagem; se o vídeo não carregar ou der erro, fica só a imagem.
 */
export function EkiteHomeHeroMedia({
  posterSrc,
  videoSrc,
  className,
}: EkiteHomeHeroMediaProps) {
  const [showVideo, setShowVideo] = useState(true);

  return (
    <div className={cn("absolute inset-0 opacity-40", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- URL remota; fallback LCP */}
      <img
        src={posterSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      {showVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onError={() => setShowVideo(false)}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
    </div>
  );
}
