export type SessionItem = {
  id: number;
  uuid: string;
  organization_id: number;
  spot_id: number | null;
  student_id: number | null;
  instructor_id: number | null;
  student_package_id: number | null;
  date: Date;
  start_time: string;
  end_time: string | null;
  status: string;
  type: string | null;
  notes: string | null;
  spot?: { id: number; name: string } | null;
  student?: { id: number; user: { id: number; name: string; phone: string | null } } | null;
  instructor?: { id: number; user: { id: number; name: string } } | null;
};
