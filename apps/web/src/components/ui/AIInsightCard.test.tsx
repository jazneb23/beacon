import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AIInsightCard } from "./AIInsightCard";

afterEach(() => {
  cleanup();
});

describe("AIInsightCard", () => {
  it("renders insight actions without an obvious intelligence label", () => {
    render(
      <AIInsightCard
        accountId="acct-northwind"
        onSummarize={vi.fn().mockResolvedValue("Summary text")}
        onDraftOutreach={vi.fn().mockResolvedValue("Outreach draft")}
      />,
    );

    expect(screen.getByRole("heading", { name: "Insights" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Summarize" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Draft outreach" })).toBeInTheDocument();
    expect(screen.queryByText(/ai/i)).not.toBeInTheDocument();
  });

  it("shows a spinner while summarizing and renders the returned text", async () => {
    let resolveSummary: (value: string) => void = () => undefined;
    const onSummarize = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveSummary = resolve;
        }),
    );

    render(
      <AIInsightCard
        accountId="acct-northwind"
        onSummarize={onSummarize}
        onDraftOutreach={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Summarize" }));

    expect(onSummarize).toHaveBeenCalledWith("acct-northwind");
    expect(screen.getByRole("button", { name: "Summarize" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("button", { name: "Draft outreach" })).toBeDisabled();

    resolveSummary("Usage is steady; billing risk is the main concern.");

    await waitFor(() => {
      expect(
        screen.getByText("Usage is steady; billing risk is the main concern."),
      ).toBeInTheDocument();
    });
  });

  it("drafts outreach and replaces the highlight content", async () => {
    render(
      <AIInsightCard
        accountId="acct-northwind"
        onSummarize={vi.fn().mockResolvedValue("Existing summary")}
        onDraftOutreach={vi
          .fn()
          .mockResolvedValue("Hi team — wanted to check in on your recent billing questions.")}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Summarize" }));
    await screen.findByText("Existing summary");

    fireEvent.click(screen.getByRole("button", { name: "Draft outreach" }));

    expect(
      await screen.findByText(
        "Hi team — wanted to check in on your recent billing questions.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Existing summary")).not.toBeInTheDocument();
  });

  it("shows an error message when an action fails", async () => {
    render(
      <AIInsightCard
        accountId="acct-northwind"
        onSummarize={vi.fn().mockRejectedValue(new Error("network"))}
        onDraftOutreach={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Summarize" }));

    expect(
      await screen.findByText("Something went wrong. Try again in a moment."),
    ).toBeInTheDocument();
  });
});
