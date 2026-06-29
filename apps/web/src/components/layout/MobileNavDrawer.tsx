"use client";

import { useEffect, type ReactElement } from "react";

import { Sidebar } from "./Sidebar";
import styles from "./MobileNavDrawer.module.css";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/** Slide-over wrapper that shows the sidebar on small screens. */
export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps): ReactElement | null {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Navigation">
        <Sidebar collapsed={false} onNavigate={onClose} />
      </div>
    </div>
  );
}
