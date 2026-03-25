import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { InstrutorContaClient } from "./instrutor-conta-client";

export const dynamic = "force-dynamic";

export default async function InstrutorContaPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const instructor = await prisma.instructors.findFirst({
    where: { user_id: Number(session.user.id), deleted_at: null },
    include: { user: true },
  });

  if (!instructor) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Instrutor não encontrado.
      </div>
    );
  }

  const sessionsCount = await prisma.sessions.count({
    where: { instructor_id: instructor.id, deleted_at: null },
  });
  const completedCount = await prisma.sessions.count({
    where: { instructor_id: instructor.id, status: "completed", deleted_at: null },
  });

  const extras =
    instructor.extras as {
      certifications?: string[];
      [key: string]: unknown;
    } | null;

  return (
    <InstrutorContaClient
      instructor={{
        id: instructor.id,
        bio: instructor.bio,
        avatar: instructor.avatar,
        certification: instructor.certification,
        experience_years: instructor.experience_years,
        extras,
        user: {
          name: instructor.user.name,
          email: instructor.user.email,
          phone: instructor.user.phone,
        },
      }}
      stats={{ total: sessionsCount, completed: completedCount }}
    />
  );
}
