import type { SignalEvent, SignalFeedItem } from "@beacon/shared";
import type { Pool } from "pg";

type SignalEventRow = {
  account_id: string;
  type: SignalEvent["type"];
  value: number;
  at: Date;
};

type SignalFeedRow = SignalEventRow & {
  id: number;
  account_name: string;
};

/** Map a database row to the shared SignalEvent type. */
function toSignalEvent(row: SignalEventRow): SignalEvent {
  return {
    accountId: row.account_id,
    type: row.type,
    value: Number(row.value),
    at: row.at.toISOString(),
  };
}

/** Insert a signal event and return the stored record. */
export async function insertSignalEvent(
  pool: Pool,
  event: SignalEvent,
): Promise<SignalEvent> {
  const result = await pool.query<SignalEventRow>(
    `INSERT INTO signal_events (account_id, type, value, at)
     VALUES ($1, $2, $3, $4)
     RETURNING account_id, type, value, at`,
    [event.accountId, event.type, event.value, event.at],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to insert signal event");
  }
  return toSignalEvent(row);
}

/** Load all signal events for an account, oldest first. */
export async function listSignalEventsForAccount(
  pool: Pool,
  accountId: string,
): Promise<SignalEvent[]> {
  const result = await pool.query<SignalEventRow>(
    `SELECT account_id, type, value, at
     FROM signal_events
     WHERE account_id = $1
     ORDER BY at ASC`,
    [accountId],
  );
  return result.rows.map(toSignalEvent);
}

/** Map a joined feed row to the shared SignalFeedItem type. */
function toSignalFeedItem(row: SignalFeedRow): SignalFeedItem {
  return {
    id: row.id,
    accountName: row.account_name,
    ...toSignalEvent(row),
  };
}

/** Load the most recent signal events across all accounts, newest first. */
export async function listRecentSignalEvents(
  pool: Pool,
  limit = 50,
): Promise<SignalFeedItem[]> {
  const result = await pool.query<SignalFeedRow>(
    `SELECT se.id, se.account_id, se.type, se.value, se.at, a.name AS account_name
     FROM signal_events se
     JOIN accounts a ON a.id = se.account_id
     ORDER BY se.at DESC, se.id DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map(toSignalFeedItem);
}
