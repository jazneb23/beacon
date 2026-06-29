import type { ReactElement } from "react";

import { Skeleton } from "./Skeleton";
import styles from "./AccountCardSkeleton.module.css";

/** Card-shaped skeleton loader matching the AccountCard layout. */
export function AccountCardSkeleton(): ReactElement {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.header}>
        <Skeleton width="40%" height="1rem" />
        <Skeleton width="48px" height="1rem" radius="var(--radius-full)" />
      </div>
      <div className={styles.scoreRow}>
        <Skeleton width="72px" height="2.25rem" />
        <Skeleton width="88px" height="28px" />
      </div>
      <Skeleton width="60%" height="0.75rem" />
    </div>
  );
}
