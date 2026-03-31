import { z } from "zod";

const optionalUrl = z
  .union([z.string().url("URL inválida"), z.literal("")])
  .optional();

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z.string().min(2).optional().or(z.literal("")),
  description: z.string().optional().nullable(),
  site: optionalUrl,
  instagram: z.string().optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
  hero_image: z.string().max(500).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
