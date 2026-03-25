import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminSchoolPageHeaderProps = {
  title: string;
  /** Linha secundária no banner mobile; no desktop, texto muted abaixo do título (se não for só mobile). */
  subtitle?: ReactNode;
  /** Se true, o subtítulo aparece só no banner mobile (ex.: nome da escola no dashboard). */
  subtitleMobileOnly?: boolean;
  /** Ação à direita no desktop; no mobile, abaixo do banner (exceto se desktopEndDesktopOnly). */
  desktopEnd?: ReactNode;
  /** Se true, `desktopEnd` só no layout largo (evita duplicar link/texto já no banner mobile). */
  desktopEndDesktopOnly?: boolean;
  /** Ex.: botão voltar — ao lado do título no desktop; no topo do banner no mobile. */
  start?: ReactNode;
};

export function AdminSchoolPageHeader({
  title,
  subtitle,
  subtitleMobileOnly = false,
  desktopEnd,
  desktopEndDesktopOnly = false,
  start,
}: AdminSchoolPageHeaderProps) {
  const hasSubtitle =
    subtitle != null && subtitle !== "";

  const showMobileEnd = desktopEnd && !desktopEndDesktopOnly;

  return (
    <div className="mb-6">
      <div className="mb-6 lg:hidden">
        <div
          className={cn(
            "-mx-4 -mt-4 rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg",
            showMobileEnd ? "mb-4" : "",
          )}
        >
          {start ? (
            <div className="mb-3 flex shrink-0 [&_a]:text-primary-foreground [&_button]:text-primary-foreground [&_a]:hover:bg-primary-foreground/15 [&_button]:hover:bg-primary-foreground/15">
              {start}
            </div>
          ) : null}
          <h1 className="mb-1 text-2xl font-bold">{title}</h1>
          {hasSubtitle ? (
            <p className="text-sm opacity-90">{subtitle}</p>
          ) : null}
        </div>
        {showMobileEnd ? (
          <div className="flex justify-end">{desktopEnd}</div>
        ) : null}
      </div>

      <div
        className={cn(
          "hidden lg:flex lg:justify-between lg:gap-4",
          start || desktopEnd ? "lg:items-center" : "lg:items-start",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {start}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {hasSubtitle && !subtitleMobileOnly ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {desktopEnd}
      </div>
    </div>
  );
}
