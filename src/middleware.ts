import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isStaffRole } from "@/lib/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role === "ABONNE") {
      return NextResponse.redirect(
        new URL("/connexion?mode=staff&error=staff-use-password", req.url)
      );
    }

    if (path.startsWith("/compte") && token?.role && isStaffRole(token.role as string)) {
      return NextResponse.redirect(new URL("/admin", req.url));
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

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
};
