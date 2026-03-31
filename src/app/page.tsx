import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAppHomePath } from "@/lib/auth-routes";

export default async function RootPage() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(getAppHomePath(session.user.role));
  }
  redirect("/login");
}
