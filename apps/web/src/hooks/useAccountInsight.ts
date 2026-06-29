"use client";

import { useCallback, useState } from "react";

import { fetchAccountSummary, fetchNextAction } from "../lib/ai";
import { toastError, toastSuccess } from "../lib/toast";

export type InsightAction = "summarize" | "draft-outreach";

export type AccountInsight = {
  content: string | null;
  loadingAction: InsightAction | null;
  error: string | null;
  summarize: () => void;
  draftOutreach: () => void;
};

/** Manage AI summary / outreach state for a single account. */
export function useAccountInsight(accountId: string, accountName: string): AccountInsight {
  const [content, setContent] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<InsightAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: InsightAction) => {
      setLoadingAction(action);
      setError(null);
      try {
        const text =
          action === "summarize"
            ? await fetchAccountSummary(accountId)
            : await fetchNextAction(accountId);
        setContent(text);
        if (action === "summarize") {
          toastSuccess(`✓ Summary generated for ${accountName}`);
        } else {
          toastSuccess(`✓ Outreach drafted for ${accountName}`);
        }
      } catch {
        setError("Something went wrong. Try again in a moment.");
        toastError("Unable to reach the AI service — try again");
      } finally {
        setLoadingAction(null);
      }
    },
    [accountId, accountName],
  );

  const summarize = useCallback(() => void run("summarize"), [run]);
  const draftOutreach = useCallback(() => void run("draft-outreach"), [run]);

  return { content, loadingAction, error, summarize, draftOutreach };
}
