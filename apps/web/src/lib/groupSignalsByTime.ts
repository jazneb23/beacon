import type { SignalFeedItem } from "@beacon/shared";

export type SignalTimeGroup = {
  id: string;
  label: string;
  items: SignalFeedItem[];
};

const MINUTE_MS = 60_000;

const BUCKETS: { id: string; label: string; maxAgeMs: number }[] = [
  { id: "just-now", label: "Just now", maxAgeMs: MINUTE_MS },
  { id: "last-minute", label: "Last minute", maxAgeMs: 2 * MINUTE_MS },
  { id: "last-5", label: "Last 5 minutes", maxAgeMs: 5 * MINUTE_MS },
  { id: "earlier", label: "Earlier", maxAgeMs: Number.POSITIVE_INFINITY },
];

/** Group feed items into relative time buckets, dropping empty groups. */
export function groupSignalsByTime(
  items: SignalFeedItem[],
  now: Date = new Date(),
): SignalTimeGroup[] {
  const groups: SignalTimeGroup[] = BUCKETS.map((bucket) => ({
    id: bucket.id,
    label: bucket.label,
    items: [],
  }));

  for (const item of items) {
    const ageMs = Math.max(0, now.getTime() - new Date(item.at).getTime());
    const index = BUCKETS.findIndex((bucket) => ageMs < bucket.maxAgeMs);
    groups[index === -1 ? BUCKETS.length - 1 : index].items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
}
