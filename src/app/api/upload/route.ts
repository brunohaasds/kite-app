import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

type UploadContext = "instructors" | "organizations" | "users" | "global_spots";

function getBlobPath(
  context: UploadContext,
  entityId: string | null,
  file: File,
  purpose: string | null,
): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const timestamp = Date.now();

  switch (context) {
    case "instructors":
      return entityId
        ? `instructors/${entityId}/avatar-${timestamp}.${ext}`
        : `instructors/avatars/${timestamp}.${ext}`;
    case "organizations": {
      const sub = purpose === "hero" ? "hero" : "logo";
      return entityId
        ? `organizations/${entityId}/${sub}-${timestamp}.${ext}`
        : `organizations/${sub}s/${timestamp}.${ext}`;
    }
    case "users":
      return entityId
        ? `users/${entityId}/avatar-${timestamp}.${ext}`
        : `users/avatars/${timestamp}.${ext}`;
    case "global_spots":
      return entityId
        ? `global-spots/${entityId}/hero-${timestamp}.${ext}`
        : `global-spots/staging/${timestamp}.${ext}`;
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
  const purpose = searchParams.get("purpose");

  const validContexts: UploadContext[] = [
    "instructors",
    "organizations",
    "users",
    "global_spots",
  ];
  if (!context || !validContexts.includes(context)) {
    return NextResponse.json({ error: "Contexto inválido" }, { status: 400 });
  }

  if (context === "users") {
    entityId = String(session.user.id);
  }

  if (context === "global_spots") {
    if (session.user.role === "superadmin") {
      // ok
    } else if (session.user.role === "admin" && entityId && session.user.organizationId) {
      const owned = await prisma.global_spots.findFirst({
        where: {
          id: Number(entityId),
          deleted_at: null,
          owner_organization_id: session.user.organizationId,
        },
        select: { id: true },
      });
      if (!owned) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
  }

  if (context === "organizations") {
    const orgId = session.user.organizationId;
    if (session.user.role === "admin") {
      if (!orgId) {
        return NextResponse.json({ error: "Organização não encontrada" }, { status: 400 });
      }
      if (entityId && Number(entityId) !== orgId) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
      if (!entityId) {
        entityId = String(orgId);
      }
    } else if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
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

  const path = getBlobPath(context, entityId, file, purpose);

  const blob = await put(path, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
