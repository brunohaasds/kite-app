"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { ListFilter, MapPin, Search, X } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Map,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import type {
  PublicMapSpotMarker,
  PublicMapStateKpi,
} from "@/domain/global-spots/repo";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER: [number, number] = [-14.235, -51.9253];
const DEFAULT_ZOOM = 4;

function MapFitBounds({ markers }: { markers: PublicMapSpotMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(
      markers.map((m) => [m.latitude, m.longitude] as L.LatLngTuple),
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    }
  }, [map, markers]);

  return null;
}

type Props = {
  markers: PublicMapSpotMarker[];
  countries: string[];
  states: string[];
  stateKpis: PublicMapStateKpi[];
  pathPrefix: "" | "/aluno";
};

export function SpotsMapExploreClient({
  markers,
  countries,
  states,
  stateKpis,
  pathPrefix,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qUrl = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? "";
  const state = searchParams.get("state") ?? "";
  const [qInput, setQInput] = useState(qUrl);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const mapBase = pathPrefix ? `${pathPrefix}/mapa` : "/mapa";
  const p = pathPrefix;

  useEffect(() => {
    setQInput(qUrl);
  }, [qUrl]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${mapBase}?${next.toString()}`);
    },
    [router, searchParams, mapBase],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== qUrl) setParam("q", qInput);
    }, 400);
    return () => clearTimeout(t);
  }, [qInput, qUrl, setParam]);

  const spotHref = (slug: string) => `${p}/spot/${slug}`;
  const escolaHref = (orgSlug: string) =>
    p ? `${p}/escola/${orgSlug}` : `/escola/${orgSlug}`;

  const visibleKpis = useMemo(() => {
    const c = country.trim();
    if (!c) return stateKpis;
    return stateKpis.filter((k) => k.country === c);
  }, [stateKpis, country]);

  const hasActiveFilters = Boolean(
    qUrl.trim() || country.trim() || state.trim(),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 md:px-6 md:pt-6 lg:px-8">
        <div className="mb-3 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative shrink-0 shadow-sm"
            aria-expanded={filtersOpen}
            aria-controls="mapa-filtros-panel"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <ListFilter className="size-4" aria-hidden />
            <span className="sr-only">
              {filtersOpen ? "Fechar filtros" : "Abrir filtros"}
            </span>
            {hasActiveFilters && !filtersOpen ? (
              <span
                className="absolute right-1 top-1 size-2 rounded-full bg-primary ring-2 ring-card"
                aria-hidden
              />
            ) : null}
          </Button>
        </div>

        {filtersOpen ? (
          <div
            id="mapa-filtros-panel"
            className="rounded-xl border bg-card p-4 shadow-sm md:p-5"
          >
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
                    onValueChange={(v) =>
                      setParam("country", v === "__all__" ? "" : v)
                    }
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
                    onValueChange={(v) =>
                      setParam("state", v === "__all__" ? "" : v)
                    }
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
                onClick={() => router.push(mapBase)}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        ) : null}

        {visibleKpis.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-muted-foreground">
              Totais por estado — toque para filtrar o mapa.
            </p>
            <div
              className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground md:text-sm"
              role="list"
              aria-label="Legenda dos totais"
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                Spots
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2.5 shrink-0 rounded-full bg-chart-4"
                  aria-hidden
                />
                Escolas
              </span>
            </div>
            <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
              <div className="flex w-max min-w-full flex-nowrap gap-2">
                {visibleKpis.map((k) => {
                  const selected =
                    state === k.state &&
                    (!country.trim() || k.country === country);
                  const spotsLabel = `${k.spotCount} ${k.spotCount === 1 ? "spot" : "spots"}`;
                  const schoolsLabel = `${k.schoolCount} ${k.schoolCount === 1 ? "escola" : "escolas"}`;
                  return (
                    <button
                      key={`${k.country ?? ""}-${k.state}`}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${k.state}: ${spotsLabel}, ${schoolsLabel}`}
                      onClick={() =>
                        selected
                          ? setParam("state", "")
                          : setParam("state", k.state)
                      }
                      className={cn(
                        "inline-flex min-w-[4.25rem] shrink-0 items-start gap-2 rounded-xl border px-3 py-2 text-left shadow-sm transition-shadow",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-card-foreground hover:shadow-md",
                      )}
                    >
                      {selected ? (
                        <X
                          className="mt-0.5 size-3.5 shrink-0 opacity-90"
                          aria-hidden
                        />
                      ) : null}
                      <span className="flex min-w-0 flex-col items-start leading-tight">
                        <span className="text-sm font-semibold tabular-nums">
                          {k.state}
                        </span>
                        <span
                          className={cn(
                            "mt-1 text-[11px] leading-tight md:text-xs",
                            selected
                              ? "text-primary-foreground/85"
                              : "text-muted-foreground",
                          )}
                        >
                          Spots · {k.spotCount}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 text-[11px] leading-tight md:text-xs",
                            selected
                              ? "text-primary-foreground/85"
                              : "text-muted-foreground",
                          )}
                        >
                          Escolas · {k.schoolCount}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 h-[min(70vh,560px)] min-h-80 overflow-hidden rounded-xl border bg-card shadow-sm">
          <Map
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="size-full min-h-80 rounded-none border-0"
            scrollWheelZoom
          >
            <MapTileLayer name="Default" />
            <MapFitBounds markers={markers} />
            <MapZoomControl />
            {markers.map((m) => (
              <MapMarker
                key={m.id}
                position={[m.latitude, m.longitude]}
                icon={
                  <MapPin
                    className="size-6 text-primary"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                }
              >
                <MapPopup>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold leading-snug">{m.name}</p>
                    {(m.country || m.state) && (
                      <p className="text-xs text-muted-foreground">
                        {[m.state, m.country].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <Link
                      href={spotHref(m.slug)}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Ver spot
                    </Link>
                    {m.schools.length > 0 && (
                      <div className="border-t pt-2">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Escolas
                        </p>
                        <ul className="space-y-1">
                          {m.schools.map((school) => (
                            <li key={school.id}>
                              <Link
                                href={escolaHref(school.slug)}
                                className="text-primary underline-offset-4 hover:underline"
                              >
                                {school.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </MapPopup>
              </MapMarker>
            ))}
          </Map>
        </div>

        {markers.length === 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Nenhum spot com localização encontrado para estes filtros.
          </p>
        )}
      </div>
    </div>
  );
}
