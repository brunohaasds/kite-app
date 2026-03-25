export type PaymentItem = {
  id: number;
  uuid: string;
  organization_id: number;
  student_id: number;
  student_package_id: number | null;
  amount: number;
  method: string | null;
  status: string;
  installment_number: number | null;
  total_installments: number | null;
  due_date: Date | null;
  paid_at: Date | null;
  student?: { id: number; user: { id: number; name: string; phone: string | null } };
};
