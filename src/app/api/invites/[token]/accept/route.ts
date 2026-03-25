import { NextResponse } from "next/server";
import { z } from "zod";
import { getByToken, markAccepted } from "@/domain/invites/repo";
import { getByEmail } from "@/domain/users/repo";
import { registerStudent, assignToOrganization } from "@/domain/users/service";
import { prisma } from "@/lib/db";

const acceptSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const invite = await getByToken(token);

    if (!invite) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "Convite já utilizado" }, { status: 410 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
    }

    const body = await req.json();
    const parsed = acceptSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Dados inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, phone, password } = parsed.data;

    const inviteRow = await prisma.invites.findFirst({
      where: { token },
      select: { organization_id: true },
    });
    if (!inviteRow) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }
    const orgId = inviteRow.organization_id;

    const existingUser = await getByEmail(invite.email);

    if (existingUser) {
      await assignToOrganization(existingUser.id, orgId);
    } else {
      await registerStudent(orgId, {
        name,
        email: invite.email,
        phone,
        password,
      });
    }

    await markAccepted(invite.id);

    return NextResponse.json({ success: true, email: invite.email });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
