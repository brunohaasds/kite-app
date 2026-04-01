import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  /** URL absoluta ou caminho em `public/` (ex.: `/marketing/spots.jpg`). */
  backgroundImage?: string;
};

export function PublicDirectoryHero({ title, subtitle, backgroundImage }: Props) {
  const withPhoto = Boolean(backgroundImage);

  return (
    <div
      className={cn(
        "relative overflow-hidden px-4 pb-10 pt-8 md:mx-auto md:mb-2 md:mt-6 md:max-w-6xl md:rounded-2xl md:pb-12 md:pt-10",
        withPhoto
          ? "min-h-[min(42vh,320px)] md:min-h-[min(38vh,360px)] md:border md:border-primary/15 md:shadow-sm"
          : "bg-gradient-to-br from-primary/25 via-primary/10 to-background md:border md:border-primary/15 md:shadow-sm",
      )}
    >
      {withPhoto && backgroundImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-background"
            aria-hidden
          />
        </>
      ) : null}

      <div className="relative z-10 mx-auto max-w-3xl text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">{subtitle}</p>
      </div>
    </div>
  );
}
