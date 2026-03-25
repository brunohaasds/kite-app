import { z } from "zod";

export const createPackageSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  session_count: z.number().int().positive(),
  price: z.number().nonnegative(),
  validity_days: z.number().int().positive().optional().nullable(),
});

export const updatePackageSchema = createPackageSchema.partial();

export const purchasePackageSchema = z.object({
  student_id: z.number().int().positive(),
  package_id: z.number().int().positive(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PurchasePackageInput = z.infer<typeof purchasePackageSchema>;
