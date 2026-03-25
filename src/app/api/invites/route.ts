import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createInviteSchema } from "@/domain/invites/schema";
import { create as createInvite, findPendingByEmail } from "@/domain/invites/repo";
import { sendInviteEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createInviteSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Dados inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email, orgId } = parsed.data;
    const userId = Number(session.user.id);

    const org = await prisma.organizations.findFirst({
      where: { id: orgId, deleted_at: null },
    });
    if (!org) {
      return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 });
    }

    const existing = await findPendingByEmail(orgId, email);
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um convite pendente para este email" },
        { status: 409 },
      );
    }

    const invite = await createInvite(orgId, userId, email);

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/convite/${invite.token}`;

    await sendInviteEmail({
      to: email,
      orgName: invite.orgName,
      invitedByName: invite.invitedByName,
      inviteUrl,
    });

    return NextResponse.json({ success: true, invite });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar convite" }, { status: 500 });
  }
}
