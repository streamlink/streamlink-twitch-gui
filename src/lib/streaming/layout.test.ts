import { describe, expect, it } from "vitest";
import {
  CHAT_WIDTH_FRACTION,
  LAYOUT_CAPACITY,
  MAX_MULTISTREAMS,
  computePresetTileFractions,
  computeTileFractions,
  mpvGeometryPercent,
} from "./layout";

describe("computeTileFractions", () => {
  it("caps at MAX_MULTISTREAMS", () => {
    expect(computeTileFractions(99, false)).toHaveLength(MAX_MULTISTREAMS);
  });

  it("reserves chat width on the right", () => {
    const [tile] = computeTileFractions(1, true);
    expect(tile!.w).toBeCloseTo(1 - CHAT_WIDTH_FRACTION);
    expect(tile!.x).toBe(0);
  });

  it("tiles two streams side by side in the video region", () => {
    const tiles = computeTileFractions(2, true);
    expect(tiles).toHaveLength(2);
    expect(tiles[0]!.x).toBe(0);
    expect(tiles[1]!.x).toBeCloseTo(tiles[0]!.w);
    expect(tiles[0]!.w + tiles[1]!.w).toBeCloseTo(1 - CHAT_WIDTH_FRACTION);
  });
});

describe("computePresetTileFractions", () => {
  it("respects layout capacity", () => {
    expect(computePresetTileFractions("2", 8, false)).toHaveLength(2);
    expect(computePresetTileFractions("2x2", 8, false)).toHaveLength(4);
    expect(LAYOUT_CAPACITY["4x2"]).toBe(8);
  });

  it("places 3plus1 as large left + three stacked right", () => {
    const tiles = computePresetTileFractions("3plus1", 4, true);
    expect(tiles).toHaveLength(4);
    const videoW = 1 - CHAT_WIDTH_FRACTION;
    expect(tiles[0]!.w).toBeCloseTo((videoW * 2) / 3);
    expect(tiles[0]!.h).toBe(1);
    expect(tiles[1]!.x).toBeCloseTo(tiles[0]!.w);
    expect(tiles[1]!.h).toBeCloseTo(1 / 3);
    expect(tiles[2]!.y).toBeCloseTo(1 / 3);
    expect(tiles[3]!.y).toBeCloseTo(2 / 3);
  });

  it("places 2plus1 as large left + two stacked right", () => {
    const tiles = computePresetTileFractions("2plus1", 3, true);
    expect(tiles).toHaveLength(3);
    const videoW = 1 - CHAT_WIDTH_FRACTION;
    expect(tiles[0]!.w).toBeCloseTo((videoW * 2) / 3);
    expect(tiles[0]!.h).toBe(1);
    expect(tiles[1]!.h).toBeCloseTo(0.5);
    expect(tiles[2]!.y).toBeCloseTo(0.5);
  });

  it("places 8x1 as eight columns", () => {
    const tiles = computePresetTileFractions("8x1", 8, false);
    expect(tiles).toHaveLength(8);
    expect(tiles[0]!.w).toBeCloseTo(0.125);
    expect(tiles[0]!.h).toBe(1);
    expect(tiles[7]!.x).toBeCloseTo(0.875);
  });

  it("keeps 2x2 cell shape even with only two streams", () => {
    const tiles = computePresetTileFractions("2x2", 2, false);
    expect(tiles).toHaveLength(2);
    expect(tiles[0]!.w).toBeCloseTo(0.5);
    expect(tiles[0]!.h).toBeCloseTo(0.5);
    expect(tiles[1]!.x).toBeCloseTo(0.5);
    expect(tiles[1]!.y).toBe(0);
  });
});

describe("mpvGeometryPercent", () => {
  it("formats percent geometry for mpv", () => {
    expect(
      mpvGeometryPercent({ x: 0, y: 0, w: 0.82, h: 1 }),
    ).toBe("--geometry=82%x100%+0%+0%");
  });
});
