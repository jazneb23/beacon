import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PageTitleProvider } from "../../contexts/PageTitleContext";
import { AccountDetailView } from "./AccountDetailView";

vi.mock("../../lib/api", () => ({
  fetchAccountDetail: vi.fn(),
  fetchRecentSignals: vi.fn(),
}));

vi.mock("../../lib/ai", () => ({
  fetchAccountSummary: vi.fn(),
  fetchNextAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/accounts/acct-northwind",
  useRouter: () => ({ push: vi.fn() }),
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

import { fetchAccountDetail, fetchRecentSignals } from "../../lib/api";

const detail = {
  account: {
    id: "acct-northwind",
    name: "Northwind Analytics",
    plan: "enterprise" as const,
  },
  scoreHistory: [
    {
      accountId: "acct-northwind",
      score: 72,
      trend: "up" as const,
      drivers: [
        { label: "Product usage", weight: 0.35, direction: "positive" as const },
        { label: "Support volume", weight: 0.15, direction: "negative" as const },
      ],
      updatedAt: "2026-06-28T12:00:00.000Z",
    },
    {
      accountId: "acct-northwind",
      score: 65,
      trend: "flat" as const,
      drivers: [],
      updatedAt: "2026-06-26T12:00:00.000Z",
    },
  ],
  drivers: [
    { label: "Product usage", weight: 0.35, direction: "positive" as const },
    { label: "Support volume", weight: 0.15, direction: "negative" as const },
  ],
};

beforeEach(() => {
  vi.mocked(fetchAccountDetail).mockResolvedValue(detail);
  vi.mocked(fetchRecentSignals).mockResolvedValue([]);
});

function renderDetail(accountId: string) {
  return render(
    <PageTitleProvider>
      <AccountDetailView accountId={accountId} />
    </PageTitleProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AccountDetailView", () => {
  it("loads account detail and renders chart plus driver bars", async () => {
    renderDetail("acct-northwind");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Northwind Analytics" })).toBeInTheDocument();
    });

    expect(fetchAccountDetail).toHaveBeenCalledWith("acct-northwind");
    expect(screen.getByRole("link", { name: "Health Board" })).toHaveAttribute("href", "/");
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByTestId("score-history-chart")).toBeInTheDocument();
    expect(screen.getByText("Product usage")).toBeInTheDocument();
    expect(screen.getByText("Support volume")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI Insight" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Summarize" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Draft outreach" })).toBeInTheDocument();
  });

  it("shows an error state when the account cannot be loaded", async () => {
    vi.mocked(fetchAccountDetail).mockRejectedValue(new Error("Account not found"));

    renderDetail("missing");

    await waitFor(() => {
      expect(screen.getByText("Account not found")).toBeInTheDocument();
    });
  });
});
