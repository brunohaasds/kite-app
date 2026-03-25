export type GlobalSpot = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  access: "public" | "private";
  description: string | null;
  image: string | null;
  tips: string[] | null;
  services: string[] | null;
  latitude: number | null;
  longitude: number | null;
  parent_spot_id: number | null;
  owner_organization_id: number | null;
  created_at: Date;
};

export type GlobalSpotWithRelations = GlobalSpot & {
  parent_spot?: { id: number; name: string; slug: string } | null;
  owner_organization?: { id: number; name: string } | null;
  children?: GlobalSpot[];
  _count?: { spots: number; permissions: number };
};

export type SpotPermission = {
  id: number;
  uuid: string;
  global_spot_id: number;
  organization_id: number;
  status: "approved" | "revoked";
  granted_by_id: number;
  created_at: Date;
};

export type SpotPermissionWithOrg = SpotPermission & {
  organization: { id: number; name: string; avatar: string | null };
};
