import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EkiteHomeHeroMedia } from "@/components/marketing/ekite-home-hero-media";
import { IconBox } from "@/components/marketing/icon-box";
import { ModernCard } from "@/components/marketing/modern-card";
import { AppLogo } from "@/components/shared/app-logo";
import {
  Anchor,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Compass,
  Gift,
  Layers,
  MapPin,
  Package,
  Sparkles,
  TrendingUp,
  Users,
  Wind,
  Zap,
} from "@/lib/icons";

const HERO_VIDEO = "/marketing/hero.mp4";
const HERO_POSTER =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663341564225/MxZkjsoQDmQNZpMP69zNB6/ekite-school-instruction-XQt9Vbhxis5KqY2PUwo7YM.webp";
const GROWTH_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663341564225/MxZkjsoQDmQNZpMP69zNB6/ekite-community-riders-gSdZvz2q689yaaVB2o37sz.webp";

export function EkiteParaEscolasPage() {
  return (
    <div className="pb-8">
      <section className="relative -mx-4 min-h-[min(88vh,820px)] overflow-hidden rounded-b-3xl md:-mx-6 md:mx-0 md:rounded-3xl lg:-mx-8 lg:mx-0">
        <EkiteHomeHeroMedia posterSrc={HERO_POSTER} videoSrc={HERO_VIDEO} />

        <div className="container relative z-10 px-4 pb-16 pt-28 md:px-6 md:pb-32 md:pt-36">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">Para Escolas</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-primary md:text-7xl">
              Somos a infraestrutura digital do kitesurf
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Organizar a operação de quem ensina e elevar a experiência de quem pratica. Tudo
              integrado numa plataforma pensada para escolas que querem crescer.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:opacity-95">
                <Link href="/cadastro">
                  Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Link href="/centers">Ver Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <section className="bg-gradient-to-b from-white to-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Crescer e escalar a operação
            </h2>
            <p className="text-lg text-muted-foreground">
              Deixa de perder tempo em tarefas administrativas. Foca no que importa: ensinar e viver
              o kite.
            </p>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="mb-16">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Tudo que precisas para gerir
            </h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Funcionalidades integradas pensadas para a realidade das escolas de kite.
            </p>
          </div>

          <div className="mb-8 grid gap-8 md:grid-cols-2">
            <ModernCard
              icon={<Calendar className="h-full w-full" />}
              title="Agenda Integrada"
              description="Gestão de aulas e horários sincronizados. Visualização clara de disponibilidade e ocupação."
              items={[
                "Calendário visual intuitivo",
                "Sincronização automática",
                "Avisos de conflitos",
              ]}
              variant="primary"
            />
            <ModernCard
              icon={<Users className="h-full w-full" />}
              title="Gestão de Aulas"
              description="Cria, edita e organiza aulas com facilidade. Controla alunos, instrutores e locais."
              items={[
                "Templates de aulas",
                "Atribuição de instrutores",
                "Rastreamento de presença",
              ]}
              variant="secondary"
            />
            <ModernCard
              icon={<Compass className="h-full w-full" />}
              title="Gestão de Instrutores"
              description="Organiza a equipa com perfis, disponibilidades e especialidades. Comunicação centralizada."
              items={[
                "Perfis de instrutores",
                "Disponibilidade em tempo real",
                "Histórico de aulas",
              ]}
              variant="accent"
            />
            <ModernCard
              icon={<MapPin className="h-full w-full" />}
              title="Múltiplos Spots"
              description="Gere operações em vários spots simultaneamente. Sincronização de dados em tempo real."
              items={[
                "Gestão multi-localização",
                "Informações por spot",
                "Coordenação de equipas",
              ]}
              variant="primary"
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <ModernCard
              icon={<BarChart3 className="h-full w-full" />}
              title="Painel de Gestão"
              description="Dashboard completo com métricas, relatórios e insights sobre a operação."
              items={[
                "Métricas em tempo real",
                "Relatórios customizados",
                "Análise de performance",
              ]}
              variant="secondary"
            />
            <ModernCard
              icon={<Bell className="h-full w-full" />}
              title="Notificações para Alunos"
              description="Comunica com alunos automaticamente. Avisos de aulas, cancelamentos e atualizações."
              items={[
                "Notificações automáticas",
                "Integração com WhatsApp",
                "Templates personalizados",
              ]}
              variant="accent"
            />
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 md:py-32">
          <div className="mb-16">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Crescimento e Escalabilidade
            </h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Ferramentas para expandir a operação e aumentar receita.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <ModernCard
              icon={<Gift className="h-full w-full" />}
              title="Programa de Indicações"
              description="Sistema de referência integrado. Incentiva alunos e instrutores a trazerem novos clientes."
              items={[
                "Comissões automáticas",
                "Rastreamento de referências",
                "Relatórios de indicações",
              ]}
              variant="primary"
            />
            <ModernCard
              icon={<Package className="h-full w-full" />}
              title="Gestão de Pacotes"
              description="Cria pacotes de aulas com preços flexíveis. Ofertas sazonais e promoções automáticas."
              items={[
                "Templates de pacotes",
                "Preços dinâmicos",
                "Controle de validade",
              ]}
              variant="secondary"
            />
            <ModernCard
              icon={<TrendingUp className="h-full w-full" />}
              title="Painel Financeiro"
              description="Controla receitas, despesas e lucros. Relatórios financeiros detalhados e previsões."
              items={[
                "Faturação automática",
                "Relatórios financeiros",
                "Análise de rentabilidade",
              ]}
              variant="accent"
            />
            <ModernCard
              icon={<Zap className="h-full w-full" />}
              title="Automações"
              description="Automatiza tarefas repetitivas. Workflows customizados para a tua operação."
              items={[
                "Fluxos de trabalho",
                "Ações agendadas",
                "Integrações com APIs",
              ]}
              variant="primary"
            />
          </div>
        </section>

        <section id="growth" className="py-20 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Viver o kite, não a burocracia
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                A infraestrutura digital que permite que as escolas se focarem no que realmente
                importa: ensinar com qualidade, crescer de forma sustentável e viver a paixão pelo
                kite.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 transition-all hover:border-primary/40 hover:shadow-md">
                  <IconBox icon={<Anchor className="h-full w-full" />} variant="primary" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Operação Fluida</h4>
                    <p className="text-sm text-muted-foreground">Tudo sincronizado e automatizado</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent p-5 transition-all hover:border-secondary/40 hover:shadow-md">
                  <IconBox icon={<Layers className="h-full w-full" />} variant="secondary" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Escalabilidade</h4>
                    <p className="text-sm text-muted-foreground">Cresce com a tua escola</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-5 transition-all hover:border-accent/40 hover:shadow-md">
                  <IconBox icon={<TrendingUp className="h-full w-full" />} variant="accent" size="md" />
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">Crescimento Sustentável</h4>
                    <p className="text-sm text-muted-foreground">Ferramentas para expandir receita</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={GROWTH_IMG}
                alt=""
                className="rounded-2xl shadow-2xl"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent" />
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 md:py-32">
          <div className="mb-16 text-center">
            <h2 className="mx-auto mb-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Benefícios para a tua escola
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 flex items-start gap-4">
                <IconBox icon={<CheckCircle2 className="h-full w-full" />} variant="primary" size="md" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">Menos Tempo Administrativo</h3>
              </div>
              <p className="text-muted-foreground">
                Automatiza tarefas repetitivas e liberta tempo para o que realmente importa.
              </p>
            </div>
            <div className="group rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent p-8 transition-all hover:border-secondary/40 hover:shadow-lg">
              <div className="mb-4 flex items-start gap-4">
                <IconBox icon={<TrendingUp className="h-full w-full" />} variant="secondary" size="md" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">Mais Receita</h3>
              </div>
              <p className="text-muted-foreground">
                Ferramentas para aumentar vendas, gerir pacotes e criar novas fontes de receita.
              </p>
            </div>
            <div className="group rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 transition-all hover:border-accent/40 hover:shadow-lg">
              <div className="mb-4 flex items-start gap-4">
                <IconBox icon={<Users className="h-full w-full" />} variant="accent" size="md" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">Melhor Experiência</h3>
              </div>
              <p className="text-muted-foreground">
                Alunos mais satisfeitos com comunicação clara e agendamento simplificado.
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 py-20 text-primary-foreground md:py-32">
          <div className="absolute top-0 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 translate-y-1/2 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">Começa a crescer agora</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              A infraestrutura digital que a tua escola precisa para escalar. Sem complicações, sem
              surpresas.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-white font-semibold text-primary shadow-lg hover:bg-white/90">
                <Link href="/cadastro">
                  Começar Teste Gratuito <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white font-semibold text-white hover:bg-white/10"
              >
                <Link href="/centers">Agendar Demo</Link>
              </Button>
            </div>
          </div>
        </section>

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
                    <Link href="/para-escolas" className="transition hover:text-white">
                      Para escolas
                    </Link>
                  </li>
                  <li>
                    <Link href="/home" className="transition hover:text-white">
                      Início
                    </Link>
                  </li>
                  <li>
                    <Link href="/spots" className="transition hover:text-white">
                      Spots
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
