import Link from "next/link";
import type { ReactElement } from "react";

import { ThemeToggle } from "../theme/ThemeToggle";
import styles from "./TopNav.module.css";

/** Top navigation bar with branding and global actions. */
export function TopNav(): ReactElement {
  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        Beacon
      </Link>
      <div className={styles.actions}>
        <ThemeToggle />
      </div>
    </header>
  );
}
