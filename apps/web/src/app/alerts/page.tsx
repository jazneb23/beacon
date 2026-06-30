import { Bell } from "lucide-react";
import type { ReactElement } from "react";

import { EmptyState } from "../../components/ui/EmptyState";

export default function AlertsPage(): ReactElement {
  return (
    <EmptyState
      icon={Bell}
      title="No alerts configured"
      subtitle="Set up alert rules to be notified when accounts drop into the at-risk band or stop sending signals."
    />
  );
}
