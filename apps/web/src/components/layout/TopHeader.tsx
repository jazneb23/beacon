"use client";

import { Menu, PanelLeft, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

import { usePageTitle } from "../../contexts/PageTitleContext";
import { getPageTitle } from "./navConfig";
import styles from "./TopHeader.module.css";

const IS_MAC =
  typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");

type TopHeaderProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
  onOpenMobileNav: () => void;
};

/** Top bar: sidebar collapse toggle, page title, and global search trigger. */
export function TopHeader({
  collapsed,
  onToggleCollapse,
  onOpenSearch,
  onOpenMobileNav,
}: TopHeaderProps): ReactElement {
  const pathname = usePathname();
  const { title } = usePageTitle();
  const pageTitle = title ?? getPageTitle(pathname);
  const shortcutHint = IS_MAC ? "⌘K" : "Ctrl K";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.collapseButton}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          onClick={onToggleCollapse}
        >
          <PanelLeft size={20} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu size={20} aria-hidden />
        </button>
        <h1 className={styles.title}>{pageTitle}</h1>
      </div>

      <button type="button" className={styles.search} onClick={onOpenSearch}>
        <Search size={16} aria-hidden />
        <span className={styles.searchPlaceholder}>
          Search accounts, signals, playbooks...
        </span>
        <kbd className={styles.kbd}>{shortcutHint}</kbd>
      </button>
    </header>
  );
}
