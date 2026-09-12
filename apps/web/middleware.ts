import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/activate"];
const EXECUTIVE_ONLY_PATHS = ["/executive"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("opsflow_token")?.value;

  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (EXECUTIVE_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    const roleCookie = request.cookies.get("opsflow_role")?.value;
    if (roleCookie && roleCookie !== "ADMIN" && roleCookie !== "EXECUTIVE") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};