import { NextResponse } from "next/server";
import { registerStudentMinimalSchema } from "@/domain/users/schema";
import { getByEmail } from "@/domain/users/repo";
import { registerStudentMinimal } from "@/domain/users/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerStudentMinimalSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const existing = await getByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "email_exists", message: "Este email já possui uma conta. Faça login." },
        { status: 409 },
      );
    }

    await registerStudentMinimal({ email, password });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno ao criar conta" }, { status: 500 });
  }
}
