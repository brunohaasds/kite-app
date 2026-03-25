import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { update } from "@/domain/organizations/repo";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  site: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Organização não encontrada" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    }

    const { name, description, avatar, whatsapp, instagram, site } = parsed.data;

    await update(orgId, {
      name: name.trim(),
      description: description ?? undefined,
      avatar: avatar ?? undefined,
      whatsapp: whatsapp ?? undefined,
      instagram: instagram ?? undefined,
      site: site ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
