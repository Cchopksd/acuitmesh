import { NextRequest, NextResponse } from "next/server";
import { getUserToken } from "./app/utils/token";

export async function middleware(req: NextRequest) {
  const userToken = await getUserToken();
  const pathname = req.nextUrl.pathname;
  if (pathname !== "/login" && pathname !== "/register") {
    if (!userToken) return NextResponse.redirect(new URL("/login", req.url));
  }

  if (userToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

