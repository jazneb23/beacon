"use client";

import type { SignalFeedItem } from "@beacon/shared";
import { Radio } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";

import { groupSignalsByTime } from "../../lib/groupSignalsByTime";
import { fetchRecentSignals } from "../../lib/api";
import { EmptyState } from "../ui/EmptyState";
import { SignalRow } from "../ui/SignalRow";
import { SignalRowSkeleton } from "../ui/SignalRowSkeleton";
import styles from "./SignalsFeed.module.css";

const REFRESH_MS = 3000;
const TIME_TICK_MS = 1000;
const SKELETON_COUNT = 5;

export type SignalsFeedVariant = "panel" | "page";

type SignalsFeedProps = {
  variant?: SignalsFeedVariant;
  limit?: number;
};

type FeedRow = SignalFeedItem & {
  isNew: boolean;
};

/** Merge polled feed items, marking rows that just arrived. */
function mergeFeedRows(previous: FeedRow[], incoming: SignalFeedItem[]): FeedRow[] {
  const seenIds = new Set(previous.map((row) => row.id));
  return incoming.map((item) => ({ ...item, isNew: !seenIds.has(item.id) }));
}

/** Live feed of the latest signal events, grouped by recency. */
export function SignalsFeed({ variant = "panel", limit = 50 }: SignalsFeedProps): ReactElement {
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeTick, setTimeTick] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFeed = useCallback(
    async (isInitial: boolean) => {
      try {
        const events = await fetchRecentSignals(limit);
        setRows((previous) => mergeFeedRows(previous, events));
        setError(null);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Failed to load signals";
        setError(message);
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
    },
    [limit],
  );

  useEffect(() => {
    let cancelled = false;

    const refresh = async (isInitial: boolean) => {
      if (cancelled) {
        return;
      }
      await loadFeed(isInitial);
    };

    void refresh(true);
    const intervalId = setInterval(() => {
      void refresh(false);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [loadFeed, refreshKey]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeTick((value) => value + 1);
    }, TIME_TICK_MS);
    return () => clearInterval(intervalId);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((value) => value + 1);
  };

  const groups = groupSignalsByTime(rows);
  const panelClass =
    variant === "page" ? `${styles.panel} ${styles.panelPage}` : styles.panel;

  return (
    <aside className={panelClass} aria-labelledby="signals-feed-title">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Radio size={16} aria-hidden className={styles.headerIcon} />
          <h2 id="signals-feed-title" className={styles.title}>
            Live Signals
          </h2>
        </div>
        <span className={styles.liveLabel}>
          <span className={styles.liveDot} aria-hidden />
          LIVE
        </span>
      </header>

      <div className={styles.list} aria-live="polite" aria-relevant="additions">
        {loading ? (
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <SignalRowSkeleton key={index} />
          ))
        ) : error ? (
          <div className={styles.messageError}>
            <p>{error}</p>
            <button type="button" className={styles.retryButton} onClick={handleRetry}>
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No signals yet"
            subtitle="Signals will appear here as your accounts send activity."
          />
        ) : (
          groups.map((group) => (
            <div key={group.id} className={styles.group}>
              <p className={styles.groupLabel}>{group.label}</p>
              {group.items.map((row) => (
                <SignalRow
                  key={row.id}
                  accountId={row.accountId}
                  type={row.type}
                  value={row.value}
                  at={row.at}
                  accountName={row.accountName}
                  isNew={(row as FeedRow).isNew}
                  refreshTick={timeTick}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {variant === "panel" && !loading && !error && rows.length > 0 ? (
        <footer className={styles.footer}>
          <Link href="/signals" className={styles.viewAll}>
            View all signals
          </Link>
        </footer>
      ) : null}
    </aside>
  );
}
