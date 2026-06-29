import type { SignalFeedItem } from "@beacon/shared";
import { describe, expect, it } from "vitest";

import { groupSignalsByTime } from "./groupSignalsByTime";

function item(id: number, secondsAgo: number, now: Date): SignalFeedItem {
  return {
    id,
    accountId: "acct-x",
    accountName: "Account X",
    type: "usage",
    value: 50,
    at: new Date(now.getTime() - secondsAgo * 1000).toISOString(),
  };
}

describe("groupSignalsByTime", () => {
  it("buckets items by recency and drops empty groups", () => {
    const now = new Date("2026-06-28T12:00:00.000Z");
    const items = [
      item(1, 10, now),
      item(2, 90, now),
      item(3, 200, now),
      item(4, 1000, now),
    ];

    const groups = groupSignalsByTime(items, now);
    expect(groups.map((g) => g.label)).toEqual([
      "Just now",
      "Last minute",
      "Last 5 minutes",
      "Earlier",
    ]);
    expect(groups[0].items.map((i) => i.id)).toEqual([1]);
  });

  it("returns no groups for an empty feed", () => {
    expect(groupSignalsByTime([], new Date())).toEqual([]);
  });
});
