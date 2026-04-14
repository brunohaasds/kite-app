"use client";

import { SerwistProvider } from "@serwist/turbopack/react";

/**
 * Regista o service worker em produção (Serwist). Em desenvolvimento fica desligado
 * para não interferir com HMR.
 */
export function PwaSerwistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    return <>{children}</>;
  }

  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={false}>
      {children}
    </SerwistProvider>
  );
}
