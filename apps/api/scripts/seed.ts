import "dotenv/config";
import { computeScore, type Account, type SignalEvent } from "@beacon/shared";
import { getPool } from "../src/db/pool.js";
import { insertHealthScore } from "../src/db/scores.js";

type DemoAccount = Account & {
  signals: SignalEvent[];
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "acct-northwind",
    name: "Northwind Analytics",
    plan: "enterprise",
    signals: [
      { accountId: "acct-northwind", type: "usage", value: 88, at: "2026-06-10T09:00:00Z" },
      { accountId: "acct-northwind", type: "login", value: 82, at: "2026-06-10T09:00:00Z" },
      { accountId: "acct-northwind", type: "billing", value: 95, at: "2026-06-10T09:00:00Z" },
      { accountId: "acct-northwind", type: "support", value: 12, at: "2026-06-10T09:00:00Z" },
      { accountId: "acct-northwind", type: "usage", value: 91, at: "2026-06-22T14:00:00Z" },
      { accountId: "acct-northwind", type: "login", value: 86, at: "2026-06-22T14:00:00Z" },
      { accountId: "acct-northwind", type: "billing", value: 97, at: "2026-06-22T14:00:00Z" },
      { accountId: "acct-northwind", type: "support", value: 8, at: "2026-06-22T14:00:00Z" },
    ],
  },
  {
    id: "acct-riverstone",
    name: "Riverstone Labs",
    plan: "pro",
    signals: [
      { accountId: "acct-riverstone", type: "usage", value: 72, at: "2026-06-08T11:00:00Z" },
      { accountId: "acct-riverstone", type: "login", value: 68, at: "2026-06-08T11:00:00Z" },
      { accountId: "acct-riverstone", type: "billing", value: 80, at: "2026-06-08T11:00:00Z" },
      { accountId: "acct-riverstone", type: "support", value: 25, at: "2026-06-08T11:00:00Z" },
      { accountId: "acct-riverstone", type: "usage", value: 45, at: "2026-06-20T16:00:00Z" },
      { accountId: "acct-riverstone", type: "login", value: 40, at: "2026-06-20T16:00:00Z" },
      { accountId: "acct-riverstone", type: "billing", value: 55, at: "2026-06-20T16:00:00Z" },
      { accountId: "acct-riverstone", type: "support", value: 70, at: "2026-06-20T16:00:00Z" },
    ],
  },
  {
    id: "acct-brightpath",
    name: "Brightpath Health",
    plan: "enterprise",
    signals: [
      { accountId: "acct-brightpath", type: "usage", value: 25, at: "2026-06-05T08:00:00Z" },
      { accountId: "acct-brightpath", type: "login", value: 20, at: "2026-06-05T08:00:00Z" },
      { accountId: "acct-brightpath", type: "billing", value: 35, at: "2026-06-05T08:00:00Z" },
      { accountId: "acct-brightpath", type: "support", value: 80, at: "2026-06-05T08:00:00Z" },
      { accountId: "acct-brightpath", type: "usage", value: 78, at: "2026-06-18T10:00:00Z" },
      { accountId: "acct-brightpath", type: "login", value: 74, at: "2026-06-18T10:00:00Z" },
      { accountId: "acct-brightpath", type: "billing", value: 85, at: "2026-06-18T10:00:00Z" },
      { accountId: "acct-brightpath", type: "support", value: 15, at: "2026-06-18T10:00:00Z" },
    ],
  },
  {
    id: "acct-pixelcraft",
    name: "Pixelcraft Studio",
    plan: "free",
    signals: [
      { accountId: "acct-pixelcraft", type: "usage", value: 55, at: "2026-06-12T13:00:00Z" },
      { accountId: "acct-pixelcraft", type: "login", value: 50, at: "2026-06-12T13:00:00Z" },
      { accountId: "acct-pixelcraft", type: "billing", value: 60, at: "2026-06-12T13:00:00Z" },
      { accountId: "acct-pixelcraft", type: "support", value: 30, at: "2026-06-12T13:00:00Z" },
      { accountId: "acct-pixelcraft", type: "usage", value: 58, at: "2026-06-24T09:30:00Z" },
      { accountId: "acct-pixelcraft", type: "login", value: 52, at: "2026-06-24T09:30:00Z" },
      { accountId: "acct-pixelcraft", type: "billing", value: 62, at: "2026-06-24T09:30:00Z" },
      { accountId: "acct-pixelcraft", type: "support", value: 28, at: "2026-06-24T09:30:00Z" },
    ],
  },
  {
    id: "acct-helixbio",
    name: "HelixBio Research",
    plan: "enterprise",
    signals: [
      { accountId: "acct-helixbio", type: "usage", value: 92, at: "2026-06-09T07:00:00Z" },
      { accountId: "acct-helixbio", type: "login", value: 90, at: "2026-06-09T07:00:00Z" },
      { accountId: "acct-helixbio", type: "billing", value: 98, at: "2026-06-09T07:00:00Z" },
      { accountId: "acct-helixbio", type: "support", value: 5, at: "2026-06-09T07:00:00Z" },
      { accountId: "acct-helixbio", type: "usage", value: 94, at: "2026-06-21T15:00:00Z" },
      { accountId: "acct-helixbio", type: "login", value: 91, at: "2026-06-21T15:00:00Z" },
      { accountId: "acct-helixbio", type: "billing", value: 99, at: "2026-06-21T15:00:00Z" },
      { accountId: "acct-helixbio", type: "support", value: 4, at: "2026-06-21T15:00:00Z" },
    ],
  },
  {
    id: "acct-summitpay",
    name: "SummitPay",
    plan: "pro",
    signals: [
      { accountId: "acct-summitpay", type: "usage", value: 65, at: "2026-06-07T12:00:00Z" },
      { accountId: "acct-summitpay", type: "login", value: 60, at: "2026-06-07T12:00:00Z" },
      { accountId: "acct-summitpay", type: "billing", value: 45, at: "2026-06-07T12:00:00Z" },
      { accountId: "acct-summitpay", type: "support", value: 55, at: "2026-06-07T12:00:00Z" },
      { accountId: "acct-summitpay", type: "usage", value: 35, at: "2026-06-19T17:00:00Z" },
      { accountId: "acct-summitpay", type: "login", value: 30, at: "2026-06-19T17:00:00Z" },
      { accountId: "acct-summitpay", type: "billing", value: 25, at: "2026-06-19T17:00:00Z" },
      { accountId: "acct-summitpay", type: "support", value: 85, at: "2026-06-19T17:00:00Z" },
    ],
  },
  {
    id: "acct-cloudnine",
    name: "CloudNine Logistics",
    plan: "pro",
    signals: [
      { accountId: "acct-cloudnine", type: "usage", value: 78, at: "2026-06-11T10:00:00Z" },
      { accountId: "acct-cloudnine", type: "login", value: 75, at: "2026-06-11T10:00:00Z" },
      { accountId: "acct-cloudnine", type: "billing", value: 82, at: "2026-06-11T10:00:00Z" },
      { accountId: "acct-cloudnine", type: "support", value: 18, at: "2026-06-11T10:00:00Z" },
      { accountId: "acct-cloudnine", type: "usage", value: 80, at: "2026-06-23T11:00:00Z" },
      { accountId: "acct-cloudnine", type: "login", value: 77, at: "2026-06-23T11:00:00Z" },
      { accountId: "acct-cloudnine", type: "billing", value: 84, at: "2026-06-23T11:00:00Z" },
      { accountId: "acct-cloudnine", type: "support", value: 16, at: "2026-06-23T11:00:00Z" },
    ],
  },
  {
    id: "acct-greenleaf",
    name: "Greenleaf Foods",
    plan: "free",
    signals: [
      { accountId: "acct-greenleaf", type: "usage", value: 40, at: "2026-06-06T14:00:00Z" },
      { accountId: "acct-greenleaf", type: "login", value: 35, at: "2026-06-06T14:00:00Z" },
      { accountId: "acct-greenleaf", type: "billing", value: 50, at: "2026-06-06T14:00:00Z" },
      { accountId: "acct-greenleaf", type: "support", value: 45, at: "2026-06-06T14:00:00Z" },
      { accountId: "acct-greenleaf", type: "usage", value: 62, at: "2026-06-17T08:00:00Z" },
      { accountId: "acct-greenleaf", type: "login", value: 58, at: "2026-06-17T08:00:00Z" },
      { accountId: "acct-greenleaf", type: "billing", value: 68, at: "2026-06-17T08:00:00Z" },
      { accountId: "acct-greenleaf", type: "support", value: 22, at: "2026-06-17T08:00:00Z" },
    ],
  },
  {
    id: "acct-vantage",
    name: "Vantage Security",
    plan: "enterprise",
    signals: [
      { accountId: "acct-vantage", type: "usage", value: 85, at: "2026-06-13T09:00:00Z" },
      { accountId: "acct-vantage", type: "login", value: 88, at: "2026-06-13T09:00:00Z" },
      { accountId: "acct-vantage", type: "billing", value: 90, at: "2026-06-13T09:00:00Z" },
      { accountId: "acct-vantage", type: "support", value: 10, at: "2026-06-13T09:00:00Z" },
      { accountId: "acct-vantage", type: "usage", value: 50, at: "2026-06-25T13:00:00Z" },
      { accountId: "acct-vantage", type: "login", value: 48, at: "2026-06-25T13:00:00Z" },
      { accountId: "acct-vantage", type: "billing", value: 55, at: "2026-06-25T13:00:00Z" },
      { accountId: "acct-vantage", type: "support", value: 75, at: "2026-06-25T13:00:00Z" },
    ],
  },
  {
    id: "acct-orbit",
    name: "Orbit Media",
    plan: "pro",
    signals: [
      { accountId: "acct-orbit", type: "usage", value: 30, at: "2026-06-04T16:00:00Z" },
      { accountId: "acct-orbit", type: "login", value: 28, at: "2026-06-04T16:00:00Z" },
      { accountId: "acct-orbit", type: "billing", value: 32, at: "2026-06-04T16:00:00Z" },
      { accountId: "acct-orbit", type: "support", value: 60, at: "2026-06-04T16:00:00Z" },
      { accountId: "acct-orbit", type: "usage", value: 85, at: "2026-06-16T12:00:00Z" },
      { accountId: "acct-orbit", type: "login", value: 82, at: "2026-06-16T12:00:00Z" },
      { accountId: "acct-orbit", type: "billing", value: 88, at: "2026-06-16T12:00:00Z" },
      { accountId: "acct-orbit", type: "support", value: 12, at: "2026-06-16T12:00:00Z" },
    ],
  },
  {
    id: "acct-lattice",
    name: "Lattice HR",
    plan: "pro",
    signals: [
      { accountId: "acct-lattice", type: "usage", value: 70, at: "2026-06-14T08:30:00Z" },
      { accountId: "acct-lattice", type: "login", value: 68, at: "2026-06-14T08:30:00Z" },
      { accountId: "acct-lattice", type: "billing", value: 75, at: "2026-06-14T08:30:00Z" },
      { accountId: "acct-lattice", type: "support", value: 20, at: "2026-06-14T08:30:00Z" },
      { accountId: "acct-lattice", type: "usage", value: 72, at: "2026-06-26T10:00:00Z" },
      { accountId: "acct-lattice", type: "login", value: 69, at: "2026-06-26T10:00:00Z" },
      { accountId: "acct-lattice", type: "billing", value: 76, at: "2026-06-26T10:00:00Z" },
      { accountId: "acct-lattice", type: "support", value: 19, at: "2026-06-26T10:00:00Z" },
    ],
  },
  {
    id: "acct-freshstart",
    name: "FreshStart Coaching",
    plan: "free",
    signals: [
      { accountId: "acct-freshstart", type: "usage", value: 15, at: "2026-06-03T09:00:00Z" },
      { accountId: "acct-freshstart", type: "login", value: 12, at: "2026-06-03T09:00:00Z" },
      { accountId: "acct-freshstart", type: "billing", value: 20, at: "2026-06-03T09:00:00Z" },
      { accountId: "acct-freshstart", type: "support", value: 90, at: "2026-06-03T09:00:00Z" },
      { accountId: "acct-freshstart", type: "usage", value: 18, at: "2026-06-15T11:00:00Z" },
      { accountId: "acct-freshstart", type: "login", value: 10, at: "2026-06-15T11:00:00Z" },
      { accountId: "acct-freshstart", type: "billing", value: 15, at: "2026-06-15T11:00:00Z" },
      { accountId: "acct-freshstart", type: "support", value: 95, at: "2026-06-15T11:00:00Z" },
    ],
  },
];

/** Clear demo tables and insert accounts, signals, and computed scores. */
async function seed(): Promise<void> {
  const pool = getPool();

  await pool.query("TRUNCATE health_scores, signal_events, accounts RESTART IDENTITY CASCADE");

  for (const demo of DEMO_ACCOUNTS) {
    await pool.query(
      "INSERT INTO accounts (id, name, plan) VALUES ($1, $2, $3)",
      [demo.id, demo.name, demo.plan],
    );

    for (const signal of demo.signals) {
      await pool.query(
        `INSERT INTO signal_events (account_id, type, value, at)
         VALUES ($1, $2, $3, $4)`,
        [signal.accountId, signal.type, signal.value, signal.at],
      );
    }

    const score = computeScore(demo.signals);
    await insertHealthScore(pool, score);
  }

  await pool.end();
  console.log(`Seeded ${DEMO_ACCOUNTS.length} demo accounts.`);
}

seed().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
