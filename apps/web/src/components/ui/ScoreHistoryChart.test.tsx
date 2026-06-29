import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScoreHistoryChart } from "./ScoreHistoryChart";

afterEach(() => {
  cleanup();
});

describe("ScoreHistoryChart", () => {
  it("renders the chart container with a responsive wrapper", () => {
    render(<ScoreHistoryChart scores={[55, 62, 68, 72]} />);

    const chart = screen.getByTestId("score-history-chart");
    expect(chart).toBeInTheDocument();
    expect(chart.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });
});
