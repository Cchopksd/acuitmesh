import { NextRequest, NextResponse } from "next/server";
import { getUserToken } from "./app/utils/token";

export async function middleware(req: NextRequest) {
  const userToken = await getUserToken();
  const pathname = req.nextUrl.pathname;

  if (!userToken && pathname === "/board") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (userToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

