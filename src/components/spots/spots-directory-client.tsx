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
      <div className="border-b bg-primary p-6 text-primary-foreground shadow-lg">
        <h1 className="text-2xl font-bold">Spots</h1>
        <p className="text-sm opacity-90">
          Explore onde aprender kitesurf
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">País</Label>
            <Select
              value={country || "__all__"}
              onValueChange={(v) => setParam("country", v === "__all__" ? "" : v)}
            >
              <SelectTrigger>
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
          <div className="space-y-1.5">
            <Label className="text-xs">Estado</Label>
            <Select
              value={state || "__all__"}
              onValueChange={(v) => setParam("state", v === "__all__" ? "" : v)}
            >
              <SelectTrigger>
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
          className="w-full"
          type="button"
          onClick={() => router.push(spotsBase)}
        >
          Limpar filtros
        </Button>

        <div className="space-y-3 pt-2">
          {initialSpots.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhum spot encontrado.
            </p>
          ) : (
            initialSpots.map((spot) => (
              <Link
                key={spot.id}
                href={`${p}/spot/${spot.slug}`}
                className="flex gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                  {spot.image ? (
                    <img
                      src={spot.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MapPin className="h-7 w-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{spot.name}</p>
                  {(spot.country || spot.state) && (
                    <p className="text-xs text-muted-foreground">
                      {[spot.state, spot.country].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {spot.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
