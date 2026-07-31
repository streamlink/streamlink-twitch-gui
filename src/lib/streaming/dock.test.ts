import { describe, expect, it } from "vitest";

/** Mirror of Rust dock::clamp_chat_fraction for settings persistence. */
export function clampChatWidthFraction(f: number): number {
  return Math.min(0.45, Math.max(0.12, f));
}

describe("clampChatWidthFraction", () => {
  it("clamps to 12–45%", () => {
    expect(clampChatWidthFraction(0.05)).toBe(0.12);
    expect(clampChatWidthFraction(0.9)).toBe(0.45);
    expect(clampChatWidthFraction(0.18)).toBe(0.18);
  });
});
