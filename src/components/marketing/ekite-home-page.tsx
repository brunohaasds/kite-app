import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Users,
  Calendar,
  Globe,
  Store,
  Wind,
  Plane,
  Sparkles,
  Quote,
} from "@/lib/icons";
import { EkiteHeroBackground } from "@/components/marketing/ekite-hero-background";
import { cn } from "@/lib/utils";

function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-14 md:py-20", className)}>
      {children}
    </section>
  );
}

export function EkiteHomePage() {
  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative -mx-4 min-h-[min(88vh,820px)] overflow-hidden rounded-b-3xl md:-mx-6 md:mx-0 md:rounded-3xl lg:-mx-8 lg:mx-0">
        <EkiteHeroBackground />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/45 to-black/25"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[min(88vh,820px)] flex-col justify-end px-6 pb-16 pt-28 md:px-12 md:pb-20">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/90">
            eKite
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
            O vento é o que nos move.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            Uma plataforma que coloca o rider no centro e organiza tudo ao redor: escolas,
            aulas, spots e conexões.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/spots">Explorar spots</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="border border-white/20 bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <Link href="/centers">Ver centros</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {/* Proposta */}
        <Section>
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary">
            Porquê eKite
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight md:text-4xl">
            Tudo isso deveria ser simples.
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-4 text-center text-muted-foreground md:text-lg">
            <p>
              A eKite nasce para simplificar a vida de quem vive o kite — dentro e fora da
              água. Organizamos escolas, aulas, spots e conexões num só sítio.
            </p>
            <p>
              Acreditamos que o kite não é só um esporte. É liberdade, é estilo de vida, é
              comunidade.
            </p>
          </div>
        </Section>

        {/* Conceito */}
        <Section className="rounded-3xl border bg-card/50 py-12 shadow-sm md:py-16">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Conceito</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            A eKite conecta riders, escolas e spots num único ecossistema — integrado, fluido e
            gratuito.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Riders",
                body: "Menos fricção, mais tempo na água.",
                icon: Wind,
              },
              {
                title: "Escolas",
                body: "Menos gestão, mais aulas.",
                icon: Store,
              },
              {
                title: "Spots",
                body: "O motor de descoberta e distribuição orgânica.",
                icon: MapPin,
              },
            ].map((c) => (
              <Card key={c.title} className="border bg-background/80 shadow-sm">
                <CardHeader className="pb-2">
                  <c.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{c.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Como funciona */}
        <Section>
          <h2 className="text-center text-2xl font-bold md:text-3xl">Como funciona</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Card className="border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-6 w-6 text-primary" />
                  Para o rider
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  Abre a app, encontra spots próximos, vê escolas disponíveis e agenda uma aula em
                  poucos cliques.
                </p>
              </CardContent>
            </Card>
            <Card className="border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6 text-primary" />
                  Para a escola
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  Landing com a tua marca, agenda online, gestão de alunos e presença nos spots
                  onde atuas.
                </p>
                <p className="font-medium text-foreground">
                  No lugar certo, à hora certa — a escola passa a receber alunos de forma mais
                  natural.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Funcionalidades */}
        <Section id="funcionalidades">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Funcionalidades</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Wind}
              title="Experiência do rider"
              items={[
                "Descoberta de spots",
                "Agendamento de aulas",
                "Recomendações",
                "Conexão com escolas e comunidade",
              ]}
            />
            <FeatureCard
              icon={Store}
              title="Escolas e instrutores"
              items={[
                "Gestão de aulas e alunos",
                "Agenda integrada",
                "Controlo simples do dia a dia",
                "Página própria (estilo link na bio)",
              ]}
            />
            <FeatureCard
              icon={MapPin}
              title="Spots"
              items={[
                "Mapeamento de locais",
                "Escolas por spot",
                "Distribuição orgânica de alunos",
              ]}
            />
            <FeatureCard
              icon={Globe}
              title="Presença digital"
              items={[
                "Página personalizada por escola",
                "Links, agenda e contacto",
                "Canal direto de captação",
              ]}
            />
            <FeatureCard
              icon={Plane}
              title="Em breve — Kite Trips"
              items={["Viagens e experiências", "Conexões entre riders", "Exploração global"]}
              muted
            />
          </div>
        </Section>

        {/* Slogan */}
        <Section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl rounded-3xl border bg-gradient-to-br from-primary/15 via-background to-primary/5 px-8 py-14 text-center shadow-inner md:px-12">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
            <p className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Menos fricção. Mais kite.
            </p>
          </div>
        </Section>

        {/* Crenças */}
        <Section>
          <h2 className="text-center text-2xl font-bold md:text-3xl">No que acreditamos</h2>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-3 text-center text-muted-foreground md:text-lg">
            {[
              "Que o vento conecta pessoas",
              "Que a tecnologia deve simplificar, não complicar",
              "Que quem vive o kite merece ferramentas feitas para a sua realidade",
              "Que comunidade é tão importante quanto performance",
              "Que o futuro é conectado, leve e acessível",
            ].map((t) => (
              <li
                key={t}
                className="rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-foreground/90"
              >
                {t}
              </li>
            ))}
          </ul>
        </Section>

        {/* Propósito */}
        <Section className="border-t pt-12">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Propósito</h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-muted-foreground md:text-xl">
            Criar a infraestrutura digital do kitesurf — organizando a operação de quem ensina e
            elevando a experiência de quem pratica.
          </p>
        </Section>

        {/* Testemunho */}
        <Section>
          <Card className="mx-auto max-w-3xl border bg-card shadow-md">
            <CardContent className="pt-8">
              <Quote className="mb-4 h-10 w-10 text-primary/60" />
              <blockquote className="text-lg leading-relaxed text-foreground md:text-xl">
                &ldquo;Antes da eKite, eu organizava tudo no WhatsApp e em planilhas. Era confuso e
                perdia tempo. Hoje a minha agenda está organizada, os alunos chegam pelos spots e
                consigo focar no que importa: dar aula e viver o kite.&rdquo;
              </blockquote>
              <p className="mt-6 font-semibold text-foreground">Maicon Louva</p>
              <p className="text-sm text-muted-foreground">Escola parceira</p>
            </CardContent>
          </Card>
        </Section>

        {/* CTA final */}
        <Section className="pb-4">
          <div className="rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground shadow-lg md:px-12">
            <h2 className="text-2xl font-bold md:text-3xl">Começa agora</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">
              Explora spots e centros, ou entra na tua conta.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/cadastro">Criar conta</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/spots">Ver spots</Link>
              </Button>
            </div>
          </div>
        </Section>

        {/* Footer simples */}
        <footer className="border-t py-10 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">eKite</p>
          <p className="mt-1">Menos fricção. Mais kite.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/spots" className="hover:text-foreground">
              Spots
            </Link>
            <Link href="/centers" className="hover:text-foreground">
              Centros
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Entrar
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  items,
  muted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <Card
      className={cn(
        "h-full border shadow-sm",
        muted ? "bg-muted/30 opacity-95" : "bg-card",
      )}
    >
      <CardHeader className="pb-2">
        <Icon className="mb-1 h-7 w-7 text-primary" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((it) => (
            <li key={it} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
