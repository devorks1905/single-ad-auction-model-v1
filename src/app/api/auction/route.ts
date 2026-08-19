import { NextResponse } from "next/server";
import { getLiveAuction } from "@/lib/auction";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getLiveAuction();
  return NextResponse.json({
    slotDate: data.auction.slotDate,
    closesAt: data.auction.closesAt,
    highest: data.highest,
    minNext: data.minNext,
    bidCount: data.bidCount,
    topBids: data.topBids.map((b) => ({
      id: b.id,
      bidder: b.bidder,
      amount: Number(b.amount),
      adHeadline: b.adHeadline,
      adEmoji: b.adEmoji,
      createdAt: b.createdAt,
    })),
  });
}
