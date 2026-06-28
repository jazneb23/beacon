import { describe, expect, it } from "vitest";

import {
  buildSparklinePath,
  getTopNegativeDriver,
  takeSparklinePoints,
} from "./accountCardUtils";

describe("takeSparklinePoints", () => {
  it("returns six points using the most recent scores", () => {
    expect(takeSparklinePoints([10, 20, 30, 40, 50, 60, 70])).toEqual([
      20, 30, 40, 50, 60, 70,
    ]);
  });

  it("pads short histories from the earliest available score", () => {
    expect(takeSparklinePoints([55, 60])).toEqual([55, 55, 55, 55, 55, 60]);
  });
});

describe("getTopNegativeDriver", () => {
  it("returns the negative driver with the highest weight", () => {
    const driver = getTopNegativeDriver([
      { label: "Product usage", weight: 0.35, direction: "positive" },
      { label: "Support volume", weight: 0.15, direction: "negative" },
      { label: "Billing health", weight: 0.25, direction: "positive" },
    ]);

    expect(driver?.label).toBe("Support volume");
  });

  it("returns null when there are no negative drivers", () => {
    expect(
      getTopNegativeDriver([
        { label: "Product usage", weight: 0.35, direction: "positive" },
      ]),
    ).toBeNull();
  });
});

describe("buildSparklinePath", () => {
  it("creates a valid SVG path string", () => {
    const path = buildSparklinePath([0, 50, 100], 60, 24);
    expect(path.startsWith("M")).toBe(true);
    expect(path.split("L").length).toBe(3);
  });
});
