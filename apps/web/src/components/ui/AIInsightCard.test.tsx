import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AIInsightCard } from "./AIInsightCard";

afterEach(() => {
  cleanup();
});

describe("AIInsightCard", () => {
  it("renders the AI insight card with both actions", () => {
    render(
      <AIInsightCard
        content={null}
        loadingAction={null}
        error={null}
        onSummarize={vi.fn()}
        onDraftOutreach={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "AI Insight" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Summarize" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Draft outreach" })).toBeInTheDocument();
  });

  it("invokes the action handlers on click", () => {
    const onSummarize = vi.fn();
    const onDraftOutreach = vi.fn();
    render(
      <AIInsightCard
        content={null}
        loadingAction={null}
        error={null}
        onSummarize={onSummarize}
        onDraftOutreach={onDraftOutreach}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Summarize" }));
    fireEvent.click(screen.getByRole("button", { name: "Draft outreach" }));

    expect(onSummarize).toHaveBeenCalledTimes(1);
    expect(onDraftOutreach).toHaveBeenCalledTimes(1);
  });

  it("marks the active button busy and disables the other while loading", () => {
    render(
      <AIInsightCard
        content={null}
        loadingAction="summarize"
        error={null}
        onSummarize={vi.fn()}
        onDraftOutreach={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Summarize" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("button", { name: "Draft outreach" })).toBeDisabled();
  });

  it("renders returned content in the highlight box", () => {
    render(
      <AIInsightCard
        content="Usage is steady; billing risk is the main concern."
        loadingAction={null}
        error={null}
        onSummarize={vi.fn()}
        onDraftOutreach={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Usage is steady; billing risk is the main concern."),
    ).toBeInTheDocument();
  });

  it("shows an error message when provided", () => {
    render(
      <AIInsightCard
        content={null}
        loadingAction={null}
        error="Something went wrong. Try again in a moment."
        onSummarize={vi.fn()}
        onDraftOutreach={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Something went wrong. Try again in a moment."),
    ).toBeInTheDocument();
  });
});
