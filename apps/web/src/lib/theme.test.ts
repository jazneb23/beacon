import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  persistTheme,
} from "./theme";

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("getStoredTheme", () => {
  it("returns dark when nothing is stored", () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns the stored theme when valid", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(getStoredTheme()).toBe("light");
  });

  it("falls back to dark for invalid stored values", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    expect(getStoredTheme()).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("sets data-theme on the document root", () => {
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

describe("persistTheme", () => {
  it("writes the theme to localStorage", () => {
    persistTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
