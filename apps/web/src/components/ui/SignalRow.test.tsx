import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SignalRow } from "./SignalRow";
import * as signalRowUtils from "./signalRowUtils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const baseEvent = {
  accountId: "acct-northwind",
  type: "usage" as const,
  value: 38,
  at: "2026-06-28T12:00:28.000Z",
};

describe("SignalRow", () => {
  it("renders account name, description, and relative time", () => {
    vi.spyOn(signalRowUtils, "formatRelativeTime").mockReturnValue("2s ago");

    render(
      <SignalRow {...baseEvent} accountName="Northwind Analytics" />,
    );

    expect(screen.getByText("Northwind Analytics")).toBeInTheDocument();
    expect(screen.getByText("Usage drop")).toBeInTheDocument();
    expect(screen.getByText("2s ago")).toBeInTheDocument();
    expect(screen.getByLabelText("Northwind Analytics: Usage drop")).toBeInTheDocument();
  });

  it("maps signal types to severity icon styles", () => {
    const { container, rerender } = render(
      <SignalRow {...baseEvent} accountName="Northwind Analytics" isNew={false} />,
    );

    expect(container.querySelector('[class*="severityAmber"]')).toBeInTheDocument();

    rerender(
      <SignalRow
        {...baseEvent}
        type="support"
        accountName="Northwind Analytics"
        isNew={false}
      />,
    );
    expect(container.querySelector('[class*="severityRed"]')).toBeInTheDocument();

    rerender(
      <SignalRow
        {...baseEvent}
        type="login"
        accountName="Northwind Analytics"
        isNew={false}
      />,
    );
    expect(container.querySelector('[class*="severityMuted"]')).toBeInTheDocument();
  });

  it("applies the enter animation class for new rows", () => {
    const { container, rerender } = render(
      <SignalRow {...baseEvent} accountName="Northwind Analytics" />,
    );

    expect(container.firstChild).toHaveClass(/rowEnter/);

    rerender(
      <SignalRow
        {...baseEvent}
        accountName="Northwind Analytics"
        isNew={false}
      />,
    );
    expect(container.firstChild).not.toHaveClass(/rowEnter/);
  });
});
