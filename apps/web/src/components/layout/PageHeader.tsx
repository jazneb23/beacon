import type { ReactElement, ReactNode } from "react";

import styles from "./PageHeader.module.css";

export type PageHeaderProps = {
  subtitle?: string;
  actions?: ReactNode;
};

/**
 * Light page intro row. The page title itself lives in the top header, so this
 * only renders the optional subtitle and any page-level actions.
 */
export function PageHeader({ subtitle, actions }: PageHeaderProps): ReactElement | null {
  if (!subtitle && !actions) {
    return null;
  }

  return (
    <header className={styles.header}>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
