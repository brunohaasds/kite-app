import { NextResponse } from "next/server";
import { registerStudentSchema } from "@/domain/users/schema";
import { getByEmail } from "@/domain/users/repo";
import { registerStudent } from "@/domain/users/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerStudentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, phone, password, level, orgId } = parsed.data;

    const existing = await getByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "email_exists", message: "Este email já possui uma conta. Faça login." },
        { status: 409 },
      );
    }

    await registerStudent(orgId, {
      name,
      email,
      phone,
      password,
      level: level ?? null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno ao criar conta" }, { status: 500 });
  }
}
