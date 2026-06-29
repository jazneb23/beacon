import type { ReactElement } from "react";

import { Skeleton } from "./Skeleton";
import styles from "./SignalRowSkeleton.module.css";

/** Skeleton placeholder matching a single signal feed row. */
export function SignalRowSkeleton(): ReactElement {
  return (
    <div className={styles.row} aria-hidden>
      <Skeleton width="28px" height="28px" radius="var(--radius-md)" />
      <div className={styles.body}>
        <Skeleton width="40%" height="0.875rem" />
        <Skeleton width="60%" height="0.75rem" />
      </div>
      <Skeleton width="32px" height="0.75rem" />
    </div>
  );
}
