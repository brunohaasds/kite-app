export function isOrganizationOnGlobalSpot(
  spot: {
    owner_organization: { id: number } | null;
    spots: { organization_id: number }[];
    permissions: { organization_id: number }[];
  },
  organizationId: number,
): boolean {
  if (spot.owner_organization?.id === organizationId) return true;
  if (spot.spots.some((s) => s.organization_id === organizationId)) return true;
  if (spot.permissions.some((p) => p.organization_id === organizationId)) return true;
  return false;
}
