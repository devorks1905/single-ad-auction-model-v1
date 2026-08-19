import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { auctions, bids, blocklist } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, verifyCsrf } from "@/lib/admin";
import { getOrCreateAuction, log, settleAuction, todayStr } from "@/lib/auction";
import { setSetting, type SettingKey } from "@/lib/settings";
import { createPaymentLink } from "@/lib/stripe";
import { sendEmail, winnerEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  // CSRF doğrulaması
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!(await verifyCsrf(csrfHeader))) {
    return NextResponse.json({ error: "CSRF token geçersiz." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");
  const id = Number(body.id);

  const getBid = async () =>
    (await db.select().from(bids).where(eq(bids.id, id)))[0];

  switch (action) {
    case "reject": {
      const bid = await getBid();
      if (!bid) return NextResponse.json({ error: "Teklif yok." }, { status: 404 });
      const reason = z.string().max(500).parse(body.reason ?? "Editoryal red");
      await db
        .update(bids)
        .set({ rejected: true, rejectReason: reason })
        .where(eq(bids.id, id));
      await settleAuctionIfSettled(bid.auctionId);
      await log("reject", `Teklif reddedildi: ${bid.bidder}`);
      return NextResponse.json({ ok: true });
    }
    case "restore": {
      const bid = await getBid();
      if (!bid) return NextResponse.json({ error: "Teklif yok." }, { status: 404 });
      await db
        .update(bids)
        .set({ rejected: false, rejectReason: null })
        .where(eq(bids.id, id));
      await settleAuctionIfSettled(bid.auctionId);
      return NextResponse.json({ ok: true });
    }
    case "mark_paid":
    case "mark_unpaid": {
      const bid = await getBid();
      if (!bid) return NextResponse.json({ error: "Teklif yok." }, { status: 404 });
      const status = action === "mark_paid" ? "paid" : "unpaid";
      await db.update(bids).set({ paymentStatus: status }).where(eq(bids.id, id));
      if (status === "unpaid") await settleAuctionIfSettled(bid.auctionId);
      await log("payment", `${bid.bidder} → ${status}`);
      return NextResponse.json({ ok: true });
    }
    case "payment_link": {
      const bid = await getBid();
      if (!bid) return NextResponse.json({ error: "Teklif yok." }, { status: 404 });
      const manual = z.string().max(1000).parse(body.url ?? "").trim();
      let url = manual;
      if (!url) {
        const created = await createPaymentLink({
          amount: Number(bid.amount),
          name: `TekReklam slotu — ${bid.adHeadline}`,
          description: `${bid.bidder} · ${bid.adUrl}`,
        });
        if (!created)
          return NextResponse.json(
            { error: "STRIPE_SECRET_KEY tanımlı değil. Manuel link girebilirsin." },
            { status: 400 }
          );
        if ("error" in created)
          return NextResponse.json({ error: created.error }, { status: 400 });
        url = created.url;
      }
      await db.update(bids).set({ paymentLink: url }).where(eq(bids.id, id));
      return NextResponse.json({ ok: true, url });
    }
    case "email_winner": {
      const bid = await getBid();
      if (!bid) return NextResponse.json({ error: "Teklif yok." }, { status: 404 });
      const a = (
        await db.select().from(auctions).where(eq(auctions.id, bid.auctionId))
      )[0];
      const r = await sendEmail({
        to: bid.email,
        subject: `Tek reklam slotunu kazandın — ${a?.slotDate ?? ""}`,
        html: winnerEmailHtml({
          bidder: bid.bidder,
          amount: Number(bid.amount),
          slotDate: a?.slotDate ?? "",
          paymentLink: bid.paymentLink,
        }),
      });
      return NextResponse.json({
        ok: r.sent,
        info: r.sent ? "Gönderildi" : r.reason,
      });
    }
    case "block": {
      const value = z
        .string()
        .min(1)
        .max(200)
        .parse(body.value ?? "")
        .trim()
        .toLowerCase();
      if (!value) return NextResponse.json({ error: "Değer boş." }, { status: 400 });
      await db
        .insert(blocklist)
        .values({ value, reason: z.string().max(500).parse(body.reason ?? "") })
        .onConflictDoNothing();
      return NextResponse.json({ ok: true });
    }
    case "unblock": {
      await db.delete(blocklist).where(eq(blocklist.id, id));
      return NextResponse.json({ ok: true });
    }
    case "set_min_bid": {
      const slotDate = z.string().max(10).parse(body.slotDate ?? todayStr(1));
      const a = await getOrCreateAuction(slotDate);
      const minBid = z.number().positive().parse(Number(body.value) || 1);
      await db
        .update(auctions)
        .set({ minBid: minBid.toFixed(2) })
        .where(eq(auctions.id, a.id));
      return NextResponse.json({ ok: true });
    }
    case "close_now": {
      const slotDate = z.string().max(10).parse(body.slotDate ?? todayStr(1));
      const a = await getOrCreateAuction(slotDate);
      const winner = await settleAuction(a.id);
      return NextResponse.json({ ok: true, winner: winner?.bidder ?? null });
    }
    case "reopen": {
      const slotDate = z.string().max(10).parse(body.slotDate ?? todayStr(1));
      const a = await getOrCreateAuction(slotDate);
      await db
        .update(auctions)
        .set({ status: "open", winningBidId: null })
        .where(eq(auctions.id, a.id));
      await db.update(bids).set({ isWinner: false }).where(eq(bids.auctionId, a.id));
      return NextResponse.json({ ok: true });
    }
    case "setting": {
      const key = z.string().max(50).parse(body.key) as SettingKey;
      const value = z.string().max(1000).parse(body.value ?? "");
      await setSetting(key, value);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Bilinmeyen işlem." }, { status: 400 });
  }
}

async function settleAuctionIfSettled(auctionId: number): Promise<void> {
  const a = (
    await db.select().from(auctions).where(eq(auctions.id, auctionId))
  )[0];
  if (a?.status === "settled") await settleAuction(auctionId);
}
