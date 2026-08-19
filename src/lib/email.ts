/**
 * HTML karakterlerini escape eder — XSS önleme.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** RESEND_API_KEY varsa e-posta gönderir, yoksa sessizce atlar (log döner). */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "TekReklam <onboarding@resend.dev>";
  if (!key) return { sent: false, reason: "RESEND_API_KEY yok — e-posta atlandı" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) return { sent: false, reason: `Resend ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "hata" };
  }
}

export function winnerEmailHtml(o: {
  bidder: string;
  amount: number;
  slotDate: string;
  paymentLink?: string | null;
}): string {
  const bidder = escapeHtml(o.bidder);
  const slotDate = escapeHtml(o.slotDate);
  const amount = o.amount.toLocaleString("en-US");
  const paymentLinkHtml = o.paymentLink
    ? `<p><a href="${escapeHtml(o.paymentLink)}" style="background:#a3e635;color:#000;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Ödemeyi tamamla</a></p>`
    : `<p>Ödeme linki kısa süre içinde bu e-postaya iletilecek.</p>`;

  return `
  <div style="font-family:system-ui,sans-serif;line-height:1.6">
    <h2>Kazandın 🎉</h2>
    <p>Merhaba ${bidder}, <b>${slotDate}</b> tarihli tek reklam slotunu
    <b>$${amount}</b> ile kazandın.</p>
    ${paymentLinkHtml}
    <p>Ödeme onaylandığında reklamın 00:00 UTC'de otomatik yayına girer ve 24 saat boyunca
    sitedeki <b>tek</b> reklam olur.</p>
  </div>`;
}

export function unsubscribeEmailHtml(email: string): string {
  return `
  <div style="font-family:system-ui,sans-serif;line-height:1.6">
    <h2>Abonelikten çıktın</h2>
    <p>${escapeHtml(email)} adresi listeden kaldırıldı. Artık e-posta almayacaksın.</p>
    <p>Teklif vermeye devam edebilirsin — abonelik sadece sabah bildirimleri için.</p>
  </div>`;
}
