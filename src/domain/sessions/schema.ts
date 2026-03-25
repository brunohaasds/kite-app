import { z } from "zod";

export const createSessionSchema = z.object({
  organization_id: z.number().int().positive(),
  spot_id: z.number().int().positive().optional().nullable(),
  student_id: z.number().int().positive().optional().nullable(),
  instructor_id: z.number().int().positive().optional().nullable(),
  student_package_id: z.number().int().positive().optional().nullable(),
  date: z.coerce.date(),
  start_time: z.string().min(1),
  end_time: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.string().min(1),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
