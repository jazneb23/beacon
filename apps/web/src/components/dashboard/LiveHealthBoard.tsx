"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";

import { fetchAccounts, fetchScores } from "../../lib/api";
import { appendScoreHistory, buildBoardRows, type BoardRow } from "../../lib/boardData";
import { AccountCard } from "../ui/AccountCard";
import { SignalsFeed } from "./SignalsFeed";
import styles from "./LiveHealthBoard.module.css";

const REFRESH_MS = 3000;

type BoardState = {
  rows: BoardRow[];
  history: Record<string, number[]>;
};

const EMPTY_BOARD: BoardState = { rows: [], history: {} };

/** Poll the API and render the live account health grid. */
export function LiveHealthBoard(): ReactElement {
  const [board, setBoard] = useState<BoardState>(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBoard = useCallback(async (isInitial: boolean) => {
    try {
      const [accounts, scores] = await Promise.all([
        fetchAccounts(),
        fetchScores(),
      ]);

      setBoard((previous) => {
        const nextHistory = appendScoreHistory(previous.history, scores);
        return {
          history: nextHistory,
          rows: buildBoardRows(accounts, scores, nextHistory),
        };
      });
      setError(null);
      setLastUpdated(new Date());
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load data";
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
      await loadBoard(isInitial);
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
  }, [loadBoard, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((value) => value + 1);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Live Health Board</h1>
          <p className={styles.subtitle}>
            Real-time customer health across your portfolio
          </p>
        </div>
        <div className={styles.status} aria-live="polite">
          <span className={styles.liveDot} aria-hidden />
          <span>
            {error
              ? "Connection issue"
              : lastUpdated
                ? `Updated ${formatTime(lastUpdated)}`
                : "Connecting…"}
          </span>
        </div>
      </header>

      {loading ? (
        <p className={styles.message}>Loading accounts…</p>
      ) : error ? (
        <div className={`${styles.message} ${styles.messageError}`}>
          <p>{error}</p>
          <button type="button" className={styles.retryButton} onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : board.rows.length === 0 ? (
        <p className={styles.message}>No accounts with health scores yet.</p>
      ) : (
        <div className={styles.layout}>
          <div className={styles.main}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
              {board.rows.map((row) => (
                <AccountCard
                  key={row.account.id}
                  account={row.account}
                  score={row.score}
                  scoreHistory={row.scoreHistory}
                  scoreSize="lg"
                />
              ))}
            </div>
          </div>
          <SignalsFeed />
        </div>
      )}
    </section>
  );
}

/** Format a timestamp for the live status line. */
function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}
