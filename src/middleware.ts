import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware — tüm isteklerde çalışır.
 * - Admin sayfaları için ek güvenlik başlıkları
 * - API rate limiting header'ları
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Admin sayfaları için cache engelleme
  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  // API route'ları için cache engelleme
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
