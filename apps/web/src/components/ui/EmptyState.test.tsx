import { cleanup, render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

afterEach(() => {
  cleanup();
});

describe("EmptyState", () => {
  it("renders the title, subtitle, and optional action", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No signals yet"
        subtitle="Signals will appear here"
        action={<button type="button">Connect data</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "No signals yet" })).toBeInTheDocument();
    expect(screen.getByText("Signals will appear here")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect data" })).toBeInTheDocument();
  });

  it("omits the subtitle when not provided", () => {
    render(<EmptyState icon={Inbox} title="Empty" />);
    expect(screen.getByRole("heading", { name: "Empty" })).toBeInTheDocument();
  });
});
