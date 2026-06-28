import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScoreHistoryChart } from "./ScoreHistoryChart";

afterEach(() => {
  cleanup();
});

describe("ScoreHistoryChart", () => {
  it("renders a larger chart with the score path", () => {
    render(<ScoreHistoryChart scores={[55, 62, 68, 72]} />);

    const chart = screen.getByTestId("score-history-chart");
    expect(chart).toBeInTheDocument();
    expect(chart.querySelectorAll("line")).toHaveLength(3);
    expect(chart.querySelector("path[stroke-width='3']")).toBeInTheDocument();
  });
});
