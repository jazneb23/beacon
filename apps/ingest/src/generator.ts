import type { Account, SignalEvent } from "@beacon/shared";
import { SeededRNG } from "./random.js";

const SIGNAL_TYPES: SignalEvent["type"][] = ["usage", "login", "billing", "support"];

/** Tick when the Northwind incident begins (deterministic rehearsal moment). */
export const INCIDENT_START_TICK = 20;

/** Scripted Northwind decline — one event per tick over six ticks. */
export const NORTHWIND_INCIDENT: ReadonlyArray<{
  type: SignalEvent["type"];
  value: number;
}> = [
  { type: "usage", value: 72 },
  { type: "login", value: 65 },
  { type: "billing", value: 55 },
  { type: "support", value: 52 },
  { type: "usage", value: 38 },
  { type: "support", value: 88 },
];

const PLAN_BASELINE: Record<Account["plan"], number> = {
  enterprise: 82,
  pro: 68,
  free: 48,
};

type AccountProfile = {
  account: Account;
  baselines: Record<SignalEvent["type"], number>;
};

/** Find the Northwind account by name prefix. */
export function findNorthwindAccount(accounts: Account[]): Account | undefined {
  return accounts.find((account) => account.name.toLowerCase().includes("northwind"));
}

/** Build per-account baseline signal values from plan tier and RNG. */
function initProfile(account: Account, rng: SeededRNG): AccountProfile {
  const center = PLAN_BASELINE[account.plan] + rng.int(-8, 8);
  const baselines = Object.fromEntries(
    SIGNAL_TYPES.map((type) => {
      const offset = type === "support" ? rng.int(5, 25) : rng.int(-6, 6);
      return [type, clamp(center + offset, 0, 100)];
    }),
  ) as Record<SignalEvent["type"], number>;

  return { account, baselines };
}

/** Clamp a value to the 0–100 signal range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Produce the next signal event for the current tick. */
export function generateSignalEvent(
  tick: number,
  profiles: AccountProfile[],
  northwindId: string,
  rng: SeededRNG,
): SignalEvent {
  const incidentIndex = tick - INCIDENT_START_TICK;
  if (incidentIndex >= 0 && incidentIndex < NORTHWIND_INCIDENT.length) {
    const scripted = NORTHWIND_INCIDENT[incidentIndex];
    if (!scripted) {
      throw new Error("Missing scripted incident event");
    }
    return {
      accountId: northwindId,
      type: scripted.type,
      value: scripted.value,
      at: new Date().toISOString(),
    };
  }

  const profile = rng.pick(profiles);
  const type = rng.pick(SIGNAL_TYPES);
  const drift = rng.int(-4, 4);
  const value = clamp(profile.baselines[type] + drift, 0, 100);
  profile.baselines[type] = value;

  return {
    accountId: profile.account.id,
    type,
    value,
    at: new Date().toISOString(),
  };
}

/** Stateful generator that advances a tick counter each call. */
export class SignalGenerator {
  private tick = 0;
  private readonly profiles: AccountProfile[];
  private readonly northwindId: string;
  private readonly rng: SeededRNG;

  constructor(accounts: Account[], seed: number) {
    this.rng = new SeededRNG(seed);
    this.profiles = accounts.map((account) => initProfile(account, this.rng));

    const northwind = findNorthwindAccount(accounts);
    if (!northwind) {
      throw new Error('No account named "Northwind" found — run the API seed first');
    }
    this.northwindId = northwind.id;
  }

  /** Advance one tick and return the next signal event. */
  next(): SignalEvent {
    const event = generateSignalEvent(this.tick, this.profiles, this.northwindId, this.rng);
    this.tick += 1;
    return event;
  }
}
