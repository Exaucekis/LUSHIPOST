import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { homePathForRole } from "@/lib/navigation";
import { isJournalistRole, isStaffRole } from "@/lib/roles";

function loginRedirect(req: NextRequest, callbackPath: string, staff = false) {
  const url = new URL("/connexion", req.url);
  url.searchParams.set("callbackUrl", callbackPath);
  if (staff) url.searchParams.set("mode", "staff");
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;
  const role = typeof token?.role === "string" ? token.role : undefined;
  const isAuthenticated = Boolean(token?.sub || token?.id);

  if (path.startsWith("/connexion")) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(homePathForRole(role), req.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    if (!isAuthenticated) return loginRedirect(req, path, true);
    if (isJournalistRole(role ?? "")) {
      return NextResponse.redirect(new URL("/journaliste", req.url));
    }
    if (role === "ABONNE") {
      return NextResponse.redirect(new URL("/compte?error=staff-only", req.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/journaliste")) {
    if (!isAuthenticated) return loginRedirect(req, path, true);
    if (!isJournalistRole(role ?? "")) {
      return NextResponse.redirect(new URL(homePathForRole(role), req.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/compte")) {
    if (!isAuthenticated) return loginRedirect(req, path);
    if (role && isStaffRole(role)) {
      return NextResponse.redirect(new URL(homePathForRole(role), req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/journaliste",
    "/journaliste/:path*",
    "/compte",
    "/compte/:path*",
    "/connexion",
    "/connexion/:path*",
  ],
};
