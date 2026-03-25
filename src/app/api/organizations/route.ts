import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const members = await prisma.members.findMany({
      where: { user_id: userId, deleted_at: null },
      include: {
        organization: { select: { id: true, name: true, avatar: true } },
      },
    });

    const organizations = members.map((m) => m.organization);
    return NextResponse.json(organizations);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
