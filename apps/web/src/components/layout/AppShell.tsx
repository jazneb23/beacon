"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";

import { CommandPalette } from "../ui/CommandPalette";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import styles from "./AppShell.module.css";

const COLLAPSE_STORAGE_KEY = "beacon.sidebar.collapsed";

// External store for the persisted sidebar preference. Using
// useSyncExternalStore keeps SSR/first-render in sync (server snapshot is
// always expanded) and avoids a hydration mismatch without an effect.
const collapseListeners = new Set<() => void>();

/** Subscribe to collapse-preference changes (cross-tab + same-tab). */
function subscribeCollapse(listener: () => void): () => void {
  collapseListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    collapseListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Current persisted collapse preference on the client. */
function getCollapseSnapshot(): boolean {
  return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
}

/** The sidebar always renders expanded on the server. */
function getCollapseServerSnapshot(): boolean {
  return false;
}

/** Persist a new collapse preference and notify same-tab subscribers. */
function setCollapsePref(next: boolean): void {
  window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
  collapseListeners.forEach((listener) => listener());
}

type AppShellProps = {
  children: ReactNode;
};

/** Two-part app chrome: persistent sidebar + top header over scrollable main. */
export function AppShell({ children }: AppShellProps): ReactElement {
  const collapsed = useSyncExternalStore(
    subscribeCollapse,
    getCollapseSnapshot,
    getCollapseServerSnapshot,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setCollapsePref(!getCollapseSnapshot());
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className={styles.shell}>
      <div className={styles.sidebarSlot}>
        <Sidebar collapsed={collapsed} />
      </div>

      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className={styles.content}>
        <TopHeader
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className={styles.main}>{children}</main>
      </div>

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
    </div>
  );
}
