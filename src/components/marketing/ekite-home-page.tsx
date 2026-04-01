import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EkiteHomeHeroMedia } from "@/components/marketing/ekite-home-hero-media";
import { IconBox } from "@/components/marketing/icon-box";
import { ModernCard } from "@/components/marketing/modern-card";
import { AppLogo } from "@/components/shared/app-logo";
import {
  Anchor,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  Map,
  Quote,
  TrendingUp,
  Users,
  Waves,
  Wind,
  Zap,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

const HERO_VIDEO = "/marketing/hero.mp4";
const HERO_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663341564225/MxZkjsoQDmQNZpMP69zNB6/ekite-hero-kitesurf-action-ErExXvjZSGbeTnS33TTBLK.webp";
const COMMUNITY_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663341564225/MxZkjsoQDmQNZpMP69zNB6/ekite-community-riders-gSdZvz2q689yaaVB2o37sz.webp";
const SPOT_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663341564225/MxZkjsoQDmQNZpMP69zNB6/ekite-spot-discovery-iTvbAFJ8dkkQV2QcfpjSub.webp";
const SCHOOL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663341564225/MxZkjsoQDmQNZpMP69zNB6/ekite-school-instruction-XQt9Vbhxis5KqY2PUwo7YM.webp";

export function EkiteHomePage() {
  return (
    <div className="pb-8">
      {/* Hero — sem nav duplicada (usa PublicSiteHeader) */}
      <section className="relative -mx-4 min-h-[min(88vh,820px)] overflow-hidden rounded-b-3xl md:-mx-6 md:mx-0 md:rounded-3xl lg:-mx-8 lg:mx-0">
        <EkiteHomeHeroMedia posterSrc={HERO_IMG} videoSrc={HERO_VIDEO} />

        <div className="container relative z-10 px-4 pb-16 pt-28 md:px-6 md:pt-36 md:pb-32">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2">
              <Wind className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">O Vento nos move</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-primary md:text-7xl">
              O futuro do kite é conectado
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Uma plataforma que coloca o kite no centro e organiza tudo à volta: escolas, aulas,
              spots e conexões.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:opacity-95">
                <Link href="/spots">
                  Explorar Spots <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Link href="/centers">Ver Centros</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {/* Tagline */}
        <section className="bg-gradient-to-b from-white to-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2">
              <Waves className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                Para quem vive o kite
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Se você vive o kite, o eKite é para você
            </h2>
            <p className="text-lg text-muted-foreground">
              Riders que querem mais experiência. Escolas que querem crescer. Instrutores que querem
              escalar.
            </p>
          </div>
        </section>

        {/* Três pilares */}
        <section id="features" className="py-20 md:py-32">
          <div className="grid gap-8 md:grid-cols-3">
            <ModernCard
              icon={<Wind className="h-full w-full" />}
              title="Para Riders"
              description="Mais tempo a viver o kite e menos tempo perdido em conversas dispersas. Spots e escolas no mesmo mapa."
              items={[
                "Descoberta de spots com contexto",
                "Agendamento simplificado",
                "Comunidade e recomendações",
              ]}
              variant="primary"
            />
            <ModernCard
              icon={<Users className="h-full w-full" />}
              title="Para Escolas"
              description="Mais visibilidade nos spots onde realmente estão. Organização com menos sobrecarga administrativa."
              items={[
                "Gestão integrada de aulas",
                "Página própria com marca",
                "Captação de novos alunos",
              ]}
              variant="secondary"
            />
            <ModernCard
              icon={<TrendingUp className="h-full w-full" />}
              title="Para Instrutores"
              description="Escale sua operação com ferramentas pensadas para quem ensina. Presença digital e contacto direto."
              items={[
                "Agenda integrada ao dia a dia",
                "Fluxo simples para equipas",
                "Crescimento escalável",
              ]}
              variant="accent"
            />
          </div>
        </section>

        {/* Valor + imagem */}
        <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                O eKite transforma presença em resultado
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Sua escola com identidade própria. Sua agenda funcionando sem esforço. Seus alunos
                organizados. Sua operação fluindo.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-xl border border-primary/10 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-primary/30">
                  <IconBox icon={<Compass className="h-full w-full" />} variant="primary" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Presença Digital</h4>
                    <p className="text-sm text-muted-foreground">Página por escola com contacto e agenda</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-secondary/10 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-secondary/30">
                  <IconBox icon={<Anchor className="h-full w-full" />} variant="secondary" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Organização</h4>
                    <p className="text-sm text-muted-foreground">Gestão de aulas e alunos simplificada</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-accent/10 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-accent/30">
                  <IconBox icon={<Zap className="h-full w-full" />} variant="accent" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Crescimento</h4>
                    <p className="text-sm text-muted-foreground">Mais visibilidade e novos alunos</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMMUNITY_IMG}
                alt=""
                className="rounded-2xl shadow-2xl"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent" />
            </div>
          </div>
        </section>

        {/* Spots */}
        <section id="for-riders" className="py-20 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative order-2 md:order-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SPOT_IMG}
                alt=""
                className="rounded-2xl shadow-2xl"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-bl from-secondary/10 to-transparent" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Mais perto do que importa
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Spots e condições ao teu alcance — descoberta clara, sem ruído. Escolas e instrutores
                com contexto e contacto direto.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 transition-all hover:border-primary/40 hover:shadow-md">
                  <IconBox icon={<Map className="h-full w-full" />} variant="primary" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Mapeamento Inteligente</h4>
                    <p className="text-sm text-muted-foreground">Spots com escolas e contexto local integrados</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent p-5 transition-all hover:border-secondary/40 hover:shadow-md">
                  <IconBox icon={<Calendar className="h-full w-full" />} variant="secondary" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Agendamento Fluido</h4>
                    <p className="text-sm text-muted-foreground">Marcar uma sessão sem pensar</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-5 transition-all hover:border-accent/40 hover:shadow-md">
                  <IconBox icon={<Users className="h-full w-full" />} variant="accent" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Comunidade</h4>
                    <p className="text-sm text-muted-foreground">Estar com as pessoas certas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Escolas */}
        <section id="for-schools" className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Mais vento. Menos esforço.
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Organiza o necessário. Deixa o resto com o vento. Um lugar para quem vive isso.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "White Label",
                    body: "Cada escola tem presença alinhada à sua identidade",
                    border: "border-primary/20 hover:border-primary/40",
                    bg: "from-white to-primary/5",
                    icon: "text-primary",
                  },
                  {
                    title: "Adoção Acessível",
                    body: "Sem barreiras de entrada elevada, escala com a comunidade",
                    border: "border-secondary/20 hover:border-secondary/40",
                    bg: "from-white to-secondary/5",
                    icon: "text-secondary",
                  },
                  {
                    title: "Distribuição Orgânica",
                    body: "Spots como pontos de descoberta natural",
                    border: "border-accent/20 hover:border-accent/40",
                    bg: "from-white to-accent/5",
                    icon: "text-accent",
                  },
                ].map((row) => (
                  <div
                    key={row.title}
                    className={cn(
                      "group rounded-xl border bg-gradient-to-br p-6 transition-all hover:shadow-lg",
                      row.border,
                      row.bg,
                    )}
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <CheckCircle2 className={cn("mt-1 h-5 w-5 shrink-0", row.icon)} />
                      <h4 className="font-semibold text-foreground">{row.title}</h4>
                    </div>
                    <p className="ml-8 text-sm text-muted-foreground">{row.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SCHOOL_IMG}
                alt=""
                className="rounded-2xl shadow-2xl"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tl from-accent/10 to-transparent" />
            </div>
          </div>
        </section>

        {/* Crenças */}
        <section className="py-20 md:py-32">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              No que acreditamos
            </h2>
            <p className="text-lg text-muted-foreground">
              Que o vento conecta pessoas. Que a tecnologia deve simplificar, não complicar.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="group rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 flex items-start gap-4">
                <IconBox icon={<Users className="h-full w-full" />} variant="primary" size="md" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">Comunidade</h3>
              </div>
              <p className="text-muted-foreground">
                Quem vive o kite merece ferramentas feitas para a sua realidade. Comunidade é tão
                importante quanto performance.
              </p>
            </div>
            <div className="group rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent p-8 transition-all hover:border-secondary/40 hover:shadow-lg">
              <div className="mb-4 flex items-start gap-4">
                <IconBox icon={<Compass className="h-full w-full" />} variant="secondary" size="md" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">Futuro Conectado</h3>
              </div>
              <p className="text-muted-foreground">
                O futuro é conectado, leve e acessível. Criamos a infraestrutura digital do kitesurf.
              </p>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="depoimentos" className="border-t bg-muted/20 py-20 md:py-32">
          <h2 className="mb-10 text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Depoimentos
          </h2>
          <Card className="mx-auto max-w-3xl border bg-card shadow-md">
            <CardContent className="pt-8 pb-8 md:px-10">
              <Quote className="mb-4 h-10 w-10 text-primary/60" aria-hidden />
              <blockquote className="text-lg leading-relaxed text-foreground md:text-xl">
                &ldquo;Antes da eKite, eu organizava tudo no WhatsApp e em planilhas. Era confuso e
                perdia tempo. Hoje a minha agenda está organizada, os alunos chegam pelos spots e
                consigo focar no que importa: dar aula e viver o kite.&rdquo;
              </blockquote>
              <p className="mt-6 font-semibold text-foreground">Maicon Louva</p>
              <p className="text-sm text-muted-foreground">Escola parceira</p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 py-20 text-primary-foreground md:py-32">
          <div className="absolute top-0 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 translate-y-1/2 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">Começa agora</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              Explora spots e centros, ou entra na tua conta. O futuro do kite é conectado.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-white font-semibold text-primary shadow-lg hover:bg-white/90">
                <Link href="/spots">
                  Explorar Spots <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white font-semibold text-white hover:bg-white/10"
              >
                <Link href="/centers">Ver Centros</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mb-8 grid gap-8 md:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/80">
                    <Wind className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="text-lg font-bold">eKite</span>
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  Somos a infraestrutura digital do kitesurf — organizar a operação de quem ensina e
                  elevar a experiência de quem pratica.
                </p>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">Produto</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>
                    <Link href="/spots" className="transition hover:text-white">
                      Spots
                    </Link>
                  </li>
                  <li>
                    <Link href="/centers" className="transition hover:text-white">
                      Centros
                    </Link>
                  </li>
                  <li>
                    <Link href="/mapa" className="transition hover:text-white">
                      Mapa
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">Conta</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>
                    <Link href="/login" className="transition hover:text-white">
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link href="/cadastro" className="transition hover:text-white">
                      Criar conta
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">Legal</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>
                    <span className="text-white/50">Privacidade</span>
                  </li>
                  <li>
                    <span className="text-white/50">Termos</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-sm text-white/70 sm:flex-row sm:text-left">
              <AppLogo size="sm" className="max-h-8 brightness-0 invert" />
              <p>© {new Date().getFullYear()} eKite. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
