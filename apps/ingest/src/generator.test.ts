import type { Account } from "@beacon/shared";
import { describe, expect, it } from "vitest";
import {
  findNorthwindAccount,
  generateSignalEvent,
  INCIDENT_START_TICK,
  NORTHWIND_INCIDENT,
  SignalGenerator,
} from "./generator.js";
import { SeededRNG } from "./random.js";

const SAMPLE_ACCOUNTS: Account[] = [
  { id: "acct-northwind", name: "Northwind Analytics", plan: "enterprise" },
  { id: "acct-riverstone", name: "Riverstone Labs", plan: "pro" },
  { id: "acct-pixelcraft", name: "Pixelcraft Studio", plan: "free" },
];

describe("findNorthwindAccount", () => {
  it("finds the Northwind account by name", () => {
    const account = findNorthwindAccount(SAMPLE_ACCOUNTS);
    expect(account?.id).toBe("acct-northwind");
  });
});

describe("generateSignalEvent", () => {
  it("runs the scripted Northwind incident at a fixed tick", () => {
    const rng = new SeededRNG(42);
    const profiles = SAMPLE_ACCOUNTS.map((account) => ({
      account,
      baselines: { usage: 80, login: 80, billing: 80, support: 15 },
    }));

    const event = generateSignalEvent(INCIDENT_START_TICK, profiles, "acct-northwind", rng);
    expect(event.accountId).toBe("acct-northwind");
    expect(event.type).toBe(NORTHWIND_INCIDENT[0]?.type);
    expect(event.value).toBe(NORTHWIND_INCIDENT[0]?.value);
  });

  it("declines Northwind through the full incident sequence", () => {
    const rng = new SeededRNG(42);
    const profiles = SAMPLE_ACCOUNTS.map((account) => ({
      account,
      baselines: { usage: 80, login: 80, billing: 80, support: 15 },
    }));

    const events = NORTHWIND_INCIDENT.map((scripted, index) => {
      const event = generateSignalEvent(
        INCIDENT_START_TICK + index,
        profiles,
        "acct-northwind",
        rng,
      );
      expect(event.accountId).toBe("acct-northwind");
      expect(event.type).toBe(scripted.type);
      expect(event.value).toBe(scripted.value);
      return event;
    });

    const usageEvents = events.filter((event) => event.type === "usage");
    expect(usageEvents[1]?.value).toBeLessThan(usageEvents[0]?.value ?? 100);
  });
});

describe("SignalGenerator", () => {
  it("produces the same sequence for the same seed", () => {
    const first = new SignalGenerator(SAMPLE_ACCOUNTS, 42);
    const second = new SignalGenerator(SAMPLE_ACCOUNTS, 42);

    for (let i = 0; i < 30; i++) {
      const a = first.next();
      const b = second.next();
      expect(a.accountId).toBe(b.accountId);
      expect(a.type).toBe(b.type);
      expect(a.value).toBe(b.value);
    }
  });
});
