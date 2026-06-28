/** Supported color themes for the Beacon web app. */
export type Theme = "light" | "dark";

/** localStorage key for persisting the user's theme preference. */
export const THEME_STORAGE_KEY = "beacon-theme";

/** Beacon defaults to dark mode when no preference is stored. */
export const DEFAULT_THEME: Theme = "dark";

/** Read the stored theme, falling back to the dark-first default. */
export function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
}

/** Apply the theme by setting `data-theme` on the document root. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Persist the theme preference to localStorage. */
export function persistTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/** Blocking script to apply theme before first paint and avoid a flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.setAttribute("data-theme",t==="light"||t==="dark"?t:"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;
