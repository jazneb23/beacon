import { BookOpen } from "lucide-react";
import type { ReactElement } from "react";

import { EmptyState } from "../../components/ui/EmptyState";

export default function PlaybooksPage(): ReactElement {
  return (
    <EmptyState
      icon={BookOpen}
      title="Automate customer success playbooks"
      subtitle="Trigger outreach, tasks, and escalations automatically when health signals fire."
    />
  );
}
