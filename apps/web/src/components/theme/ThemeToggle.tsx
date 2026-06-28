"use client";

import { Moon, Sun } from "lucide-react";
import type { ReactElement } from "react";

import { useTheme } from "./ThemeProvider";
import styles from "./ThemeToggle.module.css";

/** Button that toggles between light and dark mode with Moon/Sun icons. */
export function ThemeToggle(): ReactElement {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
