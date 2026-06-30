import type { ReactElement } from "react";

import { PageHeader } from "../../components/layout/PageHeader";
import { SignalsFeed } from "../../components/dashboard/SignalsFeed";

export default function SignalsPage(): ReactElement {
  return (
    <div>
      <PageHeader subtitle="Every event flowing in from your accounts." />
      <SignalsFeed variant="page" limit={100} />
    </div>
  );
}
