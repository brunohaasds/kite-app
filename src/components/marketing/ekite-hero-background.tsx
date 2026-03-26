"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Coloca `hero.mp4` e `hero-poster.jpg` em `public/marketing/`. */
const VIDEO_SRC = "/marketing/hero.mp4";
const POSTER_SRC = "/marketing/hero-poster.jpg";

type Mode = "loading" | "video" | "poster" | "gradient";

export function EkiteHeroBackground({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(reduced ? "poster" : "video");
  }, []);

  if (mode === "loading") {
    return (
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/35 via-primary/15 to-background",
          className,
        )}
      />
    );
  }

  if (mode === "gradient") {
    return (
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/40 via-sky-500/20 to-background",
          className,
        )}
      />
    );
  }

  if (mode === "poster") {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POSTER_SRC}
          alt=""
          className={cn("absolute inset-0 h-full w-full object-cover", className)}
          onError={() => setMode("gradient")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/55 to-background/25" />
      </>
    );
  }

  return (
    <>
      <video
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        autoPlay
        muted
        loop
        playsInline
        poster={POSTER_SRC}
        onError={() => setMode("poster")}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-primary/10" />
    </>
  );
}
