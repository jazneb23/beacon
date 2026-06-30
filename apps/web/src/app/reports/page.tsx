import { BarChart2 } from "lucide-react";
import type { ReactElement } from "react";

import { EmptyState } from "../../components/ui/EmptyState";

export default function ReportsPage(): ReactElement {
  return (
    <EmptyState
      icon={BarChart2}
      title="Reports are coming soon"
      subtitle="Scheduled digests, cohort health trends, and CSV exports will live here."
    />
  );
}
