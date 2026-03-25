import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  site: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  avatar: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
