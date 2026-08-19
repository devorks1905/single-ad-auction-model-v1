import { db } from "@/db";
import { auctions, bids, blocklist, events, type Auction, type Bid } from "@/db/schema";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { getSettings } from "@/lib/settings";

export function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function closesAtFor(slotDate: string): Promise<Date> {
  const s = await getSettings();
  const hour = Math.min(23, Math.max(0, Number(s.close_hour_utc) || 21));
  const d = new Date(`${slotDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

export async function log(kind: string, message: string): Promise<void> {
  try {
    await db.insert(events).values({ kind, message });
  } catch {
    /* noop */
  }
}

export async function getOrCreateAuction(slotDate: string): Promise<Auction> {
  const existing = await db.select().from(auctions).where(eq(auctions.slotDate, slotDate));
  if (existing[0]) return existing[0];
  const s = await getSettings();
  const inserted = await db
    .insert(auctions)
    .values({
      slotDate,
      closesAt: await closesAtFor(slotDate),
      minBid: (Number(s.floor_price) || 1).toFixed(2),
    })
    .onConflictDoNothing()
    .returning();
  if (inserted[0]) return inserted[0];
  const again = await db.select().from(auctions).where(eq(auctions.slotDate, slotDate));
  return again[0];
}

/** Kazanan seçimi: reddedilmemiş, ödemesi 'unpaid' olmayan en yüksek teklif. */
async function pickWinner(auctionId: number): Promise<Bid | undefined> {
  const rows = await db
    .select()
    .from(bids)
    .where(
      and(
        eq(bids.auctionId, auctionId),
        eq(bids.rejected, false),
        sql`${bids.paymentStatus} <> 'unpaid'`,
      ),
    )
    .orderBy(desc(sql`${bids.amount}::numeric`), desc(bids.createdAt))
    .limit(1);
  return rows[0];
}

export async function settleAuction(auctionId: number): Promise<Bid | null> {
  const winner = await pickWinner(auctionId);
  await db.update(bids).set({ isWinner: false }).where(eq(bids.auctionId, auctionId));
  if (winner) {
    await db.update(bids).set({ isWinner: true }).where(eq(bids.id, winner.id));
    await db
      .update(auctions)
      .set({ status: "settled", winningBidId: winner.id })
      .where(eq(auctions.id, auctionId));
    await log(
      "settle",
      `Slot satıldı: ${winner.bidder} — $${Number(winner.amount).toLocaleString("en-US")}`,
    );
  } else {
    await db
      .update(auctions)
      .set({ status: "settled", winningBidId: null })
      .where(eq(auctions.id, auctionId));
  }
  return winner ?? null;
}

/**
 * Geçmiş açık artırmaları otomatik kapatır.
 * Performans optimizasyonu: Son 60 saniye içinde çalıştırıldıysa tekrar çalışmaz.
 */
let lastSettleAt = 0;
const SETTLE_COOLDOWN_MS = 60_000; // 60 saniye

export async function settlePastAuctions(): Promise<void> {
  const now = Date.now();
  if (now - lastSettleAt < SETTLE_COOLDOWN_MS) return;
  lastSettleAt = now;

  const open = await db
    .select()
    .from(auctions)
    .where(and(eq(auctions.status, "open"), lt(auctions.slotDate, todayStr(1))));
  for (const a of open) await settleAuction(a.id);
}

export async function getTopBids(auctionId: number, limit = 15): Promise<Bid[]> {
  return db
    .select()
    .from(bids)
    .where(and(eq(bids.auctionId, auctionId), eq(bids.rejected, false)))
    .orderBy(desc(sql`${bids.amount}::numeric`), desc(bids.createdAt))
    .limit(limit);
}

export async function getLiveAuction() {
  await settlePastAuctions();
  const slotDate = todayStr(1);
  const auction = await getOrCreateAuction(slotDate);
  const topBids = await getTopBids(auction.id);
  const s = await getSettings();
  const increment = Number(s.bid_increment) || 25;
  const highest = topBids[0] ? Number(topBids[0].amount) : 0;
  const minNext = highest > 0 ? highest + increment : Number(auction.minBid);
  const count = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bids)
    .where(and(eq(bids.auctionId, auction.id), eq(bids.rejected, false)));
  return { auction, topBids, highest, minNext, bidCount: count[0]?.c ?? 0, increment };
}

export async function getAdForDate(slot: string) {
  const a = await db.select().from(auctions).where(eq(auctions.slotDate, slot));
  if (!a[0]?.winningBidId) return null;
  const w = await db.select().from(bids).where(eq(bids.id, a[0].winningBidId));
  return w[0] ? { ad: w[0], price: Number(w[0].amount) } : null;
}

export async function getTodaysAd() {
  await settlePastAuctions();
  return getAdForDate(todayStr(0));
}

export async function getHallOfFame(limit = 25) {
  const rows = await db
    .select({
      slotDate: auctions.slotDate,
      amount: bids.amount,
      bidder: bids.bidder,
      headline: bids.adHeadline,
      emoji: bids.adEmoji,
      url: bids.adUrl,
    })
    .from(auctions)
    .innerJoin(bids, eq(auctions.winningBidId, bids.id))
    .orderBy(desc(sql`${bids.amount}::numeric`))
    .limit(limit);
  const totals = await db
    .select({
      sum: sql<string>`coalesce(sum(${bids.amount}::numeric),0)::text`,
      cnt: sql<number>`count(*)::int`,
    })
    .from(bids)
    .where(eq(bids.isWinner, true));
  return { rows, totalRevenue: Number(totals[0]?.sum ?? 0), soldDays: totals[0]?.cnt ?? 0 };
}

export async function isBlocked(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const rows = await db
    .select()
    .from(blocklist)
    .where(sql`lower(${blocklist.value}) in (${email.toLowerCase()}, ${domain})`);
  return rows.length > 0;
}

/** Aynı auction için aynı e-posta ile tekrar teklif verilip verilmediğini kontrol eder. */
export async function hasDuplicateBid(auctionId: number, email: string): Promise<boolean> {
  const rows = await db
    .select({ id: bids.id })
    .from(bids)
    .where(and(eq(bids.auctionId, auctionId), eq(bids.email, email.toLowerCase())))
    .limit(1);
  return rows.length > 0;
}
