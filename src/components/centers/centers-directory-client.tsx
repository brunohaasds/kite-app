"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Store } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PublicOrganizationRow } from "@/domain/organizations/repo";

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
      <div className="border-b bg-primary p-6 text-primary-foreground shadow-lg">
        <h1 className="text-2xl font-bold">Centros</h1>
        <p className="text-sm opacity-90">
          Escolas e parceiros onde podes aprender kitesurf
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={() => router.push("/centers")}
        >
          Limpar filtros
        </Button>

        <div className="space-y-3 pt-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum centro encontrado.
            </p>
          ) : (
            filtered.map((org) => (
              <Link
                key={org.id}
                href={`/escola/${org.slug}`}
                className="flex gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                  {org.avatar ? (
                    <img src={org.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-7 w-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{org.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {org.spotCount} spot{org.spotCount !== 1 ? "s" : ""}
                  </p>
                  {org.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
