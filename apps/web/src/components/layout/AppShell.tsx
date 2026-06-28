import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

import { ThemeToggle } from "../theme/ThemeToggle";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

/** Full-height app chrome with a minimal header and scrollable main area. */
export function AppShell({ children }: AppShellProps): ReactElement {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          Beacon
        </Link>
        <ThemeToggle />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
