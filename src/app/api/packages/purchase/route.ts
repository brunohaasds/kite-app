import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { purchase } from "@/domain/packages/repo";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, packageId } = await req.json();
    if (!studentId || !packageId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await purchase(Number(studentId), Number(packageId));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 },
    );
  }
}
