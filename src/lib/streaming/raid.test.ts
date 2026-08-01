import { describe, expect, it } from "vitest";
import { enqueueRaid, raidDedupeKey, type RaidOutgoingEvent } from "./raid";

const base = (over: Partial<RaidOutgoingEvent> = {}): RaidOutgoingEvent => ({
  fromChannel: "alice",
  toChannel: "bob",
  toUserId: "123",
  viewers: 10,
  ...over,
});

describe("raid helpers", () => {
  it("builds a stable dedupe key", () => {
    expect(raidDedupeKey(base())).toBe("alice->bob");
    expect(raidDedupeKey(base({ fromChannel: "Alice", toChannel: "BOB" }))).toBe(
      "alice->bob",
    );
  });

  it("enqueues and lowercases logins", () => {
    const q = enqueueRaid([], base({ fromChannel: "Alice", toChannel: "Bob" }));
    expect(q).toEqual([
      { fromChannel: "alice", toChannel: "bob", toUserId: "123", viewers: 10 },
    ]);
  });

  it("ignores duplicate from→to", () => {
    const q1 = enqueueRaid([], base());
    const q2 = enqueueRaid(q1, base({ viewers: 99 }));
    expect(q2).toHaveLength(1);
    expect(q2[0].viewers).toBe(10);
  });

  it("queues a different from channel", () => {
    const q = enqueueRaid(
      enqueueRaid([], base()),
      base({ fromChannel: "carol", toChannel: "dave", toUserId: "9" }),
    );
    expect(q).toHaveLength(2);
    expect(q.map((e) => e.fromChannel)).toEqual(["alice", "carol"]);
  });
});
