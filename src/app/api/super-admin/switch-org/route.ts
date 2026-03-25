import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({ organizationId: z.number().int() });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "organizationId inválido" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("sa-org-id", String(parsed.data.organizationId), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.delete("sa-org-id");

  return NextResponse.json({ success: true });
}
