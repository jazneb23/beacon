import type { SignalFeedItem } from "@beacon/shared";
import { Radio } from "lucide-react";
import type { ReactElement } from "react";

import { EmptyState } from "../ui/EmptyState";
import { SignalRow } from "../ui/SignalRow";
import styles from "./RecentSignals.module.css";

type RecentSignalsProps = {
  signals: SignalFeedItem[];
  refreshTick?: number;
};

/** Compact list of the most recent signals for a single account. */
export function RecentSignals({ signals, refreshTick }: RecentSignalsProps): ReactElement {
  if (signals.length === 0) {
    return (
      <EmptyState
        icon={Radio}
        title="No recent signals"
        subtitle="Activity for this account will appear here."
      />
    );
  }

  return (
    <div className={styles.list}>
      {signals.map((signal) => (
        <SignalRow
          key={signal.id}
          accountId={signal.accountId}
          type={signal.type}
          value={signal.value}
          at={signal.at}
          accountName={signal.accountName}
          isNew={false}
          refreshTick={refreshTick}
        />
      ))}
    </div>
  );
}
