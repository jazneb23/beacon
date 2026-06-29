import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PageTitleProvider } from "../../contexts/PageTitleContext";
import { ThemeProvider } from "../theme/ThemeProvider";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
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

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

function renderAppShell(content = "Page content") {
  return render(
    <ThemeProvider>
      <PageTitleProvider>
        <AppShell>{content}</AppShell>
      </PageTitleProvider>
    </ThemeProvider>,
  );
}

describe("AppShell", () => {
  it("renders sidebar navigation, theme toggle, and main content", () => {
    renderAppShell("Dashboard");

    expect(screen.getByRole("link", { name: "Health Board" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Accounts" })).toHaveAttribute("href", "/accounts");
    expect(
      screen.getByRole("button", { name: /Switch to (light|dark) mode/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Dashboard");
  });

  it("shows the page title derived from the route", () => {
    renderAppShell();
    expect(screen.getByRole("heading", { level: 1, name: "Health Board" })).toBeInTheDocument();
  });
});
