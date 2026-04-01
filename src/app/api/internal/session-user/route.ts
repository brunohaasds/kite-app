import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getInternalSessionSecret } from "@/lib/auth-session-revalidate";

/**
 * Node runtime: validates user id still exists and is not soft-deleted.
 * Called from jwt callback via fetch (Prisma cannot run in Edge middleware bundle).
 */
export async function POST(req: Request) {
  const expected = getInternalSessionSecret();
  if (!expected) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false });
  }

  const userId = Number(
    body && typeof body === "object" && "userId" in body
      ? (body as { userId: unknown }).userId
      : NaN,
  );

  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ valid: false });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, deleted_at: true },
  });

  const valid = !!user && user.deleted_at === null;
  return NextResponse.json({ valid });
}
