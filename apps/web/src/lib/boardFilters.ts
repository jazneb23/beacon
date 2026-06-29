import { getHealthScoreBand } from "../components/ui/healthScoreBand";
import type { BoardRow } from "./boardData";

export type BoardFilter = "all" | "at-risk" | "warning" | "healthy";
export type BoardSort = "score" | "name" | "plan" | "updated";
export type BoardView = "grid" | "list";

const PLAN_ORDER: Record<BoardRow["account"]["plan"], number> = {
  enterprise: 0,
  pro: 1,
  free: 2,
};

/** Map a filter pill to the health band(s) it shows ("all" shows everything). */
function matchesFilter(row: BoardRow, filter: BoardFilter): boolean {
  if (filter === "all") {
    return true;
  }
  const band = getHealthScoreBand(row.score.score);
  if (filter === "at-risk") {
    return band === "red";
  }
  if (filter === "warning") {
    return band === "amber";
  }
  return band === "green";
}

/** Filter board rows by the active health filter pill. */
export function filterBoardRows(rows: BoardRow[], filter: BoardFilter): BoardRow[] {
  return rows.filter((row) => matchesFilter(row, filter));
}

/** Sort board rows by the active sort key (score descending by default). */
export function sortBoardRows(rows: BoardRow[], sort: BoardSort): BoardRow[] {
  const sorted = [...rows];
  switch (sort) {
    case "score":
      sorted.sort((a, b) => b.score.score - a.score.score);
      break;
    case "name":
      sorted.sort((a, b) => a.account.name.localeCompare(b.account.name));
      break;
    case "plan":
      sorted.sort((a, b) => PLAN_ORDER[a.account.plan] - PLAN_ORDER[b.account.plan]);
      break;
    case "updated":
      sorted.sort(
        (a, b) =>
          new Date(b.score.updatedAt).getTime() - new Date(a.score.updatedAt).getTime(),
      );
      break;
  }
  return sorted;
}

/** Count rows in the at-risk (red) band. */
export function countAtRisk(rows: BoardRow[]): number {
  return rows.filter((row) => getHealthScoreBand(row.score.score) === "red").length;
}

/** Human label for a sort key (for the sort dropdown trigger). */
export function getSortLabel(sort: BoardSort): string {
  switch (sort) {
    case "score":
      return "Score";
    case "name":
      return "Name";
    case "plan":
      return "Plan";
    case "updated":
      return "Last Updated";
  }
}
