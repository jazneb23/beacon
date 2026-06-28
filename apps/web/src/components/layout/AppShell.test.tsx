import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "../theme/ThemeProvider";
import { AppShell } from "./AppShell";

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
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

function renderAppShell(content = "Page content") {
  return render(
    <ThemeProvider>
      <AppShell>{content}</AppShell>
    </ThemeProvider>,
  );
}

describe("AppShell", () => {
  it("renders the wordmark, theme toggle, and main content", () => {
    renderAppShell("Dashboard");

    expect(screen.getByRole("link", { name: "Beacon" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: /Switch to (light|dark) mode/ })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Dashboard");
  });
});
