import { z } from "zod";

export const createSpotSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const updateSpotSchema = createSpotSchema.partial();

export type CreateSpotInput = z.infer<typeof createSpotSchema>;
export type UpdateSpotInput = z.infer<typeof updateSpotSchema>;
