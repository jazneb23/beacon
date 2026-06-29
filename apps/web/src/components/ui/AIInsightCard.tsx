"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { ReactElement } from "react";

import type { InsightAction } from "../../hooks/useAccountInsight";
import { Skeleton } from "./Skeleton";
import styles from "./AIInsightCard.module.css";

export type AIInsightCardProps = {
  content: string | null;
  loadingAction: InsightAction | null;
  error: string | null;
  onSummarize: () => void;
  onDraftOutreach: () => void;
  className?: string;
};

/** Card for account summary and outreach drafting on the detail page. */
export function AIInsightCard({
  content,
  loadingAction,
  error,
  onSummarize,
  onDraftOutreach,
  className,
}: AIInsightCardProps): ReactElement {
  const busy = loadingAction !== null;

  return (
    <section
      className={className ? `${styles.card} ${className}` : styles.card}
      aria-label="AI insight"
    >
      <header className={styles.header}>
        <Sparkles aria-hidden className={styles.icon} />
        <h2 className={styles.title}>AI Insight</h2>
      </header>

      <div className={styles.actions}>
        <InsightButton
          label="Summarize"
          loading={loadingAction === "summarize"}
          disabled={busy}
          onClick={onSummarize}
        />
        <InsightButton
          label="Draft outreach"
          loading={loadingAction === "draft-outreach"}
          disabled={busy}
          onClick={onDraftOutreach}
        />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {busy ? (
        <div className={styles.highlight} aria-hidden>
          <Skeleton width="100%" height="0.875rem" />
          <Skeleton width="92%" height="0.875rem" />
          <Skeleton width="78%" height="0.875rem" />
        </div>
      ) : content ? (
        <div className={styles.highlight} aria-live="polite">
          <p className={styles.text}>{content}</p>
        </div>
      ) : null}
    </section>
  );
}

type InsightButtonProps = {
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
};

/** Secondary action button that swaps to a spinner while loading. */
function InsightButton({
  label,
  loading,
  disabled,
  onClick,
}: InsightButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Loader2 aria-hidden className={styles.spinner} size={16} strokeWidth={2} />
          <span>{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
