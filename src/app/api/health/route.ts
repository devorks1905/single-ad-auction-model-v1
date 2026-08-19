import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
