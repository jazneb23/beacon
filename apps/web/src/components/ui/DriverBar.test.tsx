import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DriverBar } from "./DriverBar";

afterEach(() => {
  cleanup();
});

describe("DriverBar", () => {
  it("renders the label and a bar sized to weight", () => {
    render(
      <DriverBar label="Product usage" weight={0.35} direction="positive" />,
    );

    expect(screen.getByText("Product usage")).toBeInTheDocument();

    const fill = screen.getByRole("meter").firstElementChild;
    expect(fill).toHaveStyle({ width: "35%" });
  });

  it("colors positive drivers green and negative drivers red", () => {
    const { rerender } = render(
      <DriverBar label="Billing health" weight={0.25} direction="positive" />,
    );

    expect(screen.getByRole("meter").firstElementChild).toHaveClass(/fillPositive/);

    rerender(
      <DriverBar label="Support volume" weight={0.15} direction="negative" />,
    );

    expect(screen.getByRole("meter").firstElementChild).toHaveClass(/fillNegative/);
  });

  it("clamps weight into 0–1 for the bar width", () => {
    render(<DriverBar label="Overweight" weight={1.4} direction="positive" />);

    expect(screen.getByRole("meter").firstElementChild).toHaveStyle({
      width: "100%",
    });
  });

  it("exposes an accessible meter label", () => {
    render(
      <DriverBar label="Login activity" weight={0.2} direction="negative" />,
    );

    expect(
      screen.getByRole("meter", {
        name: "Login activity, negative driver, 20% weight",
      }),
    ).toBeInTheDocument();
  });
});
