import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

function getHomeRoute(role?: string) {
  if (role === "superadmin") return "/super-admin";
  if (role === "admin") return "/admin/agenda";
  if (role === "instructor") return "/instrutor/agenda";
  return "/aluno/aulas";
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/escola") ||
    pathname.startsWith("/spot") ||
    pathname.startsWith("/agendamento") ||
    pathname.startsWith("/convite") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/booking") ||
    pathname.startsWith("/api/invites") ||
    pathname.startsWith("/api/upload") ||
    pathname === "/";

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/super-admin") || pathname.startsWith("/api/super-admin")) {
    if (role !== "superadmin") {
      return NextResponse.redirect(new URL(getHomeRoute(role), req.url));
    }
  }

  if (pathname.startsWith("/admin") && role !== "admin" && role !== "superadmin") {
    return NextResponse.redirect(new URL(getHomeRoute(role), req.url));
  }

  if (pathname.startsWith("/instrutor") && role !== "instructor" && role !== "admin") {
    return NextResponse.redirect(new URL(getHomeRoute(role), req.url));
  }

  if (pathname.startsWith("/aluno") && role !== "student" && role !== "admin") {
    return NextResponse.redirect(new URL(getHomeRoute(role), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
