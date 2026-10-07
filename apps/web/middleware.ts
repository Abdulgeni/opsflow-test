import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/activate"];
const EXECUTIVE_ONLY_PATHS = ["/executive"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Public paths bypass everything.
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Unauthenticated users get sent to sign-in (root is allowed through).
  const token = request.cookies.get("opsflow_token")?.value;
  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 3. Role-based routing: CLIENT users live in /portal, everyone else in /dashboard.
  const role = request.cookies.get("opsflow_role")?.value;

  if (role === "CLIENT" && !pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }
  if (role && role !== "CLIENT" && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Executive-only paths (existing behavior, unchanged).
  if (EXECUTIVE_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    if (role && role !== "ADMIN" && role !== "EXECUTIVE") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};