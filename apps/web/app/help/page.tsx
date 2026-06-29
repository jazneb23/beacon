import { HelpCircle } from "lucide-react";
import type { ReactElement } from "react";

import { EmptyState } from "../../src/components/ui/EmptyState";

export default function HelpPage(): ReactElement {
  return (
    <EmptyState
      icon={HelpCircle}
      title="Need a hand?"
      subtitle="Browse the documentation or reach out to the Beacon team — support resources are on the way."
    />
  );
}
