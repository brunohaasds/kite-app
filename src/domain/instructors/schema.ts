import { z } from "zod";

export const createInstructorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  certification: z.string().optional(),
  experience_years: z.number().int().min(0).optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export const updateInstructorSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  certification: z.string().optional(),
  experience_years: z.number().int().min(0).optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export type CreateInstructorInput = z.infer<typeof createInstructorSchema>;
export type UpdateInstructorInput = z.infer<typeof updateInstructorSchema>;
