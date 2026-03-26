"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

/** Se o ficheiro em public/hero/ ainda não existir, remove a imagem e deixa só o gradiente. */
export function SchoolHeroImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
