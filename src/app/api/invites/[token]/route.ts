import { NextResponse } from "next/server";
import { getByToken } from "@/domain/invites/repo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const invite = await getByToken(token);

    if (!invite) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "already_used" }, { status: 410 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "expired" }, { status: 410 });
    }

    return NextResponse.json({
      email: invite.email,
      orgName: invite.orgName,
      invitedByName: invite.invitedByName,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
