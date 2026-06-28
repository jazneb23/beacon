"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useState, type ReactElement } from "react";

import styles from "./AIInsightCard.module.css";

export type InsightAction = "summarize" | "draft-outreach";

export type AIInsightCardProps = {
  accountId: string;
  onSummarize: (accountId: string) => Promise<string>;
  onDraftOutreach: (accountId: string) => Promise<string>;
  className?: string;
};

/** Card for account summary and next-best-action on the detail page. */
export function AIInsightCard({
  accountId,
  onSummarize,
  onDraftOutreach,
  className,
}: AIInsightCardProps): ReactElement {
  const [loadingAction, setLoadingAction] = useState<InsightAction | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Run an insight action and surface the returned text. */
  const runAction = useCallback(
    async (action: InsightAction) => {
      setLoadingAction(action);
      setError(null);

      try {
        const text =
          action === "summarize"
            ? await onSummarize(accountId)
            : await onDraftOutreach(accountId);
        setContent(text);
      } catch {
        setError("Something went wrong. Try again in a moment.");
      } finally {
        setLoadingAction(null);
      }
    },
    [accountId, onDraftOutreach, onSummarize],
  );

  return (
    <section
      className={className ? `${styles.card} ${className}` : styles.card}
      aria-label="Account insights"
    >
      <header className={styles.header}>
        <Sparkles aria-hidden className={styles.icon} />
        <h2 className={styles.title}>Insights</h2>
      </header>

      <div className={styles.actions}>
        <InsightButton
          label="Summarize"
          loading={loadingAction === "summarize"}
          disabled={loadingAction !== null}
          onClick={() => void runAction("summarize")}
        />
        <InsightButton
          label="Draft outreach"
          loading={loadingAction === "draft-outreach"}
          disabled={loadingAction !== null}
          onClick={() => void runAction("draft-outreach")}
        />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {content ? (
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
