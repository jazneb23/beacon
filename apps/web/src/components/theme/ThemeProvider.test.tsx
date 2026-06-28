import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "../../lib/theme";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

function renderThemeUi(initialTheme?: "light" | "dark") {
  if (initialTheme) {
    localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
  }

  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeProvider", () => {
  it("defaults to dark mode when no preference is stored", async () => {
    renderThemeUi();

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("reads the stored theme on mount", async () => {
    renderThemeUi("light");

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });
});

describe("ThemeToggle", () => {
  it("toggles theme and persists the preference", async () => {
    renderThemeUi("dark");

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
