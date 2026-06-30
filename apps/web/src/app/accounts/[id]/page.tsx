import type { ReactElement } from "react";

import { AccountDetailView } from "../../../components/accounts/AccountDetailView";

type AccountDetailPageProps = {
  params: Promise<{ id: string }>;
};

/** Dynamic route for a single account's health detail. */
export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps): Promise<ReactElement> {
  const { id } = await params;

  return <AccountDetailView accountId={id} />;
}
