"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchAccounts, fetchScores } from "../lib/api";
import { appendScoreHistory, buildBoardRows, type BoardRow } from "../lib/boardData";
import { toastError, toastInfo } from "../lib/toast";

const REFRESH_MS = 3000;

export type BoardData = {
  rows: BoardRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  retry: () => void;
};

type BoardState = {
  rows: BoardRow[];
  history: Record<string, number[]>;
};

const EMPTY_BOARD: BoardState = { rows: [], history: {} };

/** Poll accounts + scores on an interval, accumulating sparkline history. */
export function useBoardData(): BoardData {
  const [board, setBoard] = useState<BoardState>(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hadErrorRef = useRef(false);

  const loadBoard = useCallback(async (isInitial: boolean) => {
    try {
      const [accounts, scores] = await Promise.all([fetchAccounts(), fetchScores()]);

      setBoard((previous) => {
        const nextHistory = appendScoreHistory(previous.history, scores);
        return {
          history: nextHistory,
          rows: buildBoardRows(accounts, scores, nextHistory),
        };
      });
      setError(null);

      // Surface a recovery toast once after a prior failure.
      if (hadErrorRef.current) {
        hadErrorRef.current = false;
        toastInfo("● Live connection restored");
      }
      setLastUpdated(new Date());
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load data";
      setError(message);
      if (!hadErrorRef.current) {
        hadErrorRef.current = true;
        toastError("Unable to reach Beacon API — retrying...");
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refresh = async (isInitial: boolean) => {
      if (cancelled) {
        return;
      }
      await loadBoard(isInitial);
    };

    void refresh(true);
    const intervalId = setInterval(() => {
      void refresh(false);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [loadBoard, refreshKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((value) => value + 1);
  }, []);

  return { rows: board.rows, loading, error, lastUpdated, retry };
}
