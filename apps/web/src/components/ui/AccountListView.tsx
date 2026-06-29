"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import type { BoardRow } from "../../lib/boardData";
import type { BoardSort } from "../../lib/boardFilters";
import { getAccountOwner } from "../../lib/mockAccountMeta";
import { getTopDriver } from "./accountCardUtils";
import { getHealthScoreBand, getHealthScoreColor } from "./healthScoreBand";
import { HealthScoreBadge } from "./HealthScoreBadge";
import { formatRelativeTime } from "./signalRowUtils";
import styles from "./AccountListView.module.css";

type Column = {
  key: string;
  label: string;
  sort?: BoardSort;
};

const COLUMNS: Column[] = [
  { key: "account", label: "Account", sort: "name" },
  { key: "plan", label: "Plan", sort: "plan" },
  { key: "score", label: "Score", sort: "score" },
  { key: "trend", label: "Trend" },
  { key: "driver", label: "Top Driver" },
  { key: "updated", label: "Last Signal", sort: "updated" },
  { key: "owner", label: "Owner" },
];

const TREND_LABEL: Record<BoardRow["score"]["trend"], string> = {
  up: "Up",
  down: "Down",
  flat: "Flat",
};

type AccountListViewProps = {
  rows: BoardRow[];
  sort: BoardSort;
  onSortChange: (sort: BoardSort) => void;
  refreshTick?: number;
};

/** Dense, sortable table view of the account portfolio. */
export function AccountListView({
  rows,
  sort,
  onSortChange,
  refreshTick,
}: AccountListViewProps): ReactElement {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const active = column.sort && column.sort === sort;
              return (
                <th key={column.key} className={styles.th}>
                  {column.sort ? (
                    <button
                      type="button"
                      className={styles.sortHeader}
                      onClick={() => onSortChange(column.sort as BoardSort)}
                    >
                      {column.label}
                      {active ? (
                        column.sort === "name" ? (
                          <ArrowUp size={12} aria-hidden />
                        ) : (
                          <ArrowDown size={12} aria-hidden />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const band = getHealthScoreBand(row.score.score);
            const accent = getHealthScoreColor(band);
            const topDriver = getTopDriver(row.score.drivers);
            const href = `/accounts/${row.account.id}`;
            return (
              <tr
                key={row.account.id}
                className={styles.row}
                style={{ borderLeftColor: accent }}
                tabIndex={0}
                onClick={() => router.push(href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    router.push(href);
                  }
                }}
              >
                <td className={styles.tdName}>{row.account.name}</td>
                <td className={styles.td}>
                  <span className={styles.plan}>{row.account.plan}</span>
                </td>
                <td className={styles.td}>
                  <HealthScoreBadge score={row.score.score} trend={row.score.trend} size="sm" />
                </td>
                <td className={styles.td}>{TREND_LABEL[row.score.trend]}</td>
                <td className={styles.td}>
                  {topDriver ? (
                    <span
                      style={{
                        color:
                          topDriver.direction === "negative"
                            ? "var(--color-health-red)"
                            : "var(--color-health-green)",
                      }}
                    >
                      {topDriver.label}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={styles.tdMuted}>
                  {formatRelativeTime(
                    row.score.updatedAt,
                    refreshTick !== undefined ? new Date() : undefined,
                  )}
                </td>
                <td className={styles.tdMuted}>{getAccountOwner(row.account.id)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
