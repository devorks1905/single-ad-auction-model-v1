import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SubscribeSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta gir.").max(200),
});

const UnsubscribeSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta gir.").max(200),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`subscribe:${ip}`, 5, 60_000);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen bir dakika bekle." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({ email: "" }));
  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta." },
      { status: 400 }
    );
  }

  await db
    .insert(subscribers)
    .values({ email: parsed.data.email.toLowerCase(), source: "site" })
    .onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({ email: "" }));
  const parsed = UnsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta." },
      { status: 400 }
    );
  }

  await db
    .delete(subscribers)
    .where(eq(subscribers.email, parsed.data.email.toLowerCase()));
  return NextResponse.json({ ok: true });
}
