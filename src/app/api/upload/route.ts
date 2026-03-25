import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

type UploadContext = "instructors" | "organizations" | "users";

function getBlobPath(context: UploadContext, entityId: string | null, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const timestamp = Date.now();

  switch (context) {
    case "instructors":
      return entityId ? `instructors/${entityId}/avatar-${timestamp}.${ext}` : `instructors/avatars/${timestamp}.${ext}`;
    case "organizations":
      return entityId ? `organizations/${entityId}/logo-${timestamp}.${ext}` : `organizations/logos/${timestamp}.${ext}`;
    case "users":
      return entityId ? `users/${entityId}/avatar-${timestamp}.${ext}` : `users/avatars/${timestamp}.${ext}`;
    default:
      return `uploads/${timestamp}.${ext}`;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const context = searchParams.get("context") as UploadContext | null;
  let entityId = searchParams.get("entityId") ?? null;

  if (!context || !["instructors", "organizations", "users"].includes(context)) {
    return NextResponse.json({ error: "Contexto inválido" }, { status: 400 });
  }

  if (context === "users") {
    entityId = String(session.user.id);
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use PNG, JPEG ou WebP" }, { status: 400 });
  }

  if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
    return NextResponse.json({ error: `Arquivo excede ${MAX_SIZE_MB} MB` }, { status: 400 });
  }

  const path = getBlobPath(context, entityId, file);

  const blob = await put(path, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
