import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isJournalistRole, isStaffRole } from "@/lib/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/connexion") && token?.sub) {
      return NextResponse.redirect(
        new URL(
          isJournalistRole(token.role as string)
            ? "/journaliste"
            : isStaffRole(token.role as string)
              ? "/admin"
              : "/compte",
          req.url
        )
      );
    }

    if (path.startsWith("/admin") && token?.role === "ABONNE") {
      return NextResponse.redirect(
        new URL("/compte?error=staff-only", req.url)
      );
    }

    if (path.startsWith("/admin") && token?.role === "JOURNALISTE") {
      return NextResponse.redirect(new URL("/journaliste", req.url));
    }

    if (path.startsWith("/journaliste") && token?.role !== "JOURNALISTE") {
      return NextResponse.redirect(
        new URL(token?.role && isStaffRole(token.role as string) ? "/admin" : "/compte", req.url)
      );
    }

    if (path.startsWith("/compte") && token?.role && isStaffRole(token.role as string)) {
      return NextResponse.redirect(
        new URL(isJournalistRole(token.role as string) ? "/journaliste" : "/admin", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/connexion" },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith("/admin/login")) {
          return true;
        }

        if (path.startsWith("/admin")) {
          return !!token && token.role !== "ABONNE";
        }

        if (path.startsWith("/compte")) {
          return !!token;
        }

        if (path.startsWith("/journaliste")) {
          return !!token && token.role === "JOURNALISTE";
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/journaliste/:path*", "/compte/:path*", "/connexion/:path*"],
};
