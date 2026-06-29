import type { SignalEvent } from "@beacon/shared";
import {
  Activity,
  CreditCard,
  LogIn,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

import { formatScoreDelta, getSignalScoreDelta } from "../../lib/signalScoreDelta";
import styles from "./SignalRow.module.css";
import { formatRelativeTime, getSignalDescription } from "./signalRowUtils";

export type SignalRowProps = SignalEvent & {
  accountName: string;
  isNew?: boolean;
  refreshTick?: number;
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
  accountId,
  accountName,
  type,
  value,
  at,
  isNew = true,
  refreshTick,
}: SignalRowProps): ReactElement {
  const Icon = SIGNAL_ICONS[type];
  const description = getSignalDescription(type);
  const relativeTime = formatRelativeTime(
    at,
    refreshTick !== undefined ? new Date() : undefined,
  );
  const delta = getSignalScoreDelta(type, value);
  const rowClass = isNew ? `${styles.row} ${styles.rowEnter}` : styles.row;

  return (
    <article className={rowClass} aria-label={`${accountName}: ${description}`}>
      <span className={`${styles.iconWrap} ${SEVERITY_CLASS[type]}`} aria-hidden>
        <Icon className={styles.icon} />
      </span>

      <div className={styles.body}>
        <Link href={`/accounts/${accountId}`} className={styles.accountName}>
          {accountName}
        </Link>
        <span className={styles.separator} aria-hidden>
          ·
        </span>
        <span className={styles.description}>{description}</span>
      </div>

      {delta !== 0 ? (
        <span
          className={styles.delta}
          style={{
            color: delta > 0 ? "var(--color-health-green)" : "var(--color-health-red)",
          }}
        >
          {formatScoreDelta(delta)}
        </span>
      ) : null}

      <time className={styles.time} dateTime={at}>
        {relativeTime}
      </time>
    </article>
  );
}
