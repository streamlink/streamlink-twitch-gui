import { describe, expect, it } from "vitest";
import {
  completeWebsiteAuthSave,
  websiteAuthLabel,
  type TwitchWebsiteAuthStatus,
} from "./website";

const status: TwitchWebsiteAuthStatus = {
  configured: true,
  login: "janik",
  userId: "1234",
  streamlinkConfigured: true,
  configPath: "C:/Users/Janik/AppData/Roaming/streamlink/config.twitch",
};

describe("website playback auth UI state", () => {
  it("clears the submitted secret after a successful save", () => {
    const next = completeWebsiteAuthSave("super-secret-token", status);

    expect(next.token).toBe("");
    expect(next.status).toEqual(status);
    expect(JSON.stringify(next)).not.toContain("super-secret-token");
  });

  it("summarizes connection metadata without including credentials", () => {
    const label = websiteAuthLabel(status);

    expect(label).toContain("janik");
    expect(label).toContain("connected");
    expect(label).not.toContain("OAuth");
    expect(label).not.toContain("token");
  });
});
