import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveHealthBoard } from "./LiveHealthBoard";

vi.mock("../../lib/api", () => ({
  fetchAccounts: vi.fn(),
  fetchRecentSignals: vi.fn(),
  fetchScores: vi.fn(),
}));

vi.mock("./SignalsFeed", () => ({
  SignalsFeed: () => <aside aria-label="Signals Feed">Signals Feed</aside>,
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

import { fetchAccounts, fetchRecentSignals, fetchScores } from "../../lib/api";

const account = {
  id: "acct-northwind",
  name: "Northwind Analytics",
  plan: "enterprise" as const,
  latestScore: {
    accountId: "acct-northwind",
    score: 72,
    trend: "up" as const,
    drivers: [
      { label: "Support volume", weight: 0.15, direction: "negative" as const },
    ],
    updatedAt: "2026-06-20T12:00:00Z",
  },
};

const score = account.latestScore;

beforeEach(() => {
  vi.mocked(fetchAccounts).mockResolvedValue([account]);
  vi.mocked(fetchScores).mockResolvedValue([score]);
  vi.mocked(fetchRecentSignals).mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("LiveHealthBoard", () => {
  it("renders account cards after loading", async () => {
    render(<LiveHealthBoard />);

    expect(screen.getByText("Loading accounts…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Live Health Board" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Northwind Analytics" })).toBeInTheDocument();
    });

    expect(fetchAccounts).toHaveBeenCalled();
    expect(fetchScores).toHaveBeenCalled();
    expect(screen.getByLabelText("Signals Feed")).toBeInTheDocument();
  });

  it("shows an error state when fetching fails", async () => {
    vi.mocked(fetchAccounts).mockRejectedValue(new Error("Network down"));

    render(<LiveHealthBoard />);

    await waitFor(() => {
      expect(screen.getByText("Network down")).toBeInTheDocument();
    });
  });
});
