import { z } from "zod";

export const createAgendaSchema = z.object({
  organization_id: z.number().int().positive(),
  date: z.coerce.date(),
  day_name: z.string().min(1),
});

export const addSlotSchema = z.object({
  agenda_id: z.number().int().positive(),
  spot_id: z.number().int().positive().optional().nullable(),
  instructor_id: z.number().int().positive().optional().nullable(),
  time: z.string().min(1),
});

export type CreateAgendaInput = z.infer<typeof createAgendaSchema>;
export type AddSlotInput = z.infer<typeof addSlotSchema>;
