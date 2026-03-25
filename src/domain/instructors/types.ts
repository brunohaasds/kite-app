export type InstructorExtras = {
  certifications?: string[];
  specialties?: string[];
  [key: string]: unknown;
};

export type InstructorItem = {
  id: number;
  uuid: string;
  organization_id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  certification: string | null;
  experience_years: number | null;
  bio: string | null;
  avatar: string | null;
  extras: InstructorExtras | null;
  created_at: Date;
};
