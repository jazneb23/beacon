import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveHealthBoard } from "./LiveHealthBoard";

vi.mock("../../lib/api", () => ({
  fetchAccounts: vi.fn(),
  fetchScores: vi.fn(),
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

import { fetchAccounts, fetchScores } from "../../lib/api";

const troubledScore = {
  accountId: "acct-northwind",
  score: 35,
  trend: "down" as const,
  drivers: [{ label: "Support volume", weight: 0.4, direction: "negative" as const }],
  updatedAt: "2026-06-20T12:00:00Z",
};

const troubledAccount = {
  id: "acct-northwind",
  name: "Northwind Analytics",
  plan: "enterprise" as const,
  latestScore: troubledScore,
};

beforeEach(() => {
  vi.mocked(fetchAccounts).mockResolvedValue([troubledAccount]);
  vi.mocked(fetchScores).mockResolvedValue([troubledScore]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("LiveHealthBoard (focus worklist)", () => {
  it("lists troubled accounts with a recommended action", async () => {
    render(<LiveHealthBoard />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Northwind Analytics" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("1 account need attention right now")).toBeInTheDocument();
    expect(screen.getByText("Draft outreach")).toBeInTheDocument();
    expect(fetchAccounts).toHaveBeenCalled();
    expect(fetchScores).toHaveBeenCalled();
  });

  it("shows an all-clear state when every account is healthy", async () => {
    vi.mocked(fetchAccounts).mockResolvedValue([
      { ...troubledAccount, latestScore: { ...troubledScore, score: 82, trend: "up" } },
    ]);
    vi.mocked(fetchScores).mockResolvedValue([{ ...troubledScore, score: 82, trend: "up" }]);

    render(<LiveHealthBoard />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "All clear" })).toBeInTheDocument();
    });
  });

  it("shows an error state when fetching fails", async () => {
    vi.mocked(fetchAccounts).mockRejectedValue(new Error("Network down"));

    render(<LiveHealthBoard />);

    await waitFor(() => {
      expect(screen.getByText("Network down")).toBeInTheDocument();
    });
  });
});
