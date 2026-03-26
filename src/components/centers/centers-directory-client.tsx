"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Store } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicDirectoryHero } from "@/components/public/public-directory-hero";
import type { PublicOrganizationRow } from "@/domain/organizations/repo";
import { cn } from "@/lib/utils";

type Props = {
  initialOrgs: PublicOrganizationRow[];
};

export function CentersDirectoryClient({ initialOrgs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qUrl = searchParams.get("q") ?? "";
  const [qInput, setQInput] = useState(qUrl);

  useEffect(() => {
    setQInput(qUrl);
  }, [qUrl]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/centers?${next.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== qUrl) setParam("q", qInput);
    }, 400);
    return () => clearTimeout(t);
  }, [qInput, qUrl, setParam]);

  const filtered = useMemo(() => {
    const q = qUrl.trim().toLowerCase();
    if (!q) return initialOrgs;
    return initialOrgs.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.slug.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false),
    );
  }, [initialOrgs, qUrl]);

  return (
    <div className="min-h-screen bg-background">
      <PublicDirectoryHero
        title="Centros"
        subtitle="Escolas e parceiros onde podes aprender kitesurf."
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-2 md:px-6 lg:px-8">
        <div className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Buscar por nome..."
                className="bg-background pl-9"
              />
            </div>
            <Button
              variant="outline"
              type="button"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => router.push("/centers")}
            >
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Nenhum centro encontrado.
            </p>
          ) : (
            filtered.map((org) => (
              <Link
                key={org.id}
                href={`/escola/${org.slug}`}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all",
                  "hover:border-primary/25 hover:shadow-md",
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {org.avatar ? (
                    <img
                      src={org.avatar}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <Store className="h-12 w-12 opacity-80" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-semibold leading-snug">{org.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {org.spotCount} spot{org.spotCount !== 1 ? "s" : ""}
                  </p>
                  {org.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {org.description}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
