import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PASSWORD = hashSync("123456", 10);

// Helper: offset days from today
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  // ── Clear in reverse dependency order ──────────────────────
  await prisma.payments.deleteMany();
  await prisma.service_bookings.deleteMany();
  await prisma.sessions.deleteMany();
  await prisma.agenda_slots.deleteMany();
  await prisma.agendas.deleteMany();
  await prisma.student_packages.deleteMany();
  await prisma.packages.deleteMany();
  await prisma.instructors.deleteMany();
  await prisma.students.deleteMany();
  await prisma.invites.deleteMany();
  await prisma.spot_permissions.deleteMany();
  await prisma.service_scope.deleteMany();
  await prisma.services.deleteMany();
  await prisma.members.deleteMany();
  await prisma.spots.deleteMany();
  await prisma.global_spots.deleteMany({ where: { parent_spot_id: { not: null } } });
  await prisma.global_spots.deleteMany();
  await prisma.users.deleteMany();
  await prisma.organizations.deleteMany();

  // ════════════════════════════════════════════════════════════
  // GLOBAL SPOTS — catálogo super-admin (dados reais)
  // ════════════════════════════════════════════════════════════

  // ── Nordeste ────────────────────────────────────────────────
  const gPrea = await prisma.global_spots.create({
    data: {
      name: "Preá",
      slug: "prea",
      country: "Brasil",
      state: "CE",
      access: "public",
      description:
        "Praia de Preá é considerada um dos melhores spots de kitesurf do mundo. Vento constante de 20–30 nós de julho a janeiro, com água agitada e ótimas condições para downwinders até Jericoacoara.",
      tips: [
        "Melhor vento entre 14h e 18h (25–30 nós)",
        "Água mais agitada que Cumbuco — ideal para intermediários e avançados",
        "Downwinder clássico até Jericoacoara (~30 km)",
        "Use protetor solar fator 50+, UV extremo",
        "Lagoa do Tatajuba: flat water para manobras",
      ],
      services: ["Escolas certificadas IKO", "Pousadas beira-praia", "Resgate aquático", "Aluguel de equipamentos"],
      latitude: -2.4833,
      longitude: -40.4533,
    },
  });

  const gJeri = await prisma.global_spots.create({
    data: {
      name: "Jericoacoara",
      slug: "jericoacoara",
      country: "Brasil",
      state: "CE",
      access: "public",
      description:
        "Jericoacoara é uma das praias mais famosas do Brasil. Para o kitesurf, destaca-se a Lagoa da Torta (flat water), o mar principal e a Barrinha. Ventos constantes de julho a fevereiro.",
      tips: [
        "Barrinha e Lagoa da Torta: flat water perfeito",
        "Maré baixa libera as lagoas rasas ideais para iniciantes",
        "Acesso por trilha de areia — 4x4 ou van obrigatório",
        "Alta temporada: setembro a janeiro",
      ],
      services: ["Escolas IKO", "Hostels e pousadas", "Trilha de buggy", "Restaurantes e bares na areia"],
      latitude: -2.7964,
      longitude: -40.5144,
    },
  });

  const gCumbuco = await prisma.global_spots.create({
    data: {
      name: "Cumbuco",
      slug: "cumbuco",
      country: "Brasil",
      state: "CE",
      access: "public",
      description:
        "Cumbuco fica a 30 km de Fortaleza e é o spot mais estruturado do Ceará. A Lagoa do Cauípe oferece água plana, quente e rasa — perfeita para iniciantes. Ventos de 18–32 nós de julho a janeiro.",
      tips: [
        "Lagoa do Cauípe sul: área rasa ideal para iniciantes",
        "Lagoa norte: maior extensão para intermediários/avançados",
        "Mar aberto: ondas e melhores condições para freestyle",
        "Ventos mais fortes no início da tarde",
        "Muitas escolas — compare antes de escolher",
      ],
      services: ["Escolas IKO certificadas", "Buggy nas dunas", "Restaurantes", "Resort e pousadas", "Aluguel de equipamentos"],
      latitude: -3.4583,
      longitude: -38.7222,
    },
  });

  const gCanoa = await prisma.global_spots.create({
    data: {
      name: "Canoa Quebrada",
      slug: "canoa-quebrada",
      country: "Brasil",
      state: "CE",
      access: "public",
      description:
        "Canoa Quebrada tem falésias coloridas e extensas planícies de areia com ventos de leste. A temporada vai de julho a janeiro, com picos de 20–30 nós. Recomendada para intermediários e avançados.",
      tips: [
        "Vento manhã: lateral (bom); tarde: mais onshore",
        "Período de ouro: setembro a dezembro",
        "Falésias nas bordas — atenção ao limite do spot",
        "Vento mais forte que Fortaleza, mas mais irregular",
      ],
      services: ["Pousadas e hostels", "Broadway (rua principal com bares)", "Buggy nas dunas", "Passeios de jangada"],
      latitude: -4.3333,
      longitude: -37.6667,
    },
  });

  const gGuajiru = await prisma.global_spots.create({
    data: {
      name: "Ilha do Guajiru",
      slug: "ilha-do-guajiru",
      country: "Brasil",
      state: "CE",
      access: "public",
      description:
        "Ilha do Guajiru (Itarema, CE) é um paraíso remoto com lagoas cristalinas de água doce e rasa. Flat water quase sempre, ventos de 15–25 nós e beleza natural intocada.",
      tips: [
        "Acesso por barco ou trilha — planeje a logística",
        "Lagoas rasas: ideal para iniciantes e travessias",
        "Poucas estruturas: leve tudo que precisar",
        "Combinação perfeita com Preá e Jeri",
      ],
      services: ["Pousadas rústicas", "Guias locais", "Barco de acesso"],
      latitude: -2.9667,
      longitude: -39.9000,
    },
  });

  const gSaoMiguel = await prisma.global_spots.create({
    data: {
      name: "São Miguel do Gostoso",
      slug: "sao-miguel-do-gostoso",
      country: "Brasil",
      state: "RN",
      access: "public",
      description:
        "São Miguel do Gostoso é a joia do litoral potiguar. A 120 km de Natal, tem praias tranquilas com ventos consistentes de outubro a fevereiro (18–30 nós, 95% de probabilidade de vento). Atmosfera laid-back, água quente (~27 °C).",
      tips: [
        "Alta temporada: outubro a fevereiro",
        "Praia de Tourinhos: spot principal, água calma",
        "Praia de Manibu: mais ventosa, para avançados",
        "Vila pequena — reservar pousada com antecedência",
        "Downwinder clássico entre as praias",
      ],
      services: ["Escolas de kite", "Pousadas ecológicas", "Restaurantes de frutos do mar", "Aluguel de bikes"],
      latitude: -5.2667,
      longitude: -35.7167,
    },
  });

  const gBarraGrande = await prisma.global_spots.create({
    data: {
      name: "Barra Grande",
      slug: "barra-grande-pi",
      country: "Brasil",
      state: "PI",
      access: "public",
      description:
        "Barra Grande (Cajueiro da Praia, PI) é chamada de 'o Jericoacoara do passado'. 4 km de praia com ventos acima de 20 nós de agosto a dezembro — chegando a 35 nós no fim da tarde em setembro/outubro. Spot mundial com estrutura crescente.",
      tips: [
        "Setembro a novembro: ventos mais fortes (até 35 nós)",
        "Água levemente mais agitada que Cumbuco",
        "Vista do Delta do Parnaíba imperdível",
        "Combinar com Atins (MA): downwinder épico",
        "Kitesurf Escola Paraíso referência local",
      ],
      services: ["Escola de kite local", "Pousadas beira-praia", "Passeios ao Delta do Parnaíba"],
      latitude: -2.8000,
      longitude: -41.0167,
    },
  });

  const gAtins = await prisma.global_spots.create({
    data: {
      name: "Atins — Lençóis Maranhenses",
      slug: "atins",
      country: "Brasil",
      state: "MA",
      access: "public",
      description:
        "Atins fica na foz do Rio Preguiças, dentro do Parque Nacional dos Lençóis Maranhenses. Flat water na foz do rio + praia com ventos de 15–25 nós de junho a janeiro. Palco do Red Bull Rally dos Ventos (maior rally de kite do mundo).",
      tips: [
        "Acesso por barco de Barreirinhas (3h) ou avião fretado",
        "Lagoas dos Lençóis (temporada chuvosa): disponíveis até out/nov",
        "Foz do Rio Preguiças: flat water perfeito para avançados",
        "Infraestrutura básica — levar dinheiro (sem ATM)",
        "Temporada: junho a janeiro",
      ],
      services: ["Pousadas ecológicas", "Escola de kite na praia", "Passeios de barco pelo delta"],
      latitude: -2.5333,
      longitude: -43.1167,
    },
  });

  // ── Santa Catarina ──────────────────────────────────────────
  const gLagoaConceicao = await prisma.global_spots.create({
    data: {
      name: "Lagoa da Conceição",
      slug: "lagoa-da-conceicao",
      country: "Brasil",
      state: "SC",
      access: "public",
      description:
        "A Lagoa da Conceição em Florianópolis é uma das melhores lagoas de kitesurf do Brasil. Água plana e rasa, ventos de N/NE e S/SE, e grande área para water launching. Melhor temporada: setembro a março.",
      tips: [
        "Vento norte (verão): ideal para iniciantes — água calma",
        "Vento sul (inverno): mais forte e agitado",
        "Evitar horários de pico de jet-ski",
        "Escola na margem leste da lagoa",
        "Ótima infraestrutura: cafés, restaurantes, parking",
      ],
      services: ["Escolas IKO", "Aluguel de pranchas SUP", "Restaurantes beira-lagoa", "Estacionamento gratuito", "Acesso via Lagoa da Conceição (SC-406)"],
      latitude: -27.6167,
      longitude: -48.4333,
    },
  });

  const gIbiraquera = await prisma.global_spots.create({
    data: {
      name: "Ibiraquera",
      slug: "ibiraquera",
      country: "Brasil",
      state: "SC",
      access: "public",
      description:
        "A Lagoa de Ibiraquera (Imbituba/Garopaba, SC) é um dos melhores spots de kitesurf do sul do Brasil. Flat water extenso, ventos sul/sudeste consistentes no inverno e ventos norte no verão. Preferida por quem quer evitar a lotação de Floripa.",
      tips: [
        "Inverno (maio–agosto): vento sul forte, 20–35 nós",
        "Verão (nov–mar): vento norte, mais calmo — bom para iniciantes",
        "Lagoa grande com área de sobra para todas as direções",
        "Barra da Ibiraquera: acesso à praia do mar",
        "Praia do Rosa a 5 km: para ondas",
      ],
      services: ["Escolas de kite", "Pousadas ecológicas", "Surf camp", "Aluguel de equipamentos"],
      latitude: -28.2167,
      longitude: -48.6167,
    },
  });

  const gLagunasc = await prisma.global_spots.create({
    data: {
      name: "Laguna",
      slug: "laguna-sc",
      country: "Brasil",
      state: "SC",
      access: "public",
      description:
        "Laguna tem dois spots principais: a Praia da Galheta (kitesurf no mar com ventos sul) e o Canal da Barra (flat water). Ventos sul e sudeste constantes no inverno, bom para todos os níveis.",
      tips: [
        "Galheta: ventos sul/sudeste fortes, para intermediários e avançados",
        "Canal da Barra: flat water para iniciantes",
        "Muito vento no inverno — verifique a previsão sempre",
        "Histórica cidade de Laguna: ótima gastronomia",
      ],
      services: ["Escolas de kite local", "Pousadas e hotéis", "Restaurantes de frutos do mar", "Museu histórico"],
      latitude: -28.4833,
      longitude: -48.7833,
    },
  });

  const gGaropaba = await prisma.global_spots.create({
    data: {
      name: "Garopaba",
      slug: "garopaba",
      country: "Brasil",
      state: "SC",
      access: "public",
      description:
        "Garopaba é conhecida como a 'capital catarinense do surf' mas tem boas condições de kitesurf no inverno com ventos sul/sudeste. A Lagoa de Ibiraquera (5 km) é o principal spot flat water da região.",
      tips: [
        "Praia principal: vento lateral sul — bom para freestyle",
        "Inverno: ventos mais fortes e consistentes",
        "Combinar com Ibiraquera para flat water",
        "Baleia-franca avistamento (junho–novembro)",
      ],
      services: ["Escola de surf e kite", "Pousadas e campings", "Restaurantes e padarias artesanais"],
      latitude: -28.0333,
      longitude: -48.6167,
    },
  });

  // ── Rio Grande do Sul ───────────────────────────────────────
  const gTramandai = await prisma.global_spots.create({
    data: {
      name: "Tramandaí",
      slug: "tramandai",
      country: "Brasil",
      state: "RS",
      access: "public",
      description:
        "Tramandaí tem 12 km de praia com ventos consistentes de sul e sudeste. O Rio Tramandaí oferece flat water calmo para iniciantes. Principal destino de kitesurf do RS, a 118 km de Porto Alegre.",
      tips: [
        "Rio Tramandaí: flat water ideal para aprendizado",
        "Praia oceânica: ventos fortes sul/sudeste no outono-inverno",
        "Temporada principal: março a setembro (ventos sul)",
        "Cuidado com a corrente na barra do rio",
      ],
      services: ["Escola de kite local", "Pousadas e apart-hotéis", "Bares e restaurantes na orla", "Estacionamento na praia"],
      latitude: -29.9841,
      longitude: -50.1322,
    },
  });

  const gCapao = await prisma.global_spots.create({
    data: {
      name: "Capão da Canoa",
      slug: "capao-da-canoa",
      country: "Brasil",
      state: "RS",
      access: "public",
      description:
        "Capão da Canoa tem infraestrutura turística bem desenvolvida e ventos sul/sudeste favoráveis no outono e inverno. A Lagoa dos Quadros, a 8 km, é o flat water preferido da região.",
      tips: [
        "Lagoa dos Quadros: flat water, ideal para iniciantes",
        "Praia oceânica: ventos sul cruzados no outono",
        "Temporada: abril a outubro",
        "Cidade boa base para explorar o litoral norte gaúcho",
      ],
      services: ["Escola de kite e surf", "Hotéis e pousadas", "Restaurantes e pizzarias", "Parque aquático próximo"],
      latitude: -29.7500,
      longitude: -50.0000,
    },
  });

  const gTorres = await prisma.global_spots.create({
    data: {
      name: "Torres",
      slug: "torres-rs",
      country: "Brasil",
      state: "RS",
      access: "public",
      description:
        "Torres é a cidade mais ao norte do RS, na fronteira com SC. Praias oceânicas com basalto e ventos sul/sudeste fortes. Spot mais desafiador do RS — recomendado para intermediários e avançados.",
      tips: [
        "Praia Grande: extensa, vento sul constante no inverno",
        "Molhes da Barra: cuidado — ventos e correntes fortes",
        "Balões coloridos em outubro (Festival Internacional de Balonismo)",
        "Combinar com Praia de Itapeva: menos frequentada",
      ],
      services: ["Escola de kite e surf", "Pousadas e hotéis", "Restaurantes com frutos do mar", "Parque da Guarita (basalto)"],
      latitude: -29.3333,
      longitude: -49.7333,
    },
  });

  // ════════════════════════════════════════════════════════════
  // ORGANIZATIONS — 6 escolas reais
  // ════════════════════════════════════════════════════════════

  // ── Nordeste ────────────────────────────────────────────────
  const orgCumbuco = await prisma.organizations.create({
    data: {
      slug: "cumbuco-kite-academy",
      name: "Cumbuco Kite Academy",
      description:
        "Maior escola de kitesurf do Ceará, localizada na beira da Lagoa do Cauípe em Cumbuco. Instrutores certificados IKO, equipamentos modernos e atendimento em português, inglês e espanhol. Especialidade em iniciantes com a lagoa flat water mais famosa do Brasil.",
      site: "https://cumbucoKiteAcademy.com.br",
      instagram: "cumbucoKiteAcademy",
      whatsapp: "5585999010001",
      settings: {
        defaultSessionDuration: 120,
        bookingRules: [
          "Chegar 15 minutos antes da aula",
          "Cancelamentos com menos de 24h serão cobrados",
          "Equipamento incluso em todos os pacotes",
          "Mínimo de vento: 12 nós para aula",
        ],
      },
    },
  });

  const orgRancho = await prisma.organizations.create({
    data: {
      slug: "rancho-do-vento-kite",
      name: "Rancho do Vento Kite School",
      description:
        "Escola de kitesurf em Preá com operações também em Jericoacoara. Especialistas em downwinders e no vento consistente do litoral cearense. Instrutores certificados IKO com mais de 10 anos de experiência.",
      site: "https://ranchodovento.com.br",
      instagram: "ranchodovento",
      whatsapp: "5588999020001",
      settings: {
        defaultSessionDuration: 120,
        bookingRules: [
          "Chegar 20 minutos antes para equipar",
          "Downwinders confirmados com 24h de antecedência",
          "Cancelamento por clima sem cobrança",
        ],
      },
    },
  });

  // ── Santa Catarina ──────────────────────────────────────────
  const orgFloripa = await prisma.organizations.create({
    data: {
      slug: "floripa-kite",
      name: "Floripa Kite School",
      description:
        "Escola de kitesurf na Lagoa da Conceição, Florianópolis. O spot mais completo de SC: água plana, ventos regulares e infraestrutura de ponta. Cursos IKO do nível 1 ao 3, turmas reduzidas e acompanhamento personalizado.",
      site: "https://floripakite.com.br",
      instagram: "floripakite",
      whatsapp: "5548999030001",
      settings: {
        defaultSessionDuration: 120,
        bookingRules: [
          "Turmas com no máximo 4 alunos por instrutor",
          "Cancelamentos até 48h antes sem custo",
          "Equipamentos modernos inclusos",
          "Vento mínimo: 10 nós para lagoa",
        ],
      },
    },
  });

  const orgLaguna = await prisma.organizations.create({
    data: {
      slug: "laguna-kite-school",
      name: "Laguna Kite School",
      description:
        "Escola de kitesurf em Laguna, SC. Operações no Canal da Barra (flat water) e na Praia da Galheta (mar aberto). Especializada em evolução de intermediários para avançados, com ênfase em vento sul.",
      site: "https://lagunakite.com.br",
      instagram: "lagunakiteschool",
      whatsapp: "5548999040001",
      settings: {
        defaultSessionDuration: 120,
        bookingRules: [
          "Aulas suspensas com vento acima de 40 nós",
          "Cancelamento por clima sem cobrança",
          "Wetsuit obrigatório no inverno (incluso)",
        ],
      },
    },
  });

  // ── Rio Grande do Sul ───────────────────────────────────────
  const orgRsKite = await prisma.organizations.create({
    data: {
      slug: "rs-kite-tramandai",
      name: "RS Kite Tramandaí",
      description:
        "Escola de kitesurf em Tramandaí, litoral norte do RS. Operações no Rio Tramandaí (flat water) e no mar aberto. Especialistas no vento sul gaúcho e em aulas durante a temporada de inverno.",
      site: "https://rskite.com.br",
      instagram: "rskitetramandai",
      whatsapp: "5551999050001",
      settings: {
        defaultSessionDuration: 120,
        bookingRules: [
          "Temporada principal: março a setembro",
          "Wetsuit fornecido no inverno",
          "Cancelamento por clima sem cobrança",
          "Reservas com 48h de antecedência",
        ],
      },
    },
  });

  const orgVentoSul = await prisma.organizations.create({
    data: {
      slug: "vento-sul-kite",
      name: "Vento Sul Kite School",
      description:
        "Escola de kitesurf em Capão da Canoa com operações em Torres. Vento sul cruzado no litoral norte gaúcho, flat water na Lagoa dos Quadros e mar aberto para intermediários e avançados.",
      site: "https://ventosulkite.com.br",
      instagram: "ventosulkite",
      whatsapp: "5551999060001",
      settings: {
        defaultSessionDuration: 120,
        bookingRules: [
          "Aulas na Lagoa dos Quadros para iniciantes",
          "Aulas no mar apenas para intermediários+",
          "Cancelamento com 24h sem custo",
        ],
      },
    },
  });

  // ════════════════════════════════════════════════════════════
  // SPOTS operacionais (org ↔ global_spot)
  // ════════════════════════════════════════════════════════════

  const spotCumbuco = await prisma.spots.create({
    data: {
      organization_id: orgCumbuco.id,
      global_spot_id: gCumbuco.id,
      name: "Lagoa do Cauípe",
      description: "Base principal da Cumbuco Kite Academy na lagoa flat water",
    },
  });

  const spotPrea = await prisma.spots.create({
    data: {
      organization_id: orgRancho.id,
      global_spot_id: gPrea.id,
      name: "Preá",
      description: "Spot principal do Rancho do Vento — praia de Preá com vento constante",
    },
  });

  const spotJeri = await prisma.spots.create({
    data: {
      organization_id: orgRancho.id,
      global_spot_id: gJeri.id,
      name: "Jericoacoara",
      description: "Lagoa da Torta e Barrinha — operações do Rancho do Vento",
    },
  });

  const spotLagoaConceicao = await prisma.spots.create({
    data: {
      organization_id: orgFloripa.id,
      global_spot_id: gLagoaConceicao.id,
      name: "Lagoa da Conceição",
      description: "Spot principal da Floripa Kite — flat water, ventos regulares",
    },
  });

  const spotIbiraquera = await prisma.spots.create({
    data: {
      organization_id: orgFloripa.id,
      global_spot_id: gIbiraquera.id,
      name: "Ibiraquera",
      description: "Spot secundário da Floripa Kite — lagoa extensa a 60 km",
    },
  });

  const spotGalheta = await prisma.spots.create({
    data: {
      organization_id: orgLaguna.id,
      global_spot_id: gLagunasc.id,
      name: "Praia da Galheta",
      description: "Mar aberto com vento sul — Laguna Kite School",
    },
  });

  const spotTramandai = await prisma.spots.create({
    data: {
      organization_id: orgRsKite.id,
      global_spot_id: gTramandai.id,
      name: "Rio Tramandaí",
      description: "Flat water no Rio Tramandaí — base da RS Kite",
    },
  });

  const spotCapao = await prisma.spots.create({
    data: {
      organization_id: orgVentoSul.id,
      global_spot_id: gCapao.id,
      name: "Capão da Canoa",
      description: "Spot principal da Vento Sul na praia de Capão da Canoa",
    },
  });

  const spotTorres = await prisma.spots.create({
    data: {
      organization_id: orgVentoSul.id,
      global_spot_id: gTorres.id,
      name: "Torres",
      description: "Spot avançado da Vento Sul — Praia Grande, Torres",
    },
  });

  // ════════════════════════════════════════════════════════════
  // USERS
  // ════════════════════════════════════════════════════════════

  const superAdmin = await prisma.users.create({
    data: {
      name: "Super Admin",
      email: "superadmin@kiteapp.com",
      phone: "5511999000000",
      password: PASSWORD,
      role: "superadmin",
    },
  });

  // ── Admins ─────────────────────────────────────────────────
  const adminCumbuco = await prisma.users.create({
    data: { name: "Felipe Aguiar", email: "admin@cumbucoKite.com", phone: "5585999010010", password: PASSWORD, role: "admin" },
  });
  const adminRancho = await prisma.users.create({
    data: { name: "Fernanda Duarte", email: "admin@ranchodovento.com", phone: "5588999020010", password: PASSWORD, role: "admin" },
  });
  const adminFloripa = await prisma.users.create({
    data: { name: "Gustavo Lemos", email: "admin@floripakite.com", phone: "5548999030010", password: PASSWORD, role: "admin" },
  });
  const adminLaguna = await prisma.users.create({
    data: { name: "Renata Corrêa", email: "admin@lagunakite.com", phone: "5548999040010", password: PASSWORD, role: "admin" },
  });
  const adminRsKite = await prisma.users.create({
    data: { name: "Rodrigo Farias", email: "admin@rskite.com", phone: "5551999050010", password: PASSWORD, role: "admin" },
  });
  const adminVentoSul = await prisma.users.create({
    data: { name: "Carla Neves", email: "admin@ventosulkite.com", phone: "5551999060010", password: PASSWORD, role: "admin" },
  });

  // ── Instructors ─────────────────────────────────────────────
  // Cumbuco Kite Academy
  const iCumbucoRafael = await prisma.users.create({
    data: { name: "Rafael Moura", email: "rafael@cumbucoKite.com", phone: "5585999010101", password: PASSWORD, role: "instructor" },
  });
  const iCumbucoKarol = await prisma.users.create({
    data: { name: "Karol Melo", email: "karol@cumbucoKite.com", phone: "5585999010102", password: PASSWORD, role: "instructor" },
  });
  const iCumbucoThiago = await prisma.users.create({
    data: { name: "Thiago Barroso", email: "thiago@cumbucoKite.com", phone: "5585999010103", password: PASSWORD, role: "instructor" },
  });
  // Rancho do Vento
  const iRanchoAndre = await prisma.users.create({
    data: { name: "André Vasconcelos", email: "andre@ranchodovento.com", phone: "5588999020101", password: PASSWORD, role: "instructor" },
  });
  const iRanchoBia = await prisma.users.create({
    data: { name: "Beatriz Fontes", email: "bia@ranchodovento.com", phone: "5588999020102", password: PASSWORD, role: "instructor" },
  });
  // Floripa Kite
  const iFloripaDiego = await prisma.users.create({
    data: { name: "Diego Souza", email: "diego@floripakite.com", phone: "5548999030101", password: PASSWORD, role: "instructor" },
  });
  const iFloripaLuisa = await prisma.users.create({
    data: { name: "Luísa Pereira", email: "luisa@floripakite.com", phone: "5548999030102", password: PASSWORD, role: "instructor" },
  });
  // Laguna Kite
  const iLagunaMarcos = await prisma.users.create({
    data: { name: "Marcos Tavares", email: "marcos@lagunakite.com", phone: "5548999040101", password: PASSWORD, role: "instructor" },
  });
  // RS Kite
  const iRsKiteGabriel = await prisma.users.create({
    data: { name: "Gabriel Rios", email: "gabriel@rskite.com", phone: "5551999050101", password: PASSWORD, role: "instructor" },
  });
  const iRsKitePatricia = await prisma.users.create({
    data: { name: "Patrícia Scherer", email: "patricia@rskite.com", phone: "5551999050102", password: PASSWORD, role: "instructor" },
  });
  // Vento Sul
  const iVentoSulCaio = await prisma.users.create({
    data: { name: "Caio Borges", email: "caio@ventosulkite.com", phone: "5551999060101", password: PASSWORD, role: "instructor" },
  });

  // ── Students ────────────────────────────────────────────────
  // Cumbuco
  const sJulia = await prisma.users.create({
    data: { name: "Júlia Mendes", email: "julia@email.com", phone: "5585999200001", password: PASSWORD, role: "student" },
  });
  const sPaulo = await prisma.users.create({
    data: { name: "Paulo Henrique", email: "paulo@email.com", phone: "5585999200002", password: PASSWORD, role: "student" },
  });
  const sLuana = await prisma.users.create({
    data: { name: "Luana Siqueira", email: "luana@email.com", phone: "5585999200003", password: PASSWORD, role: "student" },
  });
  // Rancho
  const sBruno = await prisma.users.create({
    data: { name: "Bruno Cavalcante", email: "brunoc@email.com", phone: "5588999200004", password: PASSWORD, role: "student" },
  });
  const sCaroline = await prisma.users.create({
    data: { name: "Caroline Alves", email: "carol@email.com", phone: "5588999200005", password: PASSWORD, role: "student" },
  });
  // Floripa
  const sVitor = await prisma.users.create({
    data: { name: "Vítor Machado", email: "vitor@email.com", phone: "5548999200006", password: PASSWORD, role: "student" },
  });
  const sAmanda = await prisma.users.create({
    data: { name: "Amanda Oliveira", email: "amanda@email.com", phone: "5548999200007", password: PASSWORD, role: "student" },
  });
  const sLeandro = await prisma.users.create({
    data: { name: "Leandro Costa", email: "leandro@email.com", phone: "5548999200008", password: PASSWORD, role: "student" },
  });
  // RS Kite
  const sMariana = await prisma.users.create({
    data: { name: "Mariana Becker", email: "mariana@email.com", phone: "5551999200009", password: PASSWORD, role: "student" },
  });
  const sEduardo = await prisma.users.create({
    data: { name: "Eduardo Fischer", email: "edu@email.com", phone: "5551999200010", password: PASSWORD, role: "student" },
  });
  // Laguna + Vento Sul
  const sTiago = await prisma.users.create({
    data: { name: "Tiago Lopes", email: "tiago@email.com", phone: "5548999200011", password: PASSWORD, role: "student" },
  });
  const sNathalia = await prisma.users.create({
    data: { name: "Nathalia Ramos", email: "nathalia@email.com", phone: "5551999200012", password: PASSWORD, role: "student" },
  });

  // ── Service Providers ──────────────────────────────────────
  const provFoto = await prisma.users.create({
    data: { name: "Lucas Bandeira", email: "lucas.foto@kiteapp.com", phone: "5585999300001", password: PASSWORD, role: "service_provider" },
  });
  const provVideo = await prisma.users.create({
    data: { name: "Camila Drone", email: "camila.video@kiteapp.com", phone: "5585999300002", password: PASSWORD, role: "service_provider" },
  });

  // ════════════════════════════════════════════════════════════
  // MEMBERS (user ↔ org)
  // ════════════════════════════════════════════════════════════

  await prisma.members.createMany({
    data: [
      // Cumbuco Kite Academy
      { organization_id: orgCumbuco.id, user_id: superAdmin.id },
      { organization_id: orgCumbuco.id, user_id: adminCumbuco.id },
      { organization_id: orgCumbuco.id, user_id: iCumbucoRafael.id },
      { organization_id: orgCumbuco.id, user_id: iCumbucoKarol.id },
      { organization_id: orgCumbuco.id, user_id: iCumbucoThiago.id },
      { organization_id: orgCumbuco.id, user_id: sJulia.id },
      { organization_id: orgCumbuco.id, user_id: sPaulo.id },
      { organization_id: orgCumbuco.id, user_id: sLuana.id },
      { organization_id: orgCumbuco.id, user_id: provFoto.id },
      // Rancho do Vento
      { organization_id: orgRancho.id, user_id: adminRancho.id },
      { organization_id: orgRancho.id, user_id: iRanchoAndre.id },
      { organization_id: orgRancho.id, user_id: iRanchoBia.id },
      { organization_id: orgRancho.id, user_id: sBruno.id },
      { organization_id: orgRancho.id, user_id: sCaroline.id },
      { organization_id: orgRancho.id, user_id: provFoto.id },
      { organization_id: orgRancho.id, user_id: provVideo.id },
      // Floripa Kite
      { organization_id: orgFloripa.id, user_id: adminFloripa.id },
      { organization_id: orgFloripa.id, user_id: iFloripaDiego.id },
      { organization_id: orgFloripa.id, user_id: iFloripaLuisa.id },
      { organization_id: orgFloripa.id, user_id: sVitor.id },
      { organization_id: orgFloripa.id, user_id: sAmanda.id },
      { organization_id: orgFloripa.id, user_id: sLeandro.id },
      { organization_id: orgFloripa.id, user_id: provVideo.id },
      // Laguna Kite
      { organization_id: orgLaguna.id, user_id: adminLaguna.id },
      { organization_id: orgLaguna.id, user_id: iLagunaMarcos.id },
      { organization_id: orgLaguna.id, user_id: sTiago.id },
      // RS Kite
      { organization_id: orgRsKite.id, user_id: adminRsKite.id },
      { organization_id: orgRsKite.id, user_id: iRsKiteGabriel.id },
      { organization_id: orgRsKite.id, user_id: iRsKitePatricia.id },
      { organization_id: orgRsKite.id, user_id: sMariana.id },
      { organization_id: orgRsKite.id, user_id: sEduardo.id },
      // Vento Sul
      { organization_id: orgVentoSul.id, user_id: adminVentoSul.id },
      { organization_id: orgVentoSul.id, user_id: iVentoSulCaio.id },
      { organization_id: orgVentoSul.id, user_id: sNathalia.id },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // SERVICES + SCOPES
  // ════════════════════════════════════════════════════════════

  const svcFoto = await prisma.services.create({
    data: {
      user_id: provFoto.id,
      type: "photographer",
      display_name: "Lucas Bandeira — Fotografia de Kite",
      bio: "Fotógrafo especializado em kitesurf, baseado em Cumbuco e Preá. Entrega em 48h com edição profissional.",
      whatsapp: "5585999300001",
      instagram: "lucasbandeirafoto",
      is_active: true,
    },
  });
  await prisma.service_scope.createMany({
    data: [
      { service_id: svcFoto.id, scope_type: "organization", organization_id: orgCumbuco.id, global_spot_id: null },
      { service_id: svcFoto.id, scope_type: "organization", organization_id: orgRancho.id, global_spot_id: null },
      { service_id: svcFoto.id, scope_type: "global_spot", organization_id: null, global_spot_id: gCumbuco.id },
      { service_id: svcFoto.id, scope_type: "global_spot", organization_id: null, global_spot_id: gPrea.id },
    ],
  });

  const svcVideo = await prisma.services.create({
    data: {
      user_id: provVideo.id,
      type: "filmmaker",
      display_name: "Camila Drone — Vídeo Aéreo de Kite",
      bio: "Reels e vídeos cinematográficos com drone e câmera d'água. Entrega express: mesmo dia quando o vento permite.",
      whatsapp: "5585999300002",
      instagram: "camiladronekite",
      is_active: true,
    },
  });
  await prisma.service_scope.createMany({
    data: [
      { service_id: svcVideo.id, scope_type: "organization", organization_id: orgRancho.id, global_spot_id: null },
      { service_id: svcVideo.id, scope_type: "organization", organization_id: orgFloripa.id, global_spot_id: null },
      { service_id: svcVideo.id, scope_type: "global_spot", organization_id: null, global_spot_id: gJeri.id },
      { service_id: svcVideo.id, scope_type: "global_spot", organization_id: null, global_spot_id: gLagoaConceicao.id },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // INSTRUCTORS
  // ════════════════════════════════════════════════════════════

  const instCumbucoRafael = await prisma.instructors.create({
    data: {
      organization_id: orgCumbuco.id, user_id: iCumbucoRafael.id,
      certification: "IKO Level 3", experience_years: 10,
      bio: "Rafael é natural de Cumbuco e treinou mais de 500 alunos na Lagoa do Cauípe. Especialidade: iniciantes e segurança aquática.",
    },
  });
  const instCumbucoKarol = await prisma.instructors.create({
    data: {
      organization_id: orgCumbuco.id, user_id: iCumbucoKarol.id,
      certification: "IKO Level 2", experience_years: 6,
      bio: "Karol é a instrutora mais jovem da academia. Especializada em freestyle e progressão de intermediários.",
    },
  });
  const instCumbucoThiago = await prisma.instructors.create({
    data: {
      organization_id: orgCumbuco.id, user_id: iCumbucoThiago.id,
      certification: "IKO Level 2", experience_years: 5,
      bio: "Thiago tem foco em atendimento internacional (inglês e espanhol fluentes) e em aulas de progresso técnico.",
    },
  });

  const instRanchoAndre = await prisma.instructors.create({
    data: {
      organization_id: orgRancho.id, user_id: iRanchoAndre.id,
      certification: "IKO Level 3", experience_years: 12,
      bio: "André conhece Preá como a palma da mão. Campeão regional de kite freestyle, treina atletas de competição.",
    },
  });
  const instRanchoBia = await prisma.instructors.create({
    data: {
      organization_id: orgRancho.id, user_id: iRanchoBia.id,
      certification: "IKO Level 2", experience_years: 7,
      bio: "Beatriz se especializou em downwinders e ensina desde iniciantes até viagens completas Preá–Jericoacoara.",
    },
  });

  const instFloripaDiego = await prisma.instructors.create({
    data: {
      organization_id: orgFloripa.id, user_id: iFloripaDiego.id,
      certification: "IKO Level 3", experience_years: 9,
      bio: "Diego é catarinense, pratica kite desde os 16 anos na Lagoa da Conceição. Especialidade em vento sul e aulas para adultos.",
    },
  });
  const instFloripaLuisa = await prisma.instructors.create({
    data: {
      organization_id: orgFloripa.id, user_id: iFloripaLuisa.id,
      certification: "IKO Level 2", experience_years: 4,
      bio: "Luísa tem formação em Educação Física e traz uma abordagem pedagógica moderna para as aulas de kite.",
    },
  });

  const instLagunaMarcos = await prisma.instructors.create({
    data: {
      organization_id: orgLaguna.id, user_id: iLagunaMarcos.id,
      certification: "IKO Level 3", experience_years: 11,
      bio: "Marcos domina o vento sul da Galheta e o flat water do Canal da Barra. Instrutor mais experiente de Laguna.",
    },
  });

  const instRsKiteGabriel = await prisma.instructors.create({
    data: {
      organization_id: orgRsKite.id, user_id: iRsKiteGabriel.id,
      certification: "IKO Level 2", experience_years: 7,
      bio: "Gabriel é gaúcho da geração que descobriu o kite no Rio Tramandaí. Especialista em iniciantes e segurança no vento sul.",
    },
  });
  const instRsKitePatricia = await prisma.instructors.create({
    data: {
      organization_id: orgRsKite.id, user_id: iRsKitePatricia.id,
      certification: "IKO Level 2", experience_years: 5,
      bio: "Patrícia ensina kite com foco em mulheres no esporte e em progressão de intermediários para o mar aberto.",
    },
  });

  const instVentoSulCaio = await prisma.instructors.create({
    data: {
      organization_id: orgVentoSul.id, user_id: iVentoSulCaio.id,
      certification: "IKO Level 2", experience_years: 6,
      bio: "Caio opera entre Capão da Canoa e Torres. Experiente com o vento cruzado do litoral norte gaúcho.",
    },
  });

  // ════════════════════════════════════════════════════════════
  // STUDENTS
  // ════════════════════════════════════════════════════════════

  const stuJulia = await prisma.students.create({
    data: {
      organization_id: orgCumbuco.id, user_id: sJulia.id,
      level: "intermediario",
      goals: ["Transições", "Saltos básicos", "Body drag no mar"],
      notes: "Pratica há 1 ano, boa base. Prefere aulas pela manhã na lagoa.",
    },
  });
  const stuPaulo = await prisma.students.create({
    data: {
      organization_id: orgCumbuco.id, user_id: sPaulo.id,
      level: "iniciante",
      goals: ["Primeira aula", "Conhecer o equipamento", "Body drag"],
      notes: "Nunca praticou esporte aquático. Muita vontade de aprender.",
    },
  });
  const stuLuana = await prisma.students.create({
    data: {
      organization_id: orgCumbuco.id, user_id: sLuana.id,
      level: "avancado",
      goals: ["Freestyle", "Kite loop", "Competição regional"],
      notes: "Atleta em formação — 3 anos de kite, quer evoluir para competir.",
    },
  });

  const stuBruno = await prisma.students.create({
    data: {
      organization_id: orgRancho.id, user_id: sBruno.id,
      level: "intermediario",
      goals: ["Downwinder Preá–Jeri", "Ondas", "Water relaunch"],
      notes: "Quer fazer o downwinder famoso de Preá até Jericoacoara.",
    },
  });
  const stuCaroline = await prisma.students.create({
    data: {
      organization_id: orgRancho.id, user_id: sCaroline.id,
      level: "iniciante",
      goals: ["Primeira aula", "Flat water", "Controlar a pipa"],
      notes: "Esteve em Preá de férias e se apaixonou pelo kite. Iniciando agora.",
    },
  });

  const stuVitor = await prisma.students.create({
    data: {
      organization_id: orgFloripa.id, user_id: sVitor.id,
      level: "iniciante",
      goals: ["Controle de pipa", "Body drag", "Water start"],
      notes: "Mora em Floripa e quer aprender na Lagoa da Conceição.",
    },
  });
  const stuAmanda = await prisma.students.create({
    data: {
      organization_id: orgFloripa.id, user_id: sAmanda.id,
      level: "intermediario",
      goals: ["Andar em ambos os bordos", "Salto básico"],
      notes: "Aprendeu o básico em Cumbuco no verão, quer consolidar em Floripa.",
    },
  });
  const stuLeandro = await prisma.students.create({
    data: {
      organization_id: orgFloripa.id, user_id: sLeandro.id,
      level: "avancado",
      goals: ["Manobras Unhooked", "Megaloop"],
      notes: "Kiter experiente — quer aulas com Diego para evoluir no unhooked.",
    },
  });

  const stuMariana = await prisma.students.create({
    data: {
      organization_id: orgRsKite.id, user_id: sMariana.id,
      level: "iniciante",
      goals: ["Conhecer o vento sul", "Body drag no rio", "Water start"],
      notes: "Gaúcha, quer aprender no RS perto de casa.",
    },
  });
  const stuEduardo = await prisma.students.create({
    data: {
      organization_id: orgRsKite.id, user_id: sEduardo.id,
      level: "intermediario",
      goals: ["Transições no mar", "Vento sul forte"],
      notes: "Pratica no Tramandaí há 1 ano, quer evoluir com o vento sul.",
    },
  });

  const stuTiago = await prisma.students.create({
    data: {
      organization_id: orgLaguna.id, user_id: sTiago.id,
      level: "intermediario",
      goals: ["Mar aberto na Galheta", "Ondas pequenas"],
      notes: "Viaja para Laguna nos fins de semana — tem flexibilidade de horário.",
    },
  });

  const stuNathalia = await prisma.students.create({
    data: {
      organization_id: orgVentoSul.id, user_id: sNathalia.id,
      level: "iniciante",
      goals: ["Primeira aula na lagoa", "Body drag"],
      notes: "Mora em Capão da Canoa, começando do zero.",
    },
  });

  // ════════════════════════════════════════════════════════════
  // PACKAGES — 4 por escola
  // ════════════════════════════════════════════════════════════

  // Cumbuco
  const pkgCumbucoAvulsa = await prisma.packages.create({ data: { organization_id: orgCumbuco.id, title: "Aula Avulsa", description: "1 aula individual de 2h na Lagoa do Cauípe", session_count: 1, price: 320, validity_days: 30 } });
  const pkgCumbucoIniciante = await prisma.packages.create({ data: { organization_id: orgCumbuco.id, title: "Pacote Iniciante", description: "4 aulas de 2h para quem está começando no kite", session_count: 4, price: 1100, validity_days: 30 } });
  const pkgCumbucoIntermediario = await prisma.packages.create({ data: { organization_id: orgCumbuco.id, title: "Pacote Intermediário", description: "6 aulas de 2h — evolução técnica na lagoa e no mar", session_count: 6, price: 1500, validity_days: 45 } });
  const pkgCumbucoAvancado = await prisma.packages.create({ data: { organization_id: orgCumbuco.id, title: "Pacote Avançado", description: "8 aulas de 2h — freestyle, saltos e manobras avançadas", session_count: 8, price: 1900, validity_days: 60 } });

  // Rancho do Vento
  const pkgRanchoAvulsa = await prisma.packages.create({ data: { organization_id: orgRancho.id, title: "Aula Avulsa", description: "1 aula de 2h em Preá ou Jericoacoara", session_count: 1, price: 350, validity_days: 30 } });
  const pkgRanchoIniciante = await prisma.packages.create({ data: { organization_id: orgRancho.id, title: "Pacote Iniciante", description: "4 aulas de 2h — do básico ao body drag em Preá", session_count: 4, price: 1200, validity_days: 30 } });
  const pkgRanchoIntermediario = await prisma.packages.create({ data: { organization_id: orgRancho.id, title: "Pacote Intermediário", description: "6 aulas incluindo 1 downwinder guiado até Jericoacoara", session_count: 6, price: 1600, validity_days: 45 } });
  const pkgRanchoDownwinder = await prisma.packages.create({ data: { organization_id: orgRancho.id, title: "Downwinder Experience", description: "Pacote completo: 8 aulas + downwinder Preá–Jeri com fotografia", session_count: 8, price: 2400, validity_days: 60 } });

  // Floripa Kite
  const pkgFloripaAvulsa = await prisma.packages.create({ data: { organization_id: orgFloripa.id, title: "Aula Avulsa", description: "1 aula de 2h na Lagoa da Conceição", session_count: 1, price: 300, validity_days: 30 } });
  const pkgFloripaIniciante = await prisma.packages.create({ data: { organization_id: orgFloripa.id, title: "Pacote Iniciante", description: "4 aulas de 2h para começar na lagoa", session_count: 4, price: 1050, validity_days: 30 } });
  const pkgFloripaIntermediario = await prisma.packages.create({ data: { organization_id: orgFloripa.id, title: "Pacote Intermediário", description: "6 aulas — consolidar bordos e iniciar saltos", session_count: 6, price: 1450, validity_days: 45 } });
  const pkgFloripaAvancado = await prisma.packages.create({ data: { organization_id: orgFloripa.id, title: "Pacote Avançado", description: "8 aulas de manobras avançadas e unhooked", session_count: 8, price: 1850, validity_days: 60 } });

  // Laguna
  const pkgLagunaAvulsa = await prisma.packages.create({ data: { organization_id: orgLaguna.id, title: "Aula Avulsa", description: "1 aula de 2h no Canal da Barra ou Galheta", session_count: 1, price: 300, validity_days: 30 } });
  const pkgLagunaIntermediario = await prisma.packages.create({ data: { organization_id: orgLaguna.id, title: "Pacote Intermediário", description: "6 aulas com foco no mar e vento sul", session_count: 6, price: 1500, validity_days: 45 } });

  // RS Kite
  const pkgRsAvulsa = await prisma.packages.create({ data: { organization_id: orgRsKite.id, title: "Aula Avulsa", description: "1 aula de 2h no Rio Tramandaí ou praia", session_count: 1, price: 280, validity_days: 30 } });
  const pkgRsIniciante = await prisma.packages.create({ data: { organization_id: orgRsKite.id, title: "Pacote Iniciante", description: "4 aulas no Rio Tramandaí — flat water ideal para começar", session_count: 4, price: 980, validity_days: 30 } });
  const pkgRsIntermediario = await prisma.packages.create({ data: { organization_id: orgRsKite.id, title: "Pacote Intermediário", description: "6 aulas — Rio e mar aberto com vento sul", session_count: 6, price: 1380, validity_days: 45 } });
  const pkgRsInverno = await prisma.packages.create({ data: { organization_id: orgRsKite.id, title: "Pacote Inverno Gaúcho", description: "8 aulas no pico da temporada (maio–agosto), wetsuit incluso", session_count: 8, price: 2000, validity_days: 60 } });

  // Vento Sul
  const pkgVsAvulsa = await prisma.packages.create({ data: { organization_id: orgVentoSul.id, title: "Aula Avulsa", description: "1 aula de 2h em Capão da Canoa ou Torres", session_count: 1, price: 280, validity_days: 30 } });
  const pkgVsIniciante = await prisma.packages.create({ data: { organization_id: orgVentoSul.id, title: "Pacote Iniciante", description: "4 aulas na Lagoa dos Quadros — calma e rasa", session_count: 4, price: 980, validity_days: 30 } });

  // ════════════════════════════════════════════════════════════
  // STUDENT PACKAGES
  // ════════════════════════════════════════════════════════════

  const spJulia = await prisma.student_packages.create({
    data: {
      student_id: stuJulia.id, package_id: pkgCumbucoIntermediario.id,
      sessions_total: 6, sessions_used: 4, sessions_remaining: 2,
      status: "active", purchase_date: new Date("2026-02-10"),
      expiry_date: new Date("2026-03-27"),
    },
  });
  const spPaulo = await prisma.student_packages.create({
    data: {
      student_id: stuPaulo.id, package_id: pkgCumbucoIniciante.id,
      sessions_total: 4, sessions_used: 1, sessions_remaining: 3,
      status: "active", purchase_date: new Date("2026-03-20"),
      expiry_date: new Date("2026-04-19"),
    },
  });
  const spLuana = await prisma.student_packages.create({
    data: {
      student_id: stuLuana.id, package_id: pkgCumbucoAvancado.id,
      sessions_total: 8, sessions_used: 6, sessions_remaining: 2,
      status: "active", purchase_date: new Date("2026-01-15"),
      expiry_date: new Date("2026-04-15"),
    },
  });
  const spBruno = await prisma.student_packages.create({
    data: {
      student_id: stuBruno.id, package_id: pkgRanchoDownwinder.id,
      sessions_total: 8, sessions_used: 5, sessions_remaining: 3,
      status: "active", purchase_date: new Date("2026-02-01"),
      expiry_date: new Date("2026-05-01"),
    },
  });
  const spCaroline = await prisma.student_packages.create({
    data: {
      student_id: stuCaroline.id, package_id: pkgRanchoIniciante.id,
      sessions_total: 4, sessions_used: 0, sessions_remaining: 4,
      status: "active", purchase_date: new Date("2026-03-25"),
      expiry_date: new Date("2026-04-24"),
    },
  });
  const spVitor = await prisma.student_packages.create({
    data: {
      student_id: stuVitor.id, package_id: pkgFloripaIniciante.id,
      sessions_total: 4, sessions_used: 2, sessions_remaining: 2,
      status: "active", purchase_date: new Date("2026-03-01"),
      expiry_date: new Date("2026-03-31"),
    },
  });
  const spAmanda = await prisma.student_packages.create({
    data: {
      student_id: stuAmanda.id, package_id: pkgFloripaIntermediario.id,
      sessions_total: 6, sessions_used: 3, sessions_remaining: 3,
      status: "active", purchase_date: new Date("2026-02-20"),
      expiry_date: new Date("2026-04-05"),
    },
  });
  const spLeandro = await prisma.student_packages.create({
    data: {
      student_id: stuLeandro.id, package_id: pkgFloripaAvancado.id,
      sessions_total: 8, sessions_used: 2, sessions_remaining: 6,
      status: "active", purchase_date: new Date("2026-03-10"),
      expiry_date: new Date("2026-05-09"),
    },
  });
  const spMariana = await prisma.student_packages.create({
    data: {
      student_id: stuMariana.id, package_id: pkgRsIniciante.id,
      sessions_total: 4, sessions_used: 1, sessions_remaining: 3,
      status: "active", purchase_date: new Date("2026-03-15"),
      expiry_date: new Date("2026-04-14"),
    },
  });
  const spEduardo = await prisma.student_packages.create({
    data: {
      student_id: stuEduardo.id, package_id: pkgRsIntermediario.id,
      sessions_total: 6, sessions_used: 4, sessions_remaining: 2,
      status: "active", purchase_date: new Date("2026-02-01"),
      expiry_date: new Date("2026-03-18"),
    },
  });
  const spTiago = await prisma.student_packages.create({
    data: {
      student_id: stuTiago.id, package_id: pkgLagunaIntermediario.id,
      sessions_total: 6, sessions_used: 2, sessions_remaining: 4,
      status: "active", purchase_date: new Date("2026-03-01"),
      expiry_date: new Date("2026-04-15"),
    },
  });
  const spNathalia = await prisma.student_packages.create({
    data: {
      student_id: stuNathalia.id, package_id: pkgVsIniciante.id,
      sessions_total: 4, sessions_used: 0, sessions_remaining: 4,
      status: "active", purchase_date: new Date("2026-03-28"),
      expiry_date: new Date("2026-04-27"),
    },
  });

  // ════════════════════════════════════════════════════════════
  // SESSIONS
  // ════════════════════════════════════════════════════════════

  const d = {
    m3: daysFromNow(-3),
    m2: daysFromNow(-2),
    m1: daysFromNow(-1),
    p1: daysFromNow(1),
    p2: daysFromNow(2),
    p3: daysFromNow(3),
  };

  await prisma.sessions.createMany({
    data: [
      // ── Cumbuco Kite Academy ──────────────────────────────
      { organization_id: orgCumbuco.id, spot_id: spotCumbuco.id, student_id: stuJulia.id, instructor_id: instCumbucoRafael.id, student_package_id: spJulia.id, date: d.m2, start_time: "09:00", end_time: "11:00", status: "completed", type: "Pacote Intermediário" },
      { organization_id: orgCumbuco.id, spot_id: spotCumbuco.id, student_id: stuLuana.id, instructor_id: instCumbucoKarol.id, student_package_id: spLuana.id, date: d.m2, start_time: "14:00", end_time: "16:00", status: "completed", type: "Pacote Avançado" },
      { organization_id: orgCumbuco.id, spot_id: spotCumbuco.id, student_id: stuPaulo.id, instructor_id: instCumbucoRafael.id, student_package_id: spPaulo.id, date: d.m1, start_time: "09:00", end_time: "11:00", status: "completed", type: "Pacote Iniciante" },
      { organization_id: orgCumbuco.id, spot_id: spotCumbuco.id, student_id: stuJulia.id, instructor_id: instCumbucoThiago.id, student_package_id: spJulia.id, date: d.m1, start_time: "14:00", end_time: "16:00", status: "cancelled_weather", type: "Pacote Intermediário", weather: { reason: "Vento abaixo de 12 nós — condição insuficiente" } },
      { organization_id: orgCumbuco.id, spot_id: spotCumbuco.id, student_id: stuJulia.id, instructor_id: instCumbucoRafael.id, student_package_id: spJulia.id, date: d.p1, start_time: "09:00", end_time: "11:00", status: "confirmed", type: "Pacote Intermediário" },
      { organization_id: orgCumbuco.id, spot_id: spotCumbuco.id, student_id: stuLuana.id, instructor_id: instCumbucoKarol.id, student_package_id: spLuana.id, date: d.p1, start_time: "14:00", end_time: "16:00", status: "scheduled", type: "Pacote Avançado" },
      { organization_id: orgCumbuco.id, spot_id: spotCumbuco.id, student_id: stuPaulo.id, instructor_id: instCumbucoThiago.id, student_package_id: spPaulo.id, date: d.p2, start_time: "09:00", end_time: "11:00", status: "scheduled", type: "Pacote Iniciante" },

      // ── Rancho do Vento ───────────────────────────────────
      { organization_id: orgRancho.id, spot_id: spotPrea.id, student_id: stuBruno.id, instructor_id: instRanchoAndre.id, student_package_id: spBruno.id, date: d.m3, start_time: "14:00", end_time: "16:00", status: "completed", type: "Downwinder Experience" },
      { organization_id: orgRancho.id, spot_id: spotPrea.id, student_id: stuBruno.id, instructor_id: instRanchoBia.id, student_package_id: spBruno.id, date: d.m1, start_time: "09:00", end_time: "11:00", status: "completed", type: "Downwinder Experience" },
      { organization_id: orgRancho.id, spot_id: spotPrea.id, student_id: stuCaroline.id, instructor_id: instRanchoBia.id, student_package_id: spCaroline.id, date: d.p1, start_time: "09:00", end_time: "11:00", status: "scheduled", type: "Pacote Iniciante" },
      { organization_id: orgRancho.id, spot_id: spotJeri.id, student_id: stuBruno.id, instructor_id: instRanchoAndre.id, student_package_id: spBruno.id, date: d.p3, start_time: "14:00", end_time: "16:00", status: "scheduled", type: "Downwinder Experience", notes: "Downwinder completo Preá–Jericoacoara — confirmado vento 22 nós" },

      // ── Floripa Kite ──────────────────────────────────────
      { organization_id: orgFloripa.id, spot_id: spotLagoaConceicao.id, student_id: stuVitor.id, instructor_id: instFloripaDiego.id, student_package_id: spVitor.id, date: d.m2, start_time: "10:00", end_time: "12:00", status: "completed", type: "Pacote Iniciante" },
      { organization_id: orgFloripa.id, spot_id: spotLagoaConceicao.id, student_id: stuAmanda.id, instructor_id: instFloripaLuisa.id, student_package_id: spAmanda.id, date: d.m2, start_time: "14:00", end_time: "16:00", status: "completed", type: "Pacote Intermediário" },
      { organization_id: orgFloripa.id, spot_id: spotLagoaConceicao.id, student_id: stuLeandro.id, instructor_id: instFloripaDiego.id, student_package_id: spLeandro.id, date: d.m1, start_time: "09:00", end_time: "11:00", status: "completed", type: "Pacote Avançado" },
      { organization_id: orgFloripa.id, spot_id: spotLagoaConceicao.id, student_id: stuVitor.id, instructor_id: instFloripaLuisa.id, student_package_id: spVitor.id, date: d.p1, start_time: "10:00", end_time: "12:00", status: "confirmed", type: "Pacote Iniciante" },
      { organization_id: orgFloripa.id, spot_id: spotLagoaConceicao.id, student_id: stuAmanda.id, instructor_id: instFloripaLuisa.id, student_package_id: spAmanda.id, date: d.p2, start_time: "14:00", end_time: "16:00", status: "scheduled", type: "Pacote Intermediário" },
      { organization_id: orgFloripa.id, spot_id: spotIbiraquera.id, student_id: stuLeandro.id, instructor_id: instFloripaDiego.id, student_package_id: spLeandro.id, date: d.p3, start_time: "09:00", end_time: "11:00", status: "scheduled", type: "Pacote Avançado", notes: "Ibiraquera — vento sul previsto 25 nós" },

      // ── Laguna Kite ───────────────────────────────────────
      { organization_id: orgLaguna.id, spot_id: spotGalheta.id, student_id: stuTiago.id, instructor_id: instLagunaMarcos.id, student_package_id: spTiago.id, date: d.m2, start_time: "09:00", end_time: "11:00", status: "completed", type: "Pacote Intermediário" },
      { organization_id: orgLaguna.id, spot_id: spotGalheta.id, student_id: stuTiago.id, instructor_id: instLagunaMarcos.id, student_package_id: spTiago.id, date: d.p2, start_time: "09:00", end_time: "11:00", status: "scheduled", type: "Pacote Intermediário" },

      // ── RS Kite Tramandaí ─────────────────────────────────
      { organization_id: orgRsKite.id, spot_id: spotTramandai.id, student_id: stuMariana.id, instructor_id: instRsKiteGabriel.id, student_package_id: spMariana.id, date: d.m1, start_time: "10:00", end_time: "12:00", status: "completed", type: "Pacote Iniciante" },
      { organization_id: orgRsKite.id, spot_id: spotTramandai.id, student_id: stuEduardo.id, instructor_id: instRsKitePatricia.id, student_package_id: spEduardo.id, date: d.m1, start_time: "14:00", end_time: "16:00", status: "completed", type: "Pacote Intermediário" },
      { organization_id: orgRsKite.id, spot_id: spotTramandai.id, student_id: stuMariana.id, instructor_id: instRsKiteGabriel.id, student_package_id: spMariana.id, date: d.p1, start_time: "10:00", end_time: "12:00", status: "scheduled", type: "Pacote Iniciante" },
      { organization_id: orgRsKite.id, spot_id: spotTramandai.id, student_id: stuEduardo.id, instructor_id: instRsKitePatricia.id, student_package_id: spEduardo.id, date: d.p2, start_time: "14:00", end_time: "16:00", status: "scheduled", type: "Pacote Intermediário" },

      // ── Vento Sul ─────────────────────────────────────────
      { organization_id: orgVentoSul.id, spot_id: spotCapao.id, student_id: stuNathalia.id, instructor_id: instVentoSulCaio.id, student_package_id: spNathalia.id, date: d.p1, start_time: "09:00", end_time: "11:00", status: "scheduled", type: "Pacote Iniciante" },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // AGENDAS + SLOTS — Cumbuco, Floripa e RS Kite
  // ════════════════════════════════════════════════════════════

  const tomorrow = d.p1;
  const dayAfter = d.p2;

  const agendaCumbucoAmanha = await prisma.agendas.create({
    data: {
      organization_id: orgCumbuco.id,
      slug: `cumbuco-${tomorrow.toISOString().slice(0, 10)}`,
      date: tomorrow,
      day_name: tomorrow.toLocaleDateString("pt-BR", { weekday: "long" }),
      published: true,
      rules: ["Chegar 15 min antes", "Cancelar com 24h de antecedência", "Vento mínimo: 12 nós"],
    },
  });
  const agendaCumbucoDepois = await prisma.agendas.create({
    data: {
      organization_id: orgCumbuco.id,
      slug: `cumbuco-${dayAfter.toISOString().slice(0, 10)}`,
      date: dayAfter,
      day_name: dayAfter.toLocaleDateString("pt-BR", { weekday: "long" }),
      published: true,
      rules: ["Chegar 15 min antes"],
    },
  });

  const agendaFloripaAmanha = await prisma.agendas.create({
    data: {
      organization_id: orgFloripa.id,
      slug: `floripa-${tomorrow.toISOString().slice(0, 10)}`,
      date: tomorrow,
      day_name: tomorrow.toLocaleDateString("pt-BR", { weekday: "long" }),
      published: true,
      rules: ["Turma máxima: 4 alunos por instrutor", "Cancelar em 48h"],
    },
  });

  const agendaRsAmanha = await prisma.agendas.create({
    data: {
      organization_id: orgRsKite.id,
      slug: `rskite-${tomorrow.toISOString().slice(0, 10)}`,
      date: tomorrow,
      day_name: tomorrow.toLocaleDateString("pt-BR", { weekday: "long" }),
      published: true,
      rules: ["Wetsuit obrigatório no inverno", "Vento mínimo: 10 nós"],
    },
  });

  await prisma.agenda_slots.createMany({
    data: [
      // Cumbuco amanhã
      { agenda_id: agendaCumbucoAmanha.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoRafael.id, time: "09:00", booked: true },
      { agenda_id: agendaCumbucoAmanha.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoKarol.id, time: "09:00" },
      { agenda_id: agendaCumbucoAmanha.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoThiago.id, time: "11:00" },
      { agenda_id: agendaCumbucoAmanha.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoRafael.id, time: "14:00", booked: true },
      { agenda_id: agendaCumbucoAmanha.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoKarol.id, time: "14:00" },
      // Cumbuco depois de amanhã
      { agenda_id: agendaCumbucoDepois.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoRafael.id, time: "09:00" },
      { agenda_id: agendaCumbucoDepois.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoThiago.id, time: "09:00", booked: true },
      { agenda_id: agendaCumbucoDepois.id, spot_id: spotCumbuco.id, instructor_id: instCumbucoKarol.id, time: "14:00" },
      // Floripa amanhã
      { agenda_id: agendaFloripaAmanha.id, spot_id: spotLagoaConceicao.id, instructor_id: instFloripaDiego.id, time: "10:00", booked: true },
      { agenda_id: agendaFloripaAmanha.id, spot_id: spotLagoaConceicao.id, instructor_id: instFloripaLuisa.id, time: "10:00" },
      { agenda_id: agendaFloripaAmanha.id, spot_id: spotLagoaConceicao.id, instructor_id: instFloripaDiego.id, time: "14:00" },
      { agenda_id: agendaFloripaAmanha.id, spot_id: spotLagoaConceicao.id, instructor_id: instFloripaLuisa.id, time: "14:00", booked: true },
      // RS Kite amanhã
      { agenda_id: agendaRsAmanha.id, spot_id: spotTramandai.id, instructor_id: instRsKiteGabriel.id, time: "10:00", booked: true },
      { agenda_id: agendaRsAmanha.id, spot_id: spotTramandai.id, instructor_id: instRsKitePatricia.id, time: "10:00" },
      { agenda_id: agendaRsAmanha.id, spot_id: spotTramandai.id, instructor_id: instRsKiteGabriel.id, time: "14:00" },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PAYMENTS
  // ════════════════════════════════════════════════════════════

  await prisma.payments.createMany({
    data: [
      // Júlia — Cumbuco Intermediário (2 parcelas pagas, 1 pendente)
      { organization_id: orgCumbuco.id, student_id: stuJulia.id, student_package_id: spJulia.id, amount: 500, method: "pix", status: "paid", installment_number: 1, total_installments: 3, due_date: new Date("2026-02-10"), paid_at: new Date("2026-02-10") },
      { organization_id: orgCumbuco.id, student_id: stuJulia.id, student_package_id: spJulia.id, amount: 500, method: "pix", status: "paid", installment_number: 2, total_installments: 3, due_date: new Date("2026-03-10"), paid_at: new Date("2026-03-09") },
      { organization_id: orgCumbuco.id, student_id: stuJulia.id, student_package_id: spJulia.id, amount: 500, status: "pending", installment_number: 3, total_installments: 3, due_date: new Date("2026-04-10") },
      // Paulo — Iniciante (overdue)
      { organization_id: orgCumbuco.id, student_id: stuPaulo.id, student_package_id: spPaulo.id, amount: 1100, status: "overdue", installment_number: 1, total_installments: 1, due_date: new Date("2026-03-20") },
      // Luana — Avançado (pago à vista)
      { organization_id: orgCumbuco.id, student_id: stuLuana.id, student_package_id: spLuana.id, amount: 1900, method: "pix", status: "paid", installment_number: 1, total_installments: 1, due_date: new Date("2026-01-15"), paid_at: new Date("2026-01-15") },
      // Bruno — Downwinder (2 parcelas pagas)
      { organization_id: orgRancho.id, student_id: stuBruno.id, student_package_id: spBruno.id, amount: 1200, method: "card", status: "paid", installment_number: 1, total_installments: 2, due_date: new Date("2026-02-01"), paid_at: new Date("2026-02-01") },
      { organization_id: orgRancho.id, student_id: stuBruno.id, student_package_id: spBruno.id, amount: 1200, status: "pending", installment_number: 2, total_installments: 2, due_date: new Date("2026-04-01") },
      // Caroline — Iniciante (pago à vista)
      { organization_id: orgRancho.id, student_id: stuCaroline.id, student_package_id: spCaroline.id, amount: 1200, method: "pix", status: "paid", installment_number: 1, total_installments: 1, due_date: new Date("2026-03-25"), paid_at: new Date("2026-03-25") },
      // Vítor — Floripa Iniciante (pago)
      { organization_id: orgFloripa.id, student_id: stuVitor.id, student_package_id: spVitor.id, amount: 1050, method: "pix", status: "paid", installment_number: 1, total_installments: 1, due_date: new Date("2026-03-01"), paid_at: new Date("2026-03-01") },
      // Amanda — Floripa Intermediário (2 parcelas)
      { organization_id: orgFloripa.id, student_id: stuAmanda.id, student_package_id: spAmanda.id, amount: 725, method: "card", status: "paid", installment_number: 1, total_installments: 2, due_date: new Date("2026-02-20"), paid_at: new Date("2026-02-20") },
      { organization_id: orgFloripa.id, student_id: stuAmanda.id, student_package_id: spAmanda.id, amount: 725, status: "pending", installment_number: 2, total_installments: 2, due_date: new Date("2026-04-05") },
      // Leandro — Floripa Avançado (pago à vista)
      { organization_id: orgFloripa.id, student_id: stuLeandro.id, student_package_id: spLeandro.id, amount: 1850, method: "pix", status: "paid", installment_number: 1, total_installments: 1, due_date: new Date("2026-03-10"), paid_at: new Date("2026-03-10") },
      // Mariana — RS Iniciante (pago)
      { organization_id: orgRsKite.id, student_id: stuMariana.id, student_package_id: spMariana.id, amount: 980, method: "pix", status: "paid", installment_number: 1, total_installments: 1, due_date: new Date("2026-03-15"), paid_at: new Date("2026-03-15") },
      // Eduardo — RS Intermediário (overdue)
      { organization_id: orgRsKite.id, student_id: stuEduardo.id, student_package_id: spEduardo.id, amount: 1380, status: "overdue", installment_number: 1, total_installments: 1, due_date: new Date("2026-02-01") },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // SERVICE BOOKINGS
  // ════════════════════════════════════════════════════════════

  const brunoSession = await prisma.sessions.findFirst({
    where: { student_id: stuBruno.id, organization_id: orgRancho.id, status: "scheduled", deleted_at: null },
    orderBy: { date: "asc" },
  });

  await prisma.service_bookings.createMany({
    data: [
      {
        service_id: svcFoto.id,
        student_id: stuJulia.id,
        session_id: null,
        status: "confirmed",
        quote_amount: 280,
        notes: "Sessão fotográfica na lagoa do Cauípe — combinado para amanhã às 09h.",
      },
      {
        service_id: svcFoto.id,
        student_id: stuPaulo.id,
        session_id: null,
        status: "requested",
        notes: "Quer fotos da primeira aula dele. Aguardando confirmação de horário.",
      },
      {
        service_id: svcVideo.id,
        student_id: stuBruno.id,
        session_id: brunoSession?.id ?? null,
        status: "confirmed",
        quote_amount: 450,
        notes: "Reel do downwinder Preá–Jericoacoara com drone. Entrega em 24h.",
      },
      {
        service_id: svcVideo.id,
        student_id: stuLeandro.id,
        session_id: null,
        status: "requested",
        notes: "Quer vídeo de manobras unhooked na Lagoa da Conceição.",
      },
      {
        service_id: svcFoto.id,
        student_id: stuLuana.id,
        session_id: null,
        status: "cancelled",
        notes: "Desistiu — vento fraco no dia combinado.",
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════

  console.log("\n✅ Seed concluído com dados reais de kitesurf no Brasil!\n");
  console.log("── Global Spots (15) ──────────────────────────────────");
  console.log("   Nordeste: Preá, Jericoacoara, Cumbuco, Canoa Quebrada, Ilha do Guajiru,");
  console.log("             São Miguel do Gostoso, Barra Grande (PI), Atins (MA)");
  console.log("   Santa Catarina: Lagoa da Conceição, Ibiraquera, Laguna, Garopaba");
  console.log("   Rio Grande do Sul: Tramandaí, Capão da Canoa, Torres");
  console.log("\n── Organizações (6) ────────────────────────────────────");
  console.log("   Nordeste: Cumbuco Kite Academy (CE) | Rancho do Vento Kite School (CE)");
  console.log("   Santa Catarina: Floripa Kite School | Laguna Kite School");
  console.log("   Rio Grande do Sul: RS Kite Tramandaí | Vento Sul Kite School");
  console.log("\n── Usuários ─────────────────────────────────────────────");
  console.log("   1 superadmin | 6 admins | 11 instrutores | 12 alunos | 2 prestadores");
  console.log("\n── Operacional ──────────────────────────────────────────");
  console.log("   9 spots operacionais | 20 pacotes | 12 student_packages");
  console.log("   27 sessões | 4 agendas | 15 slots | 14 pagamentos | 5 service_bookings");
  console.log("\n── Login superadmin ─────────────────────────────────────");
  console.log("   Email: superadmin@kiteapp.com | Senha: 123456");
  console.log("   Admin Cumbuco: admin@cumbucoKite.com | Senha: 123456");
  console.log("   Admin Floripa: admin@floripakite.com | Senha: 123456");
  console.log("   Admin RS Kite: admin@rskite.com      | Senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
