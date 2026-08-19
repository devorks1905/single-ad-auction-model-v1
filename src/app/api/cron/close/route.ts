import { NextResponse } from "next/server";
import { settlePastAuctions, todayStr, getAdForDate } from "@/lib/auction";
import { sendEmail, winnerEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron / harici cron için: /api/cron/close
 * CRON_SECRET tanımlıysa `?key=` veya Authorization: Bearer ile doğrulanır.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const auth = req.headers.get("authorization") ?? "";
    if (url.searchParams.get("key") !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }
  await settlePastAuctions();
  const today = await getAdForDate(todayStr(0));
  let emailed: string | null = null;
  if (today && today.ad.paymentStatus === "pending") {
    const r = await sendEmail({
      to: today.ad.email,
      subject: "Tek reklam slotunu kazandın 🎉",
      html: winnerEmailHtml({
        bidder: today.ad.bidder,
        amount: today.price,
        slotDate: todayStr(0),
        paymentLink: today.ad.paymentLink,
      }),
    });
    emailed = r.sent ? today.ad.email : null;
  }
  return NextResponse.json({
    ok: true,
    winner: today?.ad.bidder ?? null,
    emailed,
  });
}
