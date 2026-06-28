import type { SignalEvent } from "@beacon/shared";
import {
  Activity,
  CreditCard,
  LogIn,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { ReactElement } from "react";

import styles from "./SignalRow.module.css";
import { formatRelativeTime, getSignalDescription } from "./signalRowUtils";

export type SignalRowProps = SignalEvent & {
  accountName: string;
  isNew?: boolean;
};

const SIGNAL_ICONS: Record<SignalEvent["type"], LucideIcon> = {
  usage: Activity,
  support: MessageSquare,
  billing: CreditCard,
  login: LogIn,
};

const SEVERITY_CLASS: Record<SignalEvent["type"], string> = {
  usage: styles.severityAmber,
  support: styles.severityRed,
  billing: styles.severityRed,
  login: styles.severityMuted,
};

/** Compact row for a single signal in the live feed. */
export function SignalRow({
  accountName,
  type,
  at,
  isNew = true,
}: SignalRowProps): ReactElement {
  const Icon = SIGNAL_ICONS[type];
  const description = getSignalDescription(type);
  const relativeTime = formatRelativeTime(at);
  const rowClass = isNew ? `${styles.row} ${styles.rowEnter}` : styles.row;

  return (
    <article className={rowClass} aria-label={`${accountName}: ${description}`}>
      <span
        className={`${styles.iconWrap} ${SEVERITY_CLASS[type]}`}
        aria-hidden
      >
        <Icon className={styles.icon} />
      </span>

      <div className={styles.body}>
        <span className={styles.accountName}>{accountName}</span>
        <span className={styles.separator} aria-hidden>
          ·
        </span>
        <span className={styles.description}>{description}</span>
      </div>

      <time className={styles.time} dateTime={at}>
        {relativeTime}
      </time>
    </article>
  );
}
