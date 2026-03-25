export type AgendaItem = {
  id: number;
  uuid: string;
  organization_id: number;
  slug: string;
  date: Date;
  day_name: string;
  published: boolean;
  rules: unknown;
  slots: AgendaSlotItem[];
};

export type AgendaSlotItem = {
  id: number;
  uuid: string;
  agenda_id: number;
  spot_id: number | null;
  instructor_id: number | null;
  time: string;
  booked: boolean;
  spot?: { id: number; name: string } | null;
  instructor?: { id: number; user: { id: number; name: string } } | null;
};
