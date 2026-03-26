import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PASSWORD = hashSync("123456", 10);

async function main() {
  // Clear in reverse dependency order (includes global_spots / invites for re-runs)
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

  // ── Organizations ────────────────────────────────────────────
  const org1 = await prisma.organizations.create({
    data: {
      slug: "vento-livre-kitesurf",
      name: "Vento Livre Kitesurf",
      description:
        "Escola de kitesurf em Preá com instrutores certificados IKO. Oferecemos aulas para todos os níveis.",
      site: "https://ventolivre.com.br",
      instagram: "ventolivrekite",
      avatar: "https://images.unsplash.com/photo-1621252179027-94459d278660?w=200",
      whatsapp: "5585999001001",
      settings: {
        defaultSessionDuration: 120,
        bookingRules: [
          "Chegar 15 minutos antes da aula",
          "Desmarcar com um dia antes",
          "Aula desmarcada no dia será considerada aula realizada",
        ],
      },
    },
  });

  const org2 = await prisma.organizations.create({
    data: {
      slug: "ondas-do-mar-kite-school",
      name: "Ondas do Mar Kite School",
      description:
        "A melhor escola de kitesurf de Jericoacoara. Venha aprender com os melhores!",
      site: "https://ondasdomar.com",
      instagram: "ondasdomar",
      avatar: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200",
      whatsapp: "5585999002002",
      settings: { defaultSessionDuration: 90 },
    },
  });

  const org3 = await prisma.organizations.create({
    data: {
      slug: "kite-paradise",
      name: "Kite Paradise",
      description: "Kitesurf escola premium no paraíso",
      site: "https://kiteparadise.com",
      instagram: "kiteparadise",
      avatar: "https://images.unsplash.com/photo-1517699418036-fb7a5d750291?w=200",
      whatsapp: "5585999003003",
      settings: { defaultSessionDuration: 120 },
    },
  });

  const orgLouvaKite = await prisma.organizations.create({
    data: {
      slug: "louva-kite",
      name: "Louva Kite",
      description: "Escola de kitesurf — aulas e experiências na praia.",
      site: "https://louvakite.com.br",
      instagram: "louvakite",
      avatar: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=200",
      whatsapp: "5585999004004",
      settings: { defaultSessionDuration: 120 },
    },
  });

  // ── Global spots (catálogo super-admin) + vínculo operacional ──
  const gPrea = await prisma.global_spots.create({
    data: {
      name: "Preá",
      slug: "prea",
      country: "Brasil",
      state: "CE",
      access: "public",
      description: "Praia de Preá — vento constante no Ceará",
      tips: ["Chegar com antecedência", "Protetor solar"],
      services: ["Estacionamento", "Restaurantes próximos"],
    },
  });
  const gJeri = await prisma.global_spots.create({
    data: {
      name: "Jericoacoara",
      slug: "jericoacoara",
      country: "Brasil",
      state: "CE",
      access: "public",
      description: "Lagoas e mar de Jeri",
    },
  });
  const gTramandai = await prisma.global_spots.create({
    data: {
      name: "Tramandaí",
      slug: "tramandai",
      country: "Brasil",
      state: "RS",
      access: "public",
      description: "Litoral gaúcho com ventos sul",
    },
  });

  // ── Spots (operacionais por escola, ligados ao global) ─────
  const spotPrea = await prisma.spots.create({
    data: {
      organization_id: org1.id,
      global_spot_id: gPrea.id,
      name: "Preá",
      description: "Praia de Preá — condições perfeitas de vento",
    },
  });
  const spotJeri = await prisma.spots.create({
    data: {
      organization_id: org2.id,
      global_spot_id: gJeri.id,
      name: "Jericoacoara",
      description: "Lagoas e mar de Jeri",
    },
  });
  const spotTramandai = await prisma.spots.create({
    data: {
      organization_id: org3.id,
      global_spot_id: gTramandai.id,
      name: "Tramandaí",
      description: "Litoral gaúcho com ventos sul",
    },
  });
  const spotLouvaKite = await prisma.spots.create({
    data: {
      organization_id: orgLouvaKite.id,
      global_spot_id: gPrea.id,
      name: "Preá",
      description: "Base Louva Kite em Preá",
    },
  });

  // ── Users (admin) ──────────────────────────────────────────
  const superAdminUser = await prisma.users.create({
    data: {
      name: "Super Admin",
      email: "superadmin@kiteapp.com",
      phone: "5585999000000",
      password: PASSWORD,
      role: "superadmin",
    },
  });

  const adminUser = await prisma.users.create({
    data: {
      name: "João Admin",
      email: "admin@kiteapp.com",
      phone: "5585999000001",
      password: PASSWORD,
      role: "admin",
    },
  });

  // ── Users (instructors) ────────────────────────────────────
  const instructorRafael = await prisma.users.create({
    data: { name: "Rafael Costa", email: "rafael@kiteapp.com", phone: "5585999100001", password: PASSWORD, role: "instructor" },
  });
  const instructorMarina = await prisma.users.create({
    data: { name: "Marina Santos", email: "marina@kiteapp.com", phone: "5585999100002", password: PASSWORD, role: "instructor" },
  });
  const instructorCarlos = await prisma.users.create({
    data: { name: "Carlos Lima", email: "carlos@kiteapp.com", phone: "5585999100003", password: PASSWORD, role: "instructor" },
  });
  const instructorAna = await prisma.users.create({
    data: { name: "Ana Vento", email: "ana.i@kiteapp.com", phone: "5585999100004", password: PASSWORD, role: "instructor" },
  });

  // ── Users (students) ──────────────────────────────────────
  const studentMaria = await prisma.users.create({
    data: { name: "Maria Silva", email: "maria@email.com", phone: "5585999200001", password: PASSWORD, role: "student" },
  });
  const studentPedro = await prisma.users.create({
    data: { name: "Pedro Souza", email: "pedro@email.com", phone: "5585999200002", password: PASSWORD, role: "student" },
  });
  const studentAna = await prisma.users.create({
    data: { name: "Ana Costa", email: "ana@email.com", phone: "5585999200003", password: PASSWORD, role: "student" },
  });

  const providerUser = await prisma.users.create({
    data: {
      name: "Lucas Foto",
      email: "fotografo@kiteapp.com",
      phone: "5585999300001",
      password: PASSWORD,
      role: "service_provider",
    },
  });

  const providerFilme = await prisma.users.create({
    data: {
      name: "Bruno Filmes",
      email: "filmes@kiteapp.com",
      phone: "5585999300002",
      password: PASSWORD,
      role: "service_provider",
    },
  });

  // ── Members (user ↔ org) ──────────────────────────────────
  await prisma.members.createMany({
    data: [
      { organization_id: org1.id, user_id: superAdminUser.id },
      { organization_id: org1.id, user_id: adminUser.id },
      { organization_id: org1.id, user_id: instructorRafael.id },
      { organization_id: org1.id, user_id: instructorMarina.id },
      { organization_id: org1.id, user_id: instructorCarlos.id },
      { organization_id: org1.id, user_id: instructorAna.id },
      { organization_id: org1.id, user_id: studentMaria.id },
      { organization_id: org1.id, user_id: studentPedro.id },
      { organization_id: org1.id, user_id: studentAna.id },
      { organization_id: org1.id, user_id: providerUser.id },
      { organization_id: org2.id, user_id: adminUser.id },
      { organization_id: org2.id, user_id: instructorRafael.id },
      { organization_id: org2.id, user_id: providerFilme.id },
      { organization_id: orgLouvaKite.id, user_id: adminUser.id },
    ],
  });

  const svcPhoto = await prisma.services.create({
    data: {
      user_id: providerUser.id,
      type: "photographer",
      display_name: "Lucas — Fotografia",
      bio: "Cobertura de aulas e sessões na praia.",
      whatsapp: "5585999300001",
      instagram: "lucasfotokite",
      is_active: true,
    },
  });
  await prisma.service_scope.createMany({
    data: [
      {
        service_id: svcPhoto.id,
        scope_type: "organization",
        organization_id: org1.id,
        global_spot_id: null,
      },
      {
        service_id: svcPhoto.id,
        scope_type: "global_spot",
        organization_id: null,
        global_spot_id: gPrea.id,
      },
    ],
  });

  const svcFilme = await prisma.services.create({
    data: {
      user_id: providerFilme.id,
      type: "filmmaker",
      display_name: "Bruno — Vídeo de kite",
      bio: "Edição rápida e entrega no mesmo dia (quando der vento).",
      whatsapp: "5585999300002",
      instagram: "brunokitefilmes",
      is_active: true,
    },
  });
  await prisma.service_scope.createMany({
    data: [
      {
        service_id: svcFilme.id,
        scope_type: "organization",
        organization_id: org2.id,
        global_spot_id: null,
      },
      {
        service_id: svcFilme.id,
        scope_type: "global_spot",
        organization_id: null,
        global_spot_id: gJeri.id,
      },
    ],
  });

  // ── Instructors ────────────────────────────────────────────
  const instRafael = await prisma.instructors.create({
    data: {
      organization_id: org1.id, user_id: instructorRafael.id,
      certification: "IKO Level 3", experience_years: 8,
      bio: "Especialista em kite freestyle com 8 anos de experiência",
    },
  });
  const instMarina = await prisma.instructors.create({
    data: {
      organization_id: org1.id, user_id: instructorMarina.id,
      certification: "IKO Level 2", experience_years: 5,
      bio: "Focada em iniciantes e segurança aquática",
    },
  });
  const instCarlos = await prisma.instructors.create({
    data: {
      organization_id: org1.id, user_id: instructorCarlos.id,
      certification: "IKO Level 2", experience_years: 6,
      bio: "Instrutor versátil para todos os níveis",
    },
  });
  const instAna = await prisma.instructors.create({
    data: {
      organization_id: org1.id, user_id: instructorAna.id,
      certification: "IKO Level 1", experience_years: 3,
      bio: "Jovem promessa do kite cearense",
    },
  });

  // ── Students ───────────────────────────────────────────────
  const stuMaria = await prisma.students.create({
    data: {
      organization_id: org1.id, user_id: studentMaria.id,
      level: "intermediario", goals: ["Aprender transição", "Saltar"],
      notes: "Preferência por aulas pela manhã",
    },
  });
  const stuPedro = await prisma.students.create({
    data: {
      organization_id: org1.id, user_id: studentPedro.id,
      level: "iniciante", goals: ["Primeira aula", "Body drag"],
      notes: "Nunca praticou esporte aquático",
    },
  });
  const stuAna = await prisma.students.create({
    data: {
      organization_id: org1.id, user_id: studentAna.id,
      level: "avancado", goals: ["Freestyle", "Competição"],
      notes: "Atleta em formação",
    },
  });

  // ── Packages ───────────────────────────────────────────────
  const pkg1 = await prisma.packages.create({
    data: {
      organization_id: org1.id, title: "Pacote Iniciante",
      description: "4 aulas para quem está começando no kite",
      session_count: 4, price: 1200.0, validity_days: 30,
    },
  });
  const pkg2 = await prisma.packages.create({
    data: {
      organization_id: org1.id, title: "Pacote Intermediário",
      description: "6 aulas para evolução técnica",
      session_count: 6, price: 1600.0, validity_days: 45,
    },
  });
  const pkg3 = await prisma.packages.create({
    data: {
      organization_id: org1.id, title: "Pacote Avançado",
      description: "8 aulas de alto nível para manobras",
      session_count: 8, price: 2000.0, validity_days: 60,
    },
  });
  const pkg4 = await prisma.packages.create({
    data: {
      organization_id: org1.id, title: "Aula Avulsa",
      description: "1 aula individual",
      session_count: 1, price: 350.0, validity_days: 30,
    },
  });
  const pkg5 = await prisma.packages.create({
    data: {
      organization_id: org1.id, title: "Pacote Premium",
      description: "10 aulas com acompanhamento personalizado",
      session_count: 10, price: 3200.0, validity_days: 90,
    },
  });

  // ── Student Packages ───────────────────────────────────────
  const spMaria = await prisma.student_packages.create({
    data: {
      student_id: stuMaria.id, package_id: pkg2.id,
      sessions_total: 6, sessions_used: 3, sessions_remaining: 3,
      status: "active", purchase_date: new Date("2026-02-15"),
      expiry_date: new Date("2026-04-01"),
    },
  });
  const spPedro = await prisma.student_packages.create({
    data: {
      student_id: stuPedro.id, package_id: pkg1.id,
      sessions_total: 4, sessions_used: 1, sessions_remaining: 3,
      status: "active", purchase_date: new Date("2026-03-01"),
      expiry_date: new Date("2026-03-31"),
    },
  });
  const spAna = await prisma.student_packages.create({
    data: {
      student_id: stuAna.id, package_id: pkg3.id,
      sessions_total: 8, sessions_used: 5, sessions_remaining: 3,
      status: "active", purchase_date: new Date("2026-01-10"),
      expiry_date: new Date("2026-04-10"),
    },
  });

  // ── Sessions ───────────────────────────────────────────────
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.sessions.createMany({
    data: [
      {
        organization_id: org1.id, spot_id: spotPrea.id,
        student_id: stuMaria.id, instructor_id: instRafael.id,
        student_package_id: spMaria.id,
        date: tomorrow, start_time: "09:00", end_time: "11:00",
        status: "confirmed", type: "Pacote Intermediário",
      },
      {
        organization_id: org1.id, spot_id: spotPrea.id,
        student_id: stuPedro.id, instructor_id: instMarina.id,
        student_package_id: spPedro.id,
        date: tomorrow, start_time: "14:00", end_time: "16:00",
        status: "scheduled", type: "Pacote Iniciante",
      },
      {
        organization_id: org1.id, spot_id: spotPrea.id,
        student_id: stuAna.id, instructor_id: instCarlos.id,
        student_package_id: spAna.id,
        date: dayAfter, start_time: "10:00", end_time: "12:00",
        status: "scheduled", type: "Pacote Avançado",
      },
      {
        organization_id: org1.id, spot_id: spotPrea.id,
        student_id: stuMaria.id, instructor_id: instRafael.id,
        student_package_id: spMaria.id,
        date: yesterday, start_time: "09:00", end_time: "11:00",
        status: "completed", type: "Pacote Intermediário",
      },
      {
        organization_id: org1.id, spot_id: spotPrea.id,
        student_id: stuAna.id, instructor_id: instCarlos.id,
        student_package_id: spAna.id,
        date: twoDaysAgo, start_time: "10:00", end_time: "12:00",
        status: "completed", type: "Pacote Avançado",
      },
      {
        organization_id: org1.id, spot_id: spotPrea.id,
        student_id: stuPedro.id, instructor_id: instAna.id,
        date: twoDaysAgo, start_time: "14:00", end_time: "16:00",
        status: "cancelled_weather", type: "Aula Avulsa",
        weather: { reason: "Vento abaixo de 12 nós" },
      },
    ],
  });

  // ── Agendas ────────────────────────────────────────────────
  const agenda1 = await prisma.agendas.create({
    data: {
      organization_id: org1.id,
      slug: `vento-livre-${tomorrow.toISOString().slice(0, 10)}`,
      date: tomorrow,
      day_name: tomorrow.toLocaleDateString("pt-BR", { weekday: "long" }),
      published: true,
      rules: [
        "Chegar 15 minutos antes",
        "Desmarcar com 24h de antecedência",
      ],
    },
  });

  const agenda2 = await prisma.agendas.create({
    data: {
      organization_id: org1.id,
      slug: `vento-livre-${dayAfter.toISOString().slice(0, 10)}`,
      date: dayAfter,
      day_name: dayAfter.toLocaleDateString("pt-BR", { weekday: "long" }),
      published: true,
      rules: ["Chegar 15 minutos antes"],
    },
  });

  // ── Agenda Slots ───────────────────────────────────────────
  await prisma.agenda_slots.createMany({
    data: [
      { agenda_id: agenda1.id, spot_id: spotPrea.id, instructor_id: instRafael.id, time: "09:00", booked: true },
      { agenda_id: agenda1.id, spot_id: spotPrea.id, instructor_id: instMarina.id, time: "09:00" },
      { agenda_id: agenda1.id, spot_id: spotPrea.id, instructor_id: instCarlos.id, time: "11:00" },
      { agenda_id: agenda1.id, spot_id: spotPrea.id, instructor_id: instRafael.id, time: "14:00" },
      { agenda_id: agenda1.id, spot_id: spotPrea.id, instructor_id: instAna.id, time: "14:00", booked: true },
      { agenda_id: agenda2.id, spot_id: spotPrea.id, instructor_id: instRafael.id, time: "09:00" },
      { agenda_id: agenda2.id, spot_id: spotPrea.id, instructor_id: instCarlos.id, time: "10:00" },
      { agenda_id: agenda2.id, spot_id: spotPrea.id, instructor_id: instMarina.id, time: "14:00" },
    ],
  });

  // ── Payments ───────────────────────────────────────────────
  await prisma.payments.createMany({
    data: [
      {
        organization_id: org1.id, student_id: stuMaria.id,
        student_package_id: spMaria.id, amount: 533.33,
        method: "pix", status: "paid", installment_number: 1,
        total_installments: 3, due_date: new Date("2026-02-15"),
        paid_at: new Date("2026-02-15"),
      },
      {
        organization_id: org1.id, student_id: stuMaria.id,
        student_package_id: spMaria.id, amount: 533.33,
        method: "pix", status: "paid", installment_number: 2,
        total_installments: 3, due_date: new Date("2026-03-15"),
        paid_at: new Date("2026-03-14"),
      },
      {
        organization_id: org1.id, student_id: stuMaria.id,
        student_package_id: spMaria.id, amount: 533.34,
        status: "pending", installment_number: 3,
        total_installments: 3, due_date: new Date("2026-04-15"),
      },
      {
        organization_id: org1.id, student_id: stuPedro.id,
        student_package_id: spPedro.id, amount: 1200.0,
        status: "overdue", installment_number: 1,
        total_installments: 1, due_date: new Date("2026-03-01"),
      },
    ],
  });

  // ── Service bookings (demo: statuses + add-on com session) ─
  const mariaConfirmedLesson = await prisma.sessions.findFirst({
    where: {
      student_id: stuMaria.id,
      organization_id: org1.id,
      deleted_at: null,
      status: "confirmed",
    },
    orderBy: { date: "asc" },
  });

  await prisma.service_bookings.createMany({
    data: [
      {
        service_id: svcPhoto.id,
        student_id: stuMaria.id,
        session_id: mariaConfirmedLesson?.id ?? null,
        status: "requested",
        notes: "Fotos na água na próxima aula, se der.",
      },
      {
        service_id: svcPhoto.id,
        student_id: stuPedro.id,
        session_id: null,
        status: "confirmed",
        quote_amount: 250,
        notes: "Sessão na praia — combinado no WhatsApp.",
      },
      {
        service_id: svcPhoto.id,
        student_id: stuAna.id,
        session_id: null,
        status: "cancelled",
        notes: "Desistiu antes de combinar valor.",
      },
      {
        service_id: svcFilme.id,
        student_id: stuPedro.id,
        session_id: null,
        status: "requested",
        notes: "Quero um reel de 30s com as manobras.",
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log(
    `  Organizations: ${org1.name}, ${org2.name}, ${org3.name}, ${orgLouvaKite.name}`,
  );
  console.log(
    `  Global spots: ${gPrea.slug}, ${gJeri.slug}, ${gTramandai.slug} (públicos)`,
  );
  console.log(
    `  Spots: ${spotPrea.name}, ${spotJeri.name}, ${spotTramandai.name}, ${spotLouvaKite.name} (Louva Kite)`,
  );
  console.log(
    `  Users: superadmin + admin + 4 instructors + 3 students + 2 service_provider (fotografo@kiteapp.com, filmes@kiteapp.com)`,
  );
  console.log(`  Packages: 5`);
  console.log(`  Sessions: 6`);
  console.log(`  Agendas: 2 (with 8 slots)`);
  console.log(`  Payments: 4`);
  console.log(
    `  Service bookings: 4 (Lucas: 1 pendente c/ aula, 1 confirmado, 1 cancelado; Bruno: 1 pendente)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
