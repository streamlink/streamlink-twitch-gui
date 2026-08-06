import { describe, expect, it } from "vitest";
import {
  buildPresenceTargets,
  prunePresenceMetadata,
  type PresenceMetadata,
  type PresenceSession,
} from "./presence";

const metadata: PresenceMetadata = {
  one: {
    channelLogin: "one",
    channelId: "101",
    broadcastId: "broadcast-one",
  },
  two: {
    channelLogin: "two",
    channelId: "202",
    broadcastId: "broadcast-two",
  },
  three: {
    channelLogin: "three",
    channelId: "303",
    broadcastId: "broadcast-three",
  },
  stale: {
    channelLogin: "stale",
    channelId: "404",
    broadcastId: "broadcast-stale",
  },
};

const sessions: PresenceSession[] = [
  { id: "one", running: true, ready: true },
  { id: "two", running: true, ready: true },
  { id: "three", running: true, ready: true },
  { id: "starting", running: true, ready: false },
  { id: "ended", running: false, ready: true },
];

describe("viewer presence lifecycle", () => {
  it("prunes metadata for sessions the backend no longer owns", () => {
    const pruned = prunePresenceMetadata(metadata, sessions);

    expect(Object.keys(pruned)).toEqual(["one", "two", "three"]);
    expect(pruned.stale).toBeUndefined();
  });

  it("selects only ready running sessions and caps the request at two", () => {
    const targets = buildPresenceTargets(sessions, metadata);

    expect(targets).toEqual([
      {
        sessionId: "one",
        channelLogin: "one",
        channelId: "101",
        broadcastId: "broadcast-one",
      },
      {
        sessionId: "two",
        channelLogin: "two",
        channelId: "202",
        broadcastId: "broadcast-two",
      },
    ]);
  });

  it("uses the stable multistream slot order instead of backend map order", () => {
    const targets = buildPresenceTargets(sessions, metadata, [
      "three",
      "one",
      "two",
    ]);

    expect(targets.map((target) => target.sessionId)).toEqual(["three", "one"]);
  });

  it("ignores incomplete Twitch identifiers", () => {
    const targets = buildPresenceTargets(
      [{ id: "broken", running: true, ready: true }],
      {
        broken: {
          channelLogin: "broken",
          channelId: "",
          broadcastId: "",
        },
      },
    );

    expect(targets).toEqual([]);
  });
});
