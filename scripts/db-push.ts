/**
 * Vercel/Render build sırasında çalışır — tabloları oluşturur/günceller.
 */
import { Pool } from "pg";
import dns from "dns";

// IPv4 çözümlemesini zorla
dns.setDefaultResultOrder("ipv4first");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL tanımlı değil!");
    process.exit(1);
  }

  console.log("🔗 Veritabanına bağlanılıyor...");
  console.log("📍 URL:", url.replace(/:[^:@]+@/, ":****@")); // Şifreyi gizle

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log("✅ Bağlantı başarılı!");
    client.release();
  } catch (e: any) {
    console.error("❌ Bağlantı hatası:", e.message);
    console.error("📍 Hata kodu:", e.code);
    process.exit(1);
  }

  console.log("📦 Tablolar kontrol ediliyor/oluşturuluyor...");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        slot_date DATE NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'open',
        min_bid NUMERIC(12,2) NOT NULL DEFAULT '50',
        closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
        winning_bid_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("  ✓ auctions tablosu hazır");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INTEGER NOT NULL,
        bidder TEXT NOT NULL,
        email TEXT NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        ad_headline TEXT NOT NULL,
        ad_body TEXT NOT NULL DEFAULT '',
        ad_url TEXT NOT NULL,
        ad_emoji TEXT NOT NULL DEFAULT '🚀',
        is_winner BOOLEAN NOT NULL DEFAULT false,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        payment_link TEXT,
        rejected BOOLEAN NOT NULL DEFAULT false,
        reject_reason TEXT,
        ip TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("  ✓ bids tablosu hazır");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocklist (
        id SERIAL PRIMARY KEY,
        value TEXT NOT NULL UNIQUE,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("  ✓ blocklist tablosu hazır");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL DEFAULT 'site',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("  ✓ subscribers tablosu hazır");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log("  ✓ settings tablosu hazır");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        kind TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("  ✓ events tablosu hazır");

    // Indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS auctions_status_idx ON auctions(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS auctions_slot_date_idx ON auctions(slot_date);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS bids_auction_id_idx ON bids(auction_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS bids_email_idx ON bids(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS bids_is_winner_idx ON bids(is_winner);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS events_created_at_idx ON events(created_at);`);
    console.log("  ✓ Index'ler hazır");

    console.log("✅ Tüm tablolar başarıyla oluşturuldu!");
  } catch (e: any) {
    console.error("❌ Tablo oluşturma hatası:", e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Beklenmeyen hata:", e);
  process.exit(1);
});
