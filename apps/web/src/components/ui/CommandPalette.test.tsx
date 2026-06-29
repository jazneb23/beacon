import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CommandPalette } from "./CommandPalette";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../lib/api", () => ({
  fetchAccounts: vi.fn(),
}));

import { fetchAccounts } from "../../lib/api";

beforeEach(() => {
  push.mockClear();
  vi.mocked(fetchAccounts).mockResolvedValue([
    {
      id: "acct-northwind",
      name: "Northwind Analytics",
      plan: "enterprise",
      latestScore: null,
    },
  ]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CommandPalette", () => {
  it("shows grouped commands and account results when open", async () => {
    render(<CommandPalette onClose={vi.fn()} />);

    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Go to Health Board")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Northwind Analytics")).toBeInTheDocument();
    });
  });

  it("navigates and closes when a command is selected", async () => {
    const onClose = vi.fn();
    render(<CommandPalette onClose={onClose} />);

    fireEvent.click(screen.getByText("Go to Health Board"));
    expect(push).toHaveBeenCalledWith("/");
    expect(onClose).toHaveBeenCalled();
  });

  it("filters commands by the search query", async () => {
    render(<CommandPalette onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Command palette search"), {
      target: { value: "export" },
    });

    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.queryByText("Go to Health Board")).not.toBeInTheDocument();
  });
});
