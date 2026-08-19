import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  CSRF_COOKIE_NAME,
  adminPassword,
  generateCsrfToken,
  makeToken,
} from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  password: z.string().min(1, "Şifre gerekli.").max(200),
});

export async function POST(req: Request) {
  // Rate limiting — brute force koruması
  const ip = getClientIp(req);
  const rl = rateLimit(`admin-login:${ip}`, 5, 300_000); // 5 deneme / 5 dakika
  if (rl.limited) {
    return NextResponse.json(
      { error: "Çok fazla deneme. 5 dakika bekle." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const body = await req.json().catch(() => ({ password: "" }));
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Şifre gerekli." }, { status: 400 });
  }

  if (parsed.data.password !== adminPassword()) {
    return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
  }

  const csrfToken = generateCsrfToken();
  const res = NextResponse.json({ ok: true });

  // Admin session cookie
  res.cookies.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  // CSRF cookie — JavaScript erişebilir (httpOnly: false)
  res.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(CSRF_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
