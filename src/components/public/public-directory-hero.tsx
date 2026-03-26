type Props = {
  title: string;
  subtitle: string;
};

export function PublicDirectoryHero({ title, subtitle }: Props) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-background px-4 pb-10 pt-8 md:mx-auto md:mb-2 md:mt-6 md:max-w-6xl md:rounded-2xl md:border md:border-primary/15 md:pb-12 md:pt-10 md:shadow-sm">
      <div className="mx-auto max-w-3xl text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">{subtitle}</p>
      </div>
    </div>
  );
}
