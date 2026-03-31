import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.string().min(1),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  role: z.string().min(1).optional(),
});

export const registerStudentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido").optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  level: z.enum(["iniciante", "intermediario", "avancado"]).optional(),
  orgId: z.number().int().positive(),
});

/** Cadastro público: só conta; vínculo com escola no primeiro agendamento. */
export const registerStudentMinimalSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterStudentMinimalInput = z.infer<typeof registerStudentMinimalSchema>;

const USER_ROLES = [
  "superadmin",
  "admin",
  "instructor",
  "student",
  "service_provider",
] as const;

export const superAdminCreateUserSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.union([z.string().max(20), z.literal("")]).optional(),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    role: z.enum(USER_ROLES),
    organizationId: z.number().int().positive().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.role === "admin" ||
      data.role === "instructor" ||
      data.role === "student"
    ) {
      if (!data.organizationId) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione uma escola para este perfil",
          path: ["organizationId"],
        });
      }
    }
  });

export const superAdminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.union([z.string().max(20), z.literal("")]).optional(),
  role: z.enum(USER_ROLES).optional(),
  organizationId: z.number().int().positive().optional().nullable(),
  password: z
    .union([z.string().min(6, "Mínimo 6 caracteres"), z.literal("")])
    .optional(),
});

export type SuperAdminCreateUserInput = z.infer<
  typeof superAdminCreateUserSchema
>;
export type SuperAdminUpdateUserInput = z.infer<
  typeof superAdminUpdateUserSchema
>;
