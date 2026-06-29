"use client";

import { Inbox } from "lucide-react";
import { useEffect, useMemo, useState, type ReactElement } from "react";

import { useBoardData } from "../../hooks/useBoardData";
import {
  countAtRisk,
  filterBoardRows,
  sortBoardRows,
  type BoardFilter,
  type BoardSort,
  type BoardView as BoardViewMode,
} from "../../lib/boardFilters";
import { getWeeklySignalCount } from "../../lib/mockAccountMeta";
import { AccountCard } from "../ui/AccountCard";
import { AccountCardSkeleton } from "../ui/AccountCardSkeleton";
import { AccountListView } from "../ui/AccountListView";
import { EmptyState } from "../ui/EmptyState";
import { BoardControls } from "./BoardControls";
import styles from "./BoardView.module.css";

const TIME_TICK_MS = 1000;
const SKELETON_COUNT = 6;

type BoardViewProps = {
  defaultView?: BoardViewMode;
  initialFilter?: BoardFilter;
};

/** Shared portfolio board: subtitle + filter/sort/view controls over a grid/list. */
export function BoardView({
  defaultView = "grid",
  initialFilter = "all",
}: BoardViewProps): ReactElement {
  const { rows, loading, error, retry } = useBoardData();
  const [filter, setFilter] = useState<BoardFilter>(initialFilter);
  const [sort, setSort] = useState<BoardSort>("score");
  const [view, setView] = useState<BoardViewMode>(defaultView);
  const [timeTick, setTimeTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTimeTick((value) => value + 1), TIME_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const atRisk = useMemo(() => countAtRisk(rows), [rows]);
  const visibleRows = useMemo(
    () => sortBoardRows(filterBoardRows(rows, filter), sort),
    [rows, filter, sort],
  );

  const subtitle = `${rows.length} account${rows.length === 1 ? "" : "s"} · ${atRisk} at risk`;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.subtitle}>{subtitle}</p>
        <BoardControls
          filter={filter}
          sort={sort}
          view={view}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onViewChange={setView}
        />
      </header>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <AccountCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className={styles.message}>
          <p className={styles.error}>{error}</p>
          <button type="button" className={styles.retryButton} onClick={retry}>
            Retry
          </button>
        </div>
      ) : visibleRows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={rows.length === 0 ? "No accounts yet" : "No accounts match this filter"}
          subtitle={
            rows.length === 0
              ? "Accounts will appear here as your portfolio sends activity."
              : "Try a different filter to see more of your portfolio."
          }
        />
      ) : view === "grid" ? (
        <div className={styles.grid}>
          {visibleRows.map((row, index) => (
            <AccountCard
              key={row.account.id}
              account={row.account}
              score={row.score}
              scoreHistory={row.scoreHistory}
              signalsThisWeek={getWeeklySignalCount(row.account.id)}
              index={index}
              refreshTick={timeTick}
              animateCount
            />
          ))}
        </div>
      ) : (
        <AccountListView
          rows={visibleRows}
          sort={sort}
          onSortChange={setSort}
          refreshTick={timeTick}
        />
      )}
    </section>
  );
}
