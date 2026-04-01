import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import {
  getAppHomePath,
  resolvePostLoginRedirect,
} from "@/lib/auth-routes";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/inicio") ||
    pathname.startsWith("/centers") ||
    pathname.startsWith("/escola") ||
    pathname.startsWith("/spot") ||
    pathname.startsWith("/mapa") ||
    pathname.startsWith("/agendamento") ||
    pathname.startsWith("/convite") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/internal") ||
    pathname.startsWith("/api/booking") ||
    pathname.startsWith("/api/service-bookings") ||
    pathname.startsWith("/api/invites") ||
    pathname.startsWith("/api/upload") ||
    pathname === "/";

  if (isPublicRoute) {
    if (
      req.auth &&
      (pathname.startsWith("/login") || pathname.startsWith("/cadastro"))
    ) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      const target = resolvePostLoginRedirect(
        callbackUrl,
        req.auth.user?.role,
      );
      return NextResponse.redirect(new URL(target, req.url));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/super-admin") || pathname.startsWith("/api/super-admin")) {
    if (role !== "superadmin") {
      return NextResponse.redirect(new URL(getAppHomePath(role), req.url));
    }
  }

  if (pathname.startsWith("/admin") && role !== "admin" && role !== "superadmin") {
    return NextResponse.redirect(new URL(getAppHomePath(role), req.url));
  }

  if (pathname.startsWith("/instrutor") && role !== "instructor" && role !== "admin") {
    return NextResponse.redirect(new URL(getAppHomePath(role), req.url));
  }

  if (pathname.startsWith("/aluno") && role !== "student" && role !== "admin") {
    return NextResponse.redirect(new URL(getAppHomePath(role), req.url));
  }

  if (pathname.startsWith("/prestador") && role !== "service_provider") {
    return NextResponse.redirect(new URL(getAppHomePath(role), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
