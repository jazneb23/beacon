"use client";

import type { Account, HealthScore } from "@beacon/shared";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactElement } from "react";

import { fetchAccountSummary, fetchNextAction } from "../../lib/ai";
import { fetchAccountDetail } from "../../lib/api";
import { chronologicalScores } from "../../lib/scoreHistory";
import { AIInsightCard } from "../ui/AIInsightCard";
import { DriverBar } from "../ui/DriverBar";
import { HealthScoreBadge } from "../ui/HealthScoreBadge";
import { ScoreHistoryChart } from "../ui/ScoreHistoryChart";
import styles from "./AccountDetailView.module.css";

type AccountDetailViewProps = {
  accountId: string;
};

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      account: Account;
      latestScore: HealthScore | null;
      scoreHistory: number[];
      drivers: HealthScore["drivers"];
    };

const PLAN_BADGE_CLASS: Record<Account["plan"], string> = {
  free: styles.planFree,
  pro: styles.planPro,
  enterprise: styles.planEnterprise,
};

/** Account detail page with score history chart and driver breakdown. */
export function AccountDetailView({ accountId }: AccountDetailViewProps): ReactElement {
  const [state, setState] = useState<DetailState>({ status: "loading" });

  const loadDetail = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const detail = await fetchAccountDetail(accountId);
      const latestScore = detail.scoreHistory[0] ?? null;

      setState({
        status: "ready",
        account: detail.account,
        latestScore,
        scoreHistory: chronologicalScores(detail.scoreHistory),
        drivers: detail.drivers,
      });
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load account";
      setState({ status: "error", message });
    }
  }, [accountId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  return (
    <section className={styles.page}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} aria-hidden />
        Back to board
      </Link>

      {state.status === "loading" ? (
        <p className={styles.message}>Loading account…</p>
      ) : state.status === "error" ? (
        <div className={`${styles.message} ${styles.messageError}`}>
          <p>{state.message}</p>
          <button type="button" className={styles.retryButton} onClick={() => void loadDetail()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <div className={styles.headerMain}>
              <h1 className={styles.accountName}>{state.account.name}</h1>
              <span
                className={`${styles.planBadge} ${PLAN_BADGE_CLASS[state.account.plan]}`}
              >
                {state.account.plan}
              </span>
            </div>
            {state.latestScore ? (
              <HealthScoreBadge
                score={state.latestScore.score}
                trend={state.latestScore.trend}
                size="lg"
              />
            ) : (
              <p className={styles.noScore}>No score yet</p>
            )}
          </header>

          <div className={styles.layout}>
            <div className={styles.main}>
              <section className={styles.section} aria-labelledby="score-history-heading">
                <h2 id="score-history-heading" className={styles.sectionTitle}>
                  Score history
                </h2>
                {state.scoreHistory.length > 0 ? (
                  <ScoreHistoryChart scores={state.scoreHistory} />
                ) : (
                  <p className={styles.emptyState}>No score history available.</p>
                )}
              </section>

              <section className={styles.section} aria-labelledby="score-drivers-heading">
                <h2 id="score-drivers-heading" className={styles.sectionTitle}>
                  Score drivers
                </h2>
                {state.drivers.length > 0 ? (
                  <div className={styles.driverList}>
                    {state.drivers.map((driver) => (
                      <DriverBar
                        key={driver.label}
                        label={driver.label}
                        weight={driver.weight}
                        direction={driver.direction}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No driver data available.</p>
                )}
              </section>
            </div>

            <aside className={styles.aside}>
              <AIInsightCard
                accountId={state.account.id}
                onSummarize={fetchAccountSummary}
                onDraftNextAction={fetchNextAction}
              />
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
