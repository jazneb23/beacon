import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HealthScoreBadge } from "./HealthScoreBadge";

describe("HealthScoreBadge", () => {
  it("renders the score and trend for the default size", () => {
    render(<HealthScoreBadge score={72} trend="up" />);

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Health score 72, trending up"),
    ).toBeInTheDocument();
  });

  it("applies the health color token for the score band", () => {
    render(<HealthScoreBadge score={35} trend="down" />);

    const badge = screen.getByLabelText("Health score 35, trending down");
    expect(badge).toHaveStyle({ color: "var(--color-health-red)" });
  });

  it("supports compact, default, and featured sizes", () => {
    const { rerender } = render(
      <HealthScoreBadge score={55} trend="flat" size="sm" />,
    );

    expect(screen.getByText("55")).toHaveStyle({
      fontSize: "var(--text-base)",
    });

    rerender(<HealthScoreBadge score={55} trend="flat" size="md" />);
    expect(screen.getByText("55")).toHaveStyle({
      fontSize: "var(--text-2xl)",
    });

    rerender(<HealthScoreBadge score={55} trend="flat" size="lg" />);
    expect(screen.getByText("55")).toHaveStyle({
      fontSize: "var(--text-score-display-size)",
    });
  });
});
