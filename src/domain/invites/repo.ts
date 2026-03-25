import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { InviteItem } from "./types";

const INVITE_EXPIRY_DAYS = 7;

function mapInviteRow(row: {
  id: number;
  uuid: string;
  token: string;
  email: string;
  status: string;
  created_at: Date;
  expires_at: Date;
  accepted_at: Date | null;
  organization: { name: string };
  invited_by: { name: string };
}): InviteItem {
  return {
    id: row.id,
    uuid: row.uuid,
    token: row.token,
    email: row.email,
    status: row.status,
    orgName: row.organization.name,
    invitedByName: row.invited_by.name,
    created_at: row.created_at,
    expires_at: row.expires_at,
    accepted_at: row.accepted_at,
  };
}

const inviteInclude = {
  organization: { select: { name: true } },
  invited_by: { select: { name: true } },
} as const;

export async function create(orgId: number, invitedById: number, email: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const row = await prisma.invites.create({
    data: {
      token,
      organization_id: orgId,
      invited_by_id: invitedById,
      email: email.toLowerCase(),
      status: "pending",
      expires_at: expiresAt,
    },
    include: inviteInclude,
  });

  return mapInviteRow(row);
}

export async function getByToken(token: string): Promise<InviteItem | null> {
  const row = await prisma.invites.findFirst({
    where: { token, deleted_at: null },
    include: inviteInclude,
  });
  return row ? mapInviteRow(row) : null;
}

export async function findPendingByEmail(orgId: number, email: string) {
  return prisma.invites.findFirst({
    where: {
      organization_id: orgId,
      email: email.toLowerCase(),
      status: "pending",
      deleted_at: null,
      expires_at: { gt: new Date() },
    },
  });
}

export async function listByOrg(orgId: number): Promise<InviteItem[]> {
  const rows = await prisma.invites.findMany({
    where: { organization_id: orgId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: inviteInclude,
  });
  return rows.map(mapInviteRow);
}

export async function listByUser(userId: number): Promise<InviteItem[]> {
  const rows = await prisma.invites.findMany({
    where: { invited_by_id: userId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: inviteInclude,
  });
  return rows.map(mapInviteRow);
}

export async function markAccepted(id: number) {
  return prisma.invites.update({
    where: { id },
    data: { status: "accepted", accepted_at: new Date() },
  });
}
