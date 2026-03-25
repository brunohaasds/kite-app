export type PackageItem = {
  id: number;
  uuid: string;
  organization_id: number;
  title: string;
  description: string | null;
  session_count: number;
  session_duration_minutes: number;
  price: number;
  validity_days: number | null;
  active: boolean;
};

export type StudentPackageItem = {
  id: number;
  uuid: string;
  student_id: number;
  package_id: number;
  sessions_total: number;
  sessions_used: number;
  sessions_remaining: number;
  status: string;
  purchase_date: Date;
  expiry_date: Date | null;
  package: PackageItem;
};
