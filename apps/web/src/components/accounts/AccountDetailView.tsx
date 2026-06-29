"use client";

import type { Account, HealthScore, SignalFeedItem } from "@beacon/shared";
import { BookOpen, ChevronRight, Download, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";

import { usePageTitle } from "../../contexts/PageTitleContext";
import { useAccountInsight } from "../../hooks/useAccountInsight";
import { fetchAccountDetail, fetchRecentSignals } from "../../lib/api";
import {
  getCustomerSince,
  getDaysSinceLogin,
  getOpenTickets,
  getSignalsThisWeek,
} from "../../lib/mockAccountMeta";
import { chronologicalScores } from "../../lib/scoreHistory";
import { toastInfo } from "../../lib/toast";
import { AIInsightCard } from "../ui/AIInsightCard";
import { DriverBar } from "../ui/DriverBar";
import { EmptyState } from "../ui/EmptyState";
import { HealthScoreBadge } from "../ui/HealthScoreBadge";
import { ScoreHistoryChart } from "../ui/ScoreHistoryChart";
import { Skeleton } from "../ui/Skeleton";
import { formatRelativeTime } from "../ui/signalRowUtils";
import { Inbox } from "lucide-react";
import { QuickStats } from "./QuickStats";
import { RecentSignals } from "./RecentSignals";
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
      recentSignals: SignalFeedItem[];
    };

const PLAN_BADGE_CLASS: Record<Account["plan"], string> = {
  free: styles.planFree,
  pro: styles.planPro,
  enterprise: styles.planEnterprise,
};

const TIME_TICK_MS = 1000;
const RECENT_SIGNAL_COUNT = 5;

/** Account detail page: score history, drivers, quick stats, and AI insight. */
export function AccountDetailView({ accountId }: AccountDetailViewProps): ReactElement {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [timeTick, setTimeTick] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { setTitle } = usePageTitle();

  const accountName = state.status === "ready" ? state.account.name : "";
  const insight = useAccountInsight(accountId, accountName);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [detail, signals] = await Promise.all([
          fetchAccountDetail(accountId),
          fetchRecentSignals(50).catch(() => [] as SignalFeedItem[]),
        ]);
        if (cancelled) {
          return;
        }
        const latestScore = detail.scoreHistory[0] ?? null;
        const recentSignals = signals
          .filter((signal) => signal.accountId === accountId)
          .slice(0, RECENT_SIGNAL_COUNT);

        setState({
          status: "ready",
          account: detail.account,
          latestScore,
          scoreHistory: chronologicalScores(detail.scoreHistory),
          drivers: detail.drivers,
          recentSignals,
        });
        setTitle(`Account Detail — ${detail.account.name}`);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        const message =
          loadError instanceof Error ? loadError.message : "Failed to load account";
        setState({ status: "error", message });
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [accountId, refreshKey, setTitle]);

  useEffect(() => {
    const id = setInterval(() => setTimeTick((value) => value + 1), TIME_TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Reset the header title override when leaving the page.
  useEffect(() => () => setTitle(null), [setTitle]);

  if (state.status === "loading") {
    return (
      <section className={styles.page}>
        <Skeleton width="200px" height="1rem" />
        <div className={styles.headerSkeleton}>
          <Skeleton width="280px" height="2rem" />
          <Skeleton width="120px" height="3rem" />
        </div>
        <Skeleton width="100%" height="240px" radius="var(--radius-lg)" />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className={styles.page}>
        <EmptyState
          icon={Inbox}
          title="Couldn't load this account"
          subtitle={state.message}
          action={
            <button
              type="button"
              className={styles.retryButton}
              onClick={() => {
                setState({ status: "loading" });
                setRefreshKey((value) => value + 1);
              }}
            >
              Retry
            </button>
          }
        />
      </section>
    );
  }

  const { account, latestScore, scoreHistory, drivers, recentSignals } = state;
  const signalsThisWeek = getSignalsThisWeek(accountId, recentSignals);

  return (
    <section className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink} data-testid="back-to-board">
          Health Board
        </Link>
        <ChevronRight size={14} aria-hidden className={styles.breadcrumbSep} />
        <span className={styles.breadcrumbCurrent}>{account.name}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <h1 className={styles.accountName}>{account.name}</h1>
            <span className={`${styles.planBadge} ${PLAN_BADGE_CLASS[account.plan]}`}>
              {account.plan}
            </span>
          </div>
          <p className={styles.customerSince}>Customer since {getCustomerSince(accountId)}</p>
        </div>

        {latestScore ? (
          <div className={styles.scoreBlock}>
            <HealthScoreBadge score={latestScore.score} trend={latestScore.trend} size="xl" />
            <span className={styles.lastUpdated}>
              Last updated {formatRelativeTime(latestScore.updatedAt, new Date())}
            </span>
          </div>
        ) : (
          <p className={styles.noScore}>No score yet</p>
        )}
      </header>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={insight.summarize}>
          <Sparkles size={16} aria-hidden />
          Generate AI Summary
        </button>
        <button type="button" className={styles.secondaryButton} onClick={insight.draftOutreach}>
          <Mail size={16} aria-hidden />
          Draft Outreach
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => toastInfo("Playbooks are coming soon")}
        >
          <BookOpen size={16} aria-hidden />
          Start Playbook
        </button>
        <button
          type="button"
          className={styles.ghostButton}
          onClick={() => toastInfo("Preparing PDF export...")}
        >
          <Download size={16} aria-hidden />
          Export PDF
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.section} aria-labelledby="score-history-heading">
            <h2 id="score-history-heading" className={styles.sectionTitle}>
              Score History
            </h2>
            {scoreHistory.length > 0 ? (
              <ScoreHistoryChart scores={scoreHistory} />
            ) : (
              <p className={styles.emptyState}>No score history available.</p>
            )}
          </section>

          <section className={styles.section} aria-labelledby="score-drivers-heading">
            <h2 id="score-drivers-heading" className={styles.sectionTitle}>
              Score Drivers
            </h2>
            {drivers.length > 0 ? (
              <div className={styles.driverList}>
                {drivers.map((driver) => (
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
          <section className={styles.section} aria-labelledby="quick-stats-heading">
            <h2 id="quick-stats-heading" className={styles.sectionTitle}>
              Quick Stats
            </h2>
            <QuickStats
              signalsThisWeek={signalsThisWeek}
              signalsTrend={latestScore?.trend ?? "flat"}
              openTickets={getOpenTickets(accountId)}
              daysSinceLogin={getDaysSinceLogin(accountId)}
            />
          </section>

          <section className={styles.section}>
            <AIInsightCard
              content={insight.content}
              loadingAction={insight.loadingAction}
              error={insight.error}
              onSummarize={insight.summarize}
              onDraftOutreach={insight.draftOutreach}
            />
          </section>

          <section className={styles.section} aria-labelledby="recent-signals-heading">
            <h2 id="recent-signals-heading" className={styles.sectionTitle}>
              Recent Signals
            </h2>
            <RecentSignals signals={recentSignals} refreshTick={timeTick} />
          </section>
        </aside>
      </div>
    </section>
  );
}
