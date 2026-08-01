import { describe, expect, it } from "vitest";
import {
  shouldNotifyFollowedLive,
  toggleMutedFollowed,
} from "./followedLive";

describe("shouldNotifyFollowedLive", () => {
  it("respects global off and mute list", () => {
    expect(
      shouldNotifyFollowedLive("forsen", {
        followedOnline: false,
        mutedFollowed: [],
      }),
    ).toBe(false);
    expect(
      shouldNotifyFollowedLive("forsen", {
        followedOnline: true,
        mutedFollowed: ["Forsen"],
      }),
    ).toBe(false);
    expect(
      shouldNotifyFollowedLive("xqc", {
        followedOnline: true,
        mutedFollowed: ["forsen"],
      }),
    ).toBe(true);
  });
});

describe("toggleMutedFollowed", () => {
  it("adds and removes muted logins", () => {
    expect(toggleMutedFollowed([], "Forsen", false)).toEqual(["forsen"]);
    expect(toggleMutedFollowed(["forsen", "xqc"], "forsen", true)).toEqual([
      "xqc",
    ]);
  });
});
