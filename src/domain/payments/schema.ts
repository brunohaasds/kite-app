import { z } from "zod";

export const createPaymentSchema = z.object({
  student_id: z.number().int().positive(),
  student_package_id: z.number().int().positive().optional().nullable(),
  amount: z.number().nonnegative(),
  method: z.string().optional().nullable(),
  installment_number: z.number().int().positive().optional().nullable(),
  total_installments: z.number().int().positive().optional().nullable(),
  due_date: z.coerce.date().optional().nullable(),
});

export const markPaidSchema = z.object({
  method: z.string().min(1),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
