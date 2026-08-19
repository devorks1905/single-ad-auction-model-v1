/**
 * Stripe Payment Link'i doğrudan REST API ile oluşturur (SDK gerekmez).
 * STRIPE_SECRET_KEY yoksa null döner ve admin manuel link girer.
 */
export async function createPaymentLink(opts: {
  amount: number;
  name: string;
  description: string;
  currency?: string;
}): Promise<{ url: string } | { error: string } | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const currency = (opts.currency || "usd").toLowerCase();

  const form = (obj: Record<string, string>) => new URLSearchParams(obj);
  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  try {
    const priceRes = await fetch("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers,
      body: form({
        currency,
        unit_amount: String(Math.round(opts.amount * 100)),
        "product_data[name]": opts.name.slice(0, 120),
      }),
    });
    const price = await priceRes.json();
    if (!priceRes.ok) return { error: price?.error?.message ?? "Stripe price hatası" };

    const linkRes = await fetch("https://api.stripe.com/v1/payment_links", {
      method: "POST",
      headers,
      body: form({
        "line_items[0][price]": price.id,
        "line_items[0][quantity]": "1",
        "metadata[description]": opts.description.slice(0, 400),
      }),
    });
    const link = await linkRes.json();
    if (!linkRes.ok) return { error: link?.error?.message ?? "Stripe link hatası" };
    return { url: link.url as string };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Stripe bağlantı hatası" };
  }
}
