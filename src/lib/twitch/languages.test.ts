import { describe, expect, it } from "vitest";
import {
  languageLabel,
  languagesQueryKey,
  summarizeLanguages,
} from "./languages";

describe("languages helpers", () => {
  it("labels known codes and falls back to the code", () => {
    expect(languageLabel("en")).toBe("English");
    expect(languageLabel("zz")).toBe("zz");
  });

  it("builds a stable query key", () => {
    expect(languagesQueryKey(["de", "en", "de"])).toBe("de,en");
    expect(languagesQueryKey([])).toBe("");
  });

  it("summarizes selection for the filter button", () => {
    expect(summarizeLanguages([], "All languages")).toBe("All languages");
    expect(summarizeLanguages(["en"], "All languages")).toBe("English");
    expect(summarizeLanguages(["en", "de"], "All languages")).toBe("English +1");
  });
});
