import { describe, expect, it } from "vitest";

import {
  clampScore,
  getHealthScoreBand,
  getHealthScoreColor,
} from "./healthScoreBand";

describe("getHealthScoreBand", () => {
  it("returns green for scores 70 and above", () => {
    expect(getHealthScoreBand(70)).toBe("green");
    expect(getHealthScoreBand(100)).toBe("green");
  });

  it("returns amber for scores 40 through 69", () => {
    expect(getHealthScoreBand(40)).toBe("amber");
    expect(getHealthScoreBand(69)).toBe("amber");
  });

  it("returns red for scores below 40", () => {
    expect(getHealthScoreBand(39)).toBe("red");
    expect(getHealthScoreBand(0)).toBe("red");
  });
});

describe("getHealthScoreColor", () => {
  it("maps each band to its design token", () => {
    expect(getHealthScoreColor("green")).toBe("var(--color-health-green)");
    expect(getHealthScoreColor("amber")).toBe("var(--color-health-amber)");
    expect(getHealthScoreColor("red")).toBe("var(--color-health-red)");
  });
});

describe("clampScore", () => {
  it("rounds and clamps values to 0–100", () => {
    expect(clampScore(72.4)).toBe(72);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(140)).toBe(100);
  });
});
