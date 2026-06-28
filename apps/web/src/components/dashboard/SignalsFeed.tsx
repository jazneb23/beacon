"use client";

import type { SignalFeedItem } from "@beacon/shared";
import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";

import { fetchRecentSignals } from "../../lib/api";
import { SignalRow } from "../ui/SignalRow";
import styles from "./SignalsFeed.module.css";

const REFRESH_MS = 3000;
const TIME_TICK_MS = 1000;
const FEED_LIMIT = 50;

type FeedRow = SignalFeedItem & {
  isNew: boolean;
};

/** Merge polled feed items, marking rows that just arrived. */
function mergeFeedRows(previous: FeedRow[], incoming: SignalFeedItem[]): FeedRow[] {
  const seenIds = new Set(previous.map((row) => row.id));

  return incoming.map((item) => ({
    ...item,
    isNew: !seenIds.has(item.id),
  }));
}

/** Right-hand panel streaming the latest signal events. */
export function SignalsFeed(): ReactElement {
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeTick, setTimeTick] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFeed = useCallback(async (isInitial: boolean) => {
    try {
      const events = await fetchRecentSignals(FEED_LIMIT);
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const refresh = async (isInitial: boolean) => {
      if (cancelled) {
        return;
      }
      await loadFeed(isInitial);
    };

    void refresh(true);
    intervalId = setInterval(() => {
      void refresh(false);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadFeed, refreshKey]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeTick((value) => value + 1);
    }, TIME_TICK_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((value) => value + 1);
  };

  return (
    <aside className={styles.panel} aria-labelledby="signals-feed-title">
      <header className={styles.header}>
        <h2 id="signals-feed-title" className={styles.title}>
          Signals Feed
        </h2>
        <span className={styles.liveDot} aria-hidden />
      </header>

      {loading ? (
        <p className={styles.message}>Loading signals…</p>
      ) : error ? (
        <div className={styles.messageError}>
          <p>{error}</p>
          <button type="button" className={styles.retryButton} onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p className={styles.message}>No signal events yet.</p>
      ) : (
        <div className={styles.list} aria-live="polite" aria-relevant="additions">
          {rows.map((row) => (
            <SignalRow
              key={row.id}
              accountId={row.accountId}
              type={row.type}
              value={row.value}
              at={row.at}
              accountName={row.accountName}
              isNew={row.isNew}
              refreshTick={timeTick}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
