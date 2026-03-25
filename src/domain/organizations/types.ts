export type Organization = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  site: string | null;
  instagram: string | null;
  avatar: string | null;
  whatsapp: string | null;
  settings: Record<string, unknown> | null;
  created_at: Date;
};

export type OrganizationWithSpots = Organization & {
  spots: { id: number; name: string }[];
};
