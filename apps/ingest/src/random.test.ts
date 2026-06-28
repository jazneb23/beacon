import { describe, expect, it } from "vitest";
import { SeededRNG } from "./random.js";

describe("SeededRNG", () => {
  it("returns the same sequence for the same seed", () => {
    const a = new SeededRNG(42);
    const b = new SeededRNG(42);
    const sequenceA = Array.from({ length: 5 }, () => a.next());
    const sequenceB = Array.from({ length: 5 }, () => b.next());
    expect(sequenceA).toEqual(sequenceB);
  });

  it("returns different sequences for different seeds", () => {
    const a = new SeededRNG(42);
    const b = new SeededRNG(99);
    expect(a.next()).not.toBe(b.next());
  });
});
