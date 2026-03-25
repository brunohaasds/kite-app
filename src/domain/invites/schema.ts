import { z } from "zod";

export const createInviteSchema = z.object({
  email: z.string().email("Email inválido"),
  orgId: z.number().int().positive(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
