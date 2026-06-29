import type { LucideIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import styles from "./EmptyState.module.css";

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

/** Centered placeholder for sections with no data. */
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: EmptyStateProps): ReactElement {
  return (
    <div className={styles.root}>
      <span className={styles.iconWrap} aria-hidden>
        <Icon size={32} strokeWidth={1.5} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
