import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "admin" && session.user.role !== "superadmin")
  ) {
    return NextResponse.json({ hasOwnedSpot: false });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ hasOwnedSpot: false });
  }

  const count = await prisma.global_spots.count({
    where: {
      owner_organization_id: orgId,
      deleted_at: null,
    },
  });

  return NextResponse.json({ hasOwnedSpot: count > 0 });
}
