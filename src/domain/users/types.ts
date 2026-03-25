export type UserBase = {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: Date;
};

export type StudentProfile = {
  id: number;
  uuid: string;
  user_id: number;
  organization_id: number;
  level: string | null;
  goals: unknown;
  notes: string | null;
  user: UserBase;
};

export type InstructorProfile = {
  id: number;
  uuid: string;
  user_id: number;
  organization_id: number;
  certification: string | null;
  experience_years: number | null;
  bio: string | null;
  user: UserBase;
};
