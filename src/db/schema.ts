import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  date,
  boolean,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const auctions = pgTable(
  "auctions",
  {
    id: serial("id").primaryKey(),
    slotDate: date("slot_date").notNull().unique(),
    status: text("status").notNull().default("open"), // open | settled
    minBid: numeric("min_bid", { precision: 12, scale: 2 }).notNull().default("50"),
    closesAt: timestamp("closes_at", { withTimezone: true }).notNull(),
    winningBidId: integer("winning_bid_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("auctions_status_idx").on(table.status),
    index("auctions_slot_date_idx").on(table.slotDate),
  ]
);

export const bids = pgTable(
  "bids",
  {
    id: serial("id").primaryKey(),
    auctionId: integer("auction_id").notNull(),
    bidder: text("bidder").notNull(),
    email: text("email").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    adHeadline: text("ad_headline").notNull(),
    adBody: text("ad_body").notNull().default(""),
    adUrl: text("ad_url").notNull(),
    adEmoji: text("ad_emoji").notNull().default("🚀"),
    isWinner: boolean("is_winner").notNull().default(false),
    // pending | paid | unpaid | rejected
    paymentStatus: text("payment_status").notNull().default("pending"),
    paymentLink: text("payment_link"),
    rejected: boolean("rejected").notNull().default(false),
    rejectReason: text("reject_reason"),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("bids_auction_id_idx").on(table.auctionId),
    index("bids_email_idx").on(table.email),
    index("bids_is_winner_idx").on(table.isWinner),
  ]
);

export const blocklist = pgTable("blocklist", {
  id: serial("id").primaryKey(),
  value: text("value").notNull().unique(), // email veya domain
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("site"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("events_created_at_idx").on(table.createdAt)]
);

export type Auction = typeof auctions.$inferSelect;
export type Bid = typeof bids.$inferSelect;
