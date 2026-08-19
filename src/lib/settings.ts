import { db } from "@/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

export const DEFAULTS = {
  floor_price: "1",
  bid_increment: "25",
  close_hour_utc: "21",
  site_tagline: "Bu sitede günde tek bir reklam var.",
  payment_note:
    "Kapanıştan sonra sana ödeme linki e-postayla gönderilir. Ödeme onaylanınca reklamın 00:00 UTC'de yayına girer.",
};

export type SettingKey = keyof typeof DEFAULTS;

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const keys = Object.keys(DEFAULTS) as SettingKey[];
  let rows: { key: string; value: string }[] = [];
  try {
    rows = await db.select().from(settings).where(inArray(settings.key, keys));
  } catch {
    rows = [];
  }
  const out = { ...DEFAULTS };
  for (const r of rows) {
    if (r.key in out) out[r.key as SettingKey] = r.value;
  }
  return out;
}

export async function setSetting(key: SettingKey, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
