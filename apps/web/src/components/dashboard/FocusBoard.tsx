"use client";

import { ShieldCheck } from "lucide-react";
import { useMemo, type ReactElement } from "react";

import { useBoardData } from "../../hooks/useBoardData";
import { buildWorklist, summarizeWorklist } from "../../lib/worklist";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import styles from "./FocusBoard.module.css";
import { WorklistRow } from "./WorklistRow";

const SKELETON_COUNT = 4;

/** Health Board: a prioritized worklist of the accounts that need attention now. */
export function FocusBoard(): ReactElement {
  const { rows, loading, error, retry } = useBoardData();

  const items = useMemo(() => buildWorklist(rows), [rows]);
  const summary = useMemo(() => summarizeWorklist(items), [items]);

  const subtitle = loading
    ? "Scanning your portfolio..."
    : `${summary.total} account${summary.total === 1 ? "" : "s"} need attention right now`;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.subtitle}>{subtitle}</p>
        {!loading && !error ? (
          <div className={styles.stats}>
            <span className={styles.statRed}>{summary.atRisk} at risk</span>
            <span className={styles.statAmber}>{summary.warning} warning</span>
          </div>
        ) : null}
      </header>

      {loading ? (
        <div className={styles.list}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div key={index} className={styles.skeletonRow}>
              <div className={styles.skeletonMain}>
                <Skeleton width="40%" height="1.1rem" />
                <Skeleton width="30%" height="0.85rem" />
              </div>
              <Skeleton width="96px" height="2.25rem" radius="var(--radius-md)" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.message}>
          <p className={styles.error}>{error}</p>
          <button type="button" className={styles.retryButton} onClick={retry}>
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="All clear"
          subtitle="No accounts need attention right now. Healthy accounts live on the Accounts page."
        />
      ) : (
        <div className={styles.list}>
          {items.map((item, index) => (
            <WorklistRow key={item.row.account.id} item={item} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
