import { z } from "zod";

export const createGlobalSpotSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  access: z.enum(["public", "private"]).default("public"),
  country: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  tips: z.array(z.string()).optional().nullable(),
  services: z.array(z.string()).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  parent_spot_id: z.number().int().optional().nullable(),
  owner_organization_id: z.number().int().optional().nullable(),
});

export const updateGlobalSpotSchema = createGlobalSpotSchema.partial().extend({
  id: z.number().int(),
});

export const grantAccessSchema = z.object({
  global_spot_id: z.number().int(),
  organization_id: z.number().int(),
});

export const revokeAccessSchema = z.object({
  global_spot_id: z.number().int(),
  organization_id: z.number().int(),
});

export type CreateGlobalSpotInput = z.infer<typeof createGlobalSpotSchema>;
export type UpdateGlobalSpotInput = z.infer<typeof updateGlobalSpotSchema>;
