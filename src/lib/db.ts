import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

/**
 * Detecta singleton do Prisma gerado antes de `prisma generate` (HMR / reload sem restart):
 * delegates como `services` ou `global_spots` podem faltar no objeto antigo.
 * Se remover `services` do schema no futuro, troque o último teste por outro modelo “recente”.
 */
function isPrismaClientHealthy(client: PrismaClient): boolean {
  const c = client as unknown as Record<
    string,
    { count?: unknown; findFirst?: unknown } | undefined
  >;
  return (
    typeof c.organizations?.count === "function" &&
    typeof c.global_spots?.count === "function" &&
    typeof c.services?.findFirst === "function"
  );
}

function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing && isPrismaClientHealthy(existing)) {
    return existing;
  }
  if (existing) {
    void existing.$disconnect().catch(() => {
      /* ignore */
    });
  }
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrisma();
