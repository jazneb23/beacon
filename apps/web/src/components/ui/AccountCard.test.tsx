import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountCard } from "./AccountCard";

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

afterEach(() => {
  cleanup();
});

const account = {
  id: "acct-northwind",
  name: "Northwind Analytics",
  plan: "enterprise" as const,
};

const score = {
  accountId: "acct-northwind",
  score: 72,
  trend: "up" as const,
  drivers: [
    { label: "Product usage", weight: 0.35, direction: "positive" as const },
    { label: "Support volume", weight: 0.15, direction: "negative" as const },
    { label: "Billing health", weight: 0.25, direction: "positive" as const },
  ],
  updatedAt: "2026-06-20T12:00:00Z",
};

describe("AccountCard", () => {
  it("renders account details and links to the account page", () => {
    render(
      <AccountCard
        account={account}
        score={score}
        scoreHistory={[60, 62, 65, 68, 70, 72]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Northwind Analytics" })).toBeInTheDocument();
    expect(screen.getByText("enterprise")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Support volume")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/accounts/acct-northwind",
    );
  });

  it("shows a flat sparkline when score history is omitted", () => {
    render(<AccountCard account={account} score={score} />);

    const sparkline = screen.getByTestId("score-sparkline").querySelector("path");
    expect(sparkline?.getAttribute("d")).toContain("8.72 L 18.80 8.72");
  });
});
