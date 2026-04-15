import { describe, expect, it } from "vitest";
import { publicBookingBodySchema } from "@/domain/agendas/schema";

describe("publicBookingBodySchema", () => {
  it("aceita payload mínimo para aula avulsa", () => {
    const r = publicBookingBodySchema.safeParse({
      slotId: 1,
      orgId: 2,
      lessonType: "avulsa",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita lessonType inválido", () => {
    const r = publicBookingBodySchema.safeParse({
      slotId: 1,
      orgId: 2,
      lessonType: "outro",
    });
    expect(r.success).toBe(false);
  });

  it("aceita pacote_credito com studentPackageId", () => {
    const r = publicBookingBodySchema.safeParse({
      slotId: 1,
      orgId: 2,
      lessonType: "pacote_credito",
      studentPackageId: 10,
    });
    expect(r.success).toBe(true);
  });
});
