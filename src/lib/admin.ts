import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE = "tr_admin";
const CSRF_COOKIE = "tr_csrf";

export function adminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    console.warn(
      "[TekReklam] ADMIN_PASSWORD tanımlı değil — varsayılan şifre kullanılıyor. Üretimde mutlaka değiştirin!"
    );
  }
  return pw || "tekreklam";
}

function secret(): string {
  return process.env.ADMIN_SECRET || adminPassword() + "::tekreklam-salt";
}

export function makeToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const sig = createHmac("sha256", secret()).update(String(exp)).digest("hex");
  return `${exp}.${sig}`;
}

export function verifyToken(token?: string): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  if (Number(expStr) < Date.now()) return false;
  const expected = createHmac("sha256", secret()).update(expStr).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

/** CSRF token üretir (session başına bir kez). */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/** CSRF token doğrular — cookie + header eşleşmesi gerekir. */
export async function verifyCsrf(headerToken?: string | null): Promise<boolean> {
  const jar = await cookies();
  const cookieToken = jar.get(CSRF_COOKIE)?.value;
  if (!cookieToken || !headerToken) return false;
  try {
    return timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE;
export const CSRF_COOKIE_NAME = CSRF_COOKIE;
