"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MapPin, Search } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PublicDirectoryHero } from "@/components/public/public-directory-hero";
import { cn } from "@/lib/utils";

export type SpotRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  country: string | null;
  state: string | null;
  access: string;
};

type Props = {
  initialSpots: SpotRow[];
  countries: string[];
  states: string[];
  pathPrefix: "" | "/aluno";
};

export function SpotsDirectoryClient({
  initialSpots,
  countries,
  states,
  pathPrefix,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qUrl = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? "";
  const state = searchParams.get("state") ?? "";
  const [qInput, setQInput] = useState(qUrl);

  useEffect(() => {
    setQInput(qUrl);
  }, [qUrl]);

  const spotsBase = pathPrefix ? `${pathPrefix}/spots` : "/spots";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${spotsBase}?${next.toString()}`);
    },
    [router, searchParams, spotsBase],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== qUrl) setParam("q", qInput);
    }, 400);
    return () => clearTimeout(t);
  }, [qInput, qUrl, setParam]);

  const p = pathPrefix;

  return (
    <div className="min-h-screen bg-background">
      <PublicDirectoryHero
        title="Spots"
        subtitle="Explora onde aprender kitesurf, por região e nome."
        backgroundImage={p === "" ? "/marketing/spots.jpg" : undefined}
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-2 md:px-6 lg:px-8">
        <div className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
            <div className="relative min-w-0 flex-1 md:min-w-[min(100%,280px)]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Buscar por nome..."
                className="bg-background pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:flex md:min-w-0 md:flex-1 md:gap-3">
              <div className="min-w-0 space-y-1.5 md:min-w-[160px] md:flex-1">
                <Label className="text-xs">País</Label>
                <Select
                  value={country || "__all__"}
                  onValueChange={(v) => setParam("country", v === "__all__" ? "" : v)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 space-y-1.5 md:min-w-[160px] md:flex-1">
                <Label className="text-xs">Estado</Label>
                <Select
                  value={state || "__all__"}
                  onValueChange={(v) => setParam("state", v === "__all__" ? "" : v)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              className="w-full shrink-0 md:w-auto md:self-end"
              onClick={() => router.push(spotsBase)}
            >
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {initialSpots.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Nenhum spot encontrado.
            </p>
          ) : (
            initialSpots.map((spot) => (
              <Link
                key={spot.id}
                href={`${p}/spot/${spot.slug}`}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all",
                  "hover:border-primary/25 hover:shadow-md",
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {spot.image ? (
                    <img
                      src={spot.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <MapPin className="h-12 w-12 opacity-80" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-semibold leading-snug">{spot.name}</p>
                  {(spot.country || spot.state) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[spot.state, spot.country].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {spot.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {spot.description}
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
