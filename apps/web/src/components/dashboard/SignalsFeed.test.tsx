import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignalsFeed } from "./SignalsFeed";

vi.mock("../../lib/api", () => ({
  fetchRecentSignals: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { fetchRecentSignals } from "../../lib/api";

const feedItem = {
  id: 1,
  accountId: "acct-northwind",
  accountName: "Northwind Analytics",
  type: "usage" as const,
  value: 38,
  at: "2026-06-28T12:00:28.000Z",
};

beforeEach(() => {
  vi.mocked(fetchRecentSignals).mockResolvedValue([feedItem]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("SignalsFeed", () => {
  it("renders recent signal rows after loading", async () => {
    render(<SignalsFeed />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Live Signals" })).toBeInTheDocument();
      expect(screen.getByText("Northwind Analytics")).toBeInTheDocument();
      expect(screen.getByText("Usage drop")).toBeInTheDocument();
    });

    expect(fetchRecentSignals).toHaveBeenCalledWith(50);
  });

  it("shows an error state when fetching fails", async () => {
    vi.mocked(fetchRecentSignals).mockRejectedValue(new Error("Feed unavailable"));

    render(<SignalsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Feed unavailable")).toBeInTheDocument();
    });
  });
});
