import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bids, subscribers } from "@/db/schema";
import { getLiveAuction, hasDuplicateBid, isBlocked, log } from "@/lib/auction";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const BANNED = /\b(porn|casino|bahis|viagra|crypto ?pump|escort)\b/i;

const BidSchema = z.object({
  bidder: z.string().trim().min(1, "Adın / markan gerekli.").max(100),
  email: z.string().trim().email("Geçerli bir e-posta gir.").max(200),
  adHeadline: z.string().trim().min(1, "Reklam başlığı gerekli.").max(70, "Başlık en fazla 70 karakter."),
  adBody: z.string().trim().max(140, "Alt metin en fazla 140 karakter.").default(""),
  adUrl: z.string().trim().min(1, "URL gerekli.").max(500),
  adEmoji: z.string().trim().max(4).default("🚀"),
  amount: z.number().positive("Teklif tutarı pozitif olmalı.").finite(),
});

export async function POST(req: Request) {
  // Rate limiting
  const ip = getClientIp(req);
  const rl = rateLimit(`bid:${ip}`, 5, 60_000); // 5 teklif/dakika
  if (rl.limited) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen bir dakika bekle." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = BidSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError?.message ?? "Geçersiz veri." },
      { status: 400 }
    );
  }

  const { bidder, email, adHeadline, adBody, adEmoji, amount } = parsed.data;
  let adUrl = parsed.data.adUrl;

  // URL düzeltmesi
  if (!/^https?:\/\//i.test(adUrl)) adUrl = `https://${adUrl}`;
  try {
    new URL(adUrl);
  } catch {
    return NextResponse.json({ error: "Geçerli bir URL gir." }, { status: 400 });
  }

  // İçerik filtresi
  if (BANNED.test(`${adHeadline} ${adBody} ${adUrl}`)) {
    return NextResponse.json(
      { error: "Bu içerik editoryal kurallarımıza uymuyor." },
      { status: 400 }
    );
  }

  // Engel listesi kontrolü
  if (await isBlocked(email)) {
    return NextResponse.json({ error: "Bu e-posta teklif veremez." }, { status: 403 });
  }

  const live = await getLiveAuction();

  // Minimum teklif kontrolü
  if (amount < live.minNext) {
    return NextResponse.json(
      { error: `Minimum teklif $${live.minNext.toLocaleString("en-US")}.` },
      { status: 400 }
    );
  }

  // Tekrarlanan teklif kontrolü — aynı auction + aynı e-posta
  if (await hasDuplicateBid(live.auction.id, email)) {
    return NextResponse.json(
      { error: "Bu açık artırmada zaten bir teklifin var. Yeni bir teklif için farklı bir e-posta kullan." },
      { status: 409 }
    );
  }

  const [row] = await db
    .insert(bids)
    .values({
      auctionId: live.auction.id,
      bidder,
      email: email.toLowerCase(),
      amount: amount.toFixed(2),
      adHeadline,
      adBody,
      adUrl,
      adEmoji: [...adEmoji][0] ?? "🚀",
      ip,
    })
    .returning();

  await db
    .insert(subscribers)
    .values({ email: email.toLowerCase(), source: "bid" })
    .onConflictDoNothing();
  await log("bid", `${bidder} → $${amount.toLocaleString("en-US")}`);

  return NextResponse.json({ ok: true, bid: { id: row.id, amount: Number(row.amount) } });
}
