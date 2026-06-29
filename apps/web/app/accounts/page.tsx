import type { ReactElement } from "react";

import { BoardView } from "../../src/components/dashboard/BoardView";
import type { BoardFilter } from "../../src/lib/boardFilters";

const VALID_FILTERS: BoardFilter[] = ["all", "at-risk", "warning", "healthy"];

type AccountsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps): Promise<ReactElement> {
  const { filter } = await searchParams;
  const initialFilter = VALID_FILTERS.includes(filter as BoardFilter)
    ? (filter as BoardFilter)
    : "all";

  return <BoardView defaultView="list" initialFilter={initialFilter} />;
}
