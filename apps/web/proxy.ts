import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session";

function decodeRole(token: string | undefined) {
  if (!token) return null;
  const [encoded] = token.split(".");
  if (!encoded) return null;

  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/dashboard/, "/u");
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/admin/, "/a");
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/u") && !token) {
    return NextResponse.redirect(new URL("/auth/login?next=/u", request.url));
  }

  if (pathname.startsWith("/a")) {
    const role = decodeRole(token);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login?next=/a", request.url));
    }
  }

  if (pathname.startsWith("/r")) {
    const role = decodeRole(token);
    if (role !== "rider" && role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login?next=/r", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/u/:path*", "/a/:path*", "/r/:path*"],
};
