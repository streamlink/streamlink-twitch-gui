/** Max concurrent streams in multistream (auto-tile) mode. */
export const MAX_MULTISTREAMS = 8;

/** Fraction of the primary screen reserved for Chatterino on the right. */
export const CHAT_WIDTH_FRACTION = 0.18;

export type MultistreamLayout =
  | "1"
  | "2"
  | "2plus1"
  | "2x2"
  | "3plus1"
  | "3x2"
  | "4x2"
  | "8x1";

/** Where the large pane sits for 2+1 / 3+1. */
export type UnevenMainSide = "left" | "right" | "top" | "bottom";

export const UNEVEN_MAIN_SIDES: UnevenMainSide[] = [
  "left",
  "right",
  "top",
  "bottom",
];

export const DEFAULT_UNEVEN_MAIN_SIDE: UnevenMainSide = "left";

export function isUnevenMainSide(value: string): value is UnevenMainSide {
  return (UNEVEN_MAIN_SIDES as string[]).includes(value);
}

export const MULTISTREAM_LAYOUTS: MultistreamLayout[] = [
  "1",
  "2",
  "2plus1",
  "2x2",
  "3plus1",
  "3x2",
  "4x2",
  "8x1",
];

export const LAYOUT_CAPACITY: Record<MultistreamLayout, number> = {
  "1": 1,
  "2": 2,
  "2plus1": 3,
  "2x2": 4,
  "3plus1": 4,
  "3x2": 6,
  "4x2": 8,
  "8x1": 8,
};

export const DEFAULT_MULTISTREAM_LAYOUT: MultistreamLayout = "2x2";

export function isMultistreamLayout(value: string): value is MultistreamLayout {
  return (MULTISTREAM_LAYOUTS as string[]).includes(value);
}

export function layoutCapacity(layout: MultistreamLayout): number {
  return LAYOUT_CAPACITY[layout];
}

export function isUnevenLayout(layout: MultistreamLayout): boolean {
  return layout === "2plus1" || layout === "3plus1";
}

function layoutGrid(layout: MultistreamLayout): { cols: number; rows: number } {
  switch (layout) {
    case "1":
      return { cols: 1, rows: 1 };
    case "2":
      return { cols: 2, rows: 1 };
    case "2x2":
      return { cols: 2, rows: 2 };
    case "3x2":
      return { cols: 3, rows: 2 };
    case "4x2":
      return { cols: 4, rows: 2 };
    case "8x1":
      return { cols: 8, rows: 1 };
    case "2plus1":
    case "3plus1":
      return { cols: 2, rows: 2 };
  }
}

/**
 * Tile fractions for the first `count` slots of a fixed preset
 * (within the left video region when `reserveChat`).
 */
export function computePresetTileFractions(
  layout: MultistreamLayout,
  count: number,
  reserveChat: boolean,
  mainSide: UnevenMainSide = DEFAULT_UNEVEN_MAIN_SIDE,
): Array<{ x: number; y: number; w: number; h: number }> {
  const cap = LAYOUT_CAPACITY[layout];
  const n = Math.max(0, Math.min(count, cap, MAX_MULTISTREAMS));
  const videoW = reserveChat ? 1 - CHAT_WIDTH_FRACTION : 1;
  const out: Array<{ x: number; y: number; w: number; h: number }> = [];

  if (layout === "3plus1" || layout === "2plus1") {
    const stackN = layout === "2plus1" ? 2 : 3;
    const mainFrac = 2 / 3;
    if (mainSide === "left" || mainSide === "right") {
      const mainW = videoW * mainFrac;
      const sideW = videoW - mainW;
      const mainX = mainSide === "left" ? 0 : sideW;
      const stackX = mainSide === "left" ? mainW : 0;
      if (n >= 1) {
        out.push({ x: mainX, y: 0, w: mainW, h: 1 });
      }
      for (let i = 1; i < n; i++) {
        out.push({
          x: stackX,
          y: (i - 1) / stackN,
          w: sideW,
          h: 1 / stackN,
        });
      }
      return out;
    }
    // top / bottom
    const mainH = mainFrac;
    const sideH = 1 - mainH;
    const mainY = mainSide === "top" ? 0 : sideH;
    const stackY = mainSide === "top" ? mainH : 0;
    if (n >= 1) {
      out.push({ x: 0, y: mainY, w: videoW, h: mainH });
    }
    for (let i = 1; i < n; i++) {
      out.push({
        x: ((i - 1) / stackN) * videoW,
        y: stackY,
        w: videoW / stackN,
        h: sideH,
      });
    }
    return out;
  }

  const { cols, rows } = layoutGrid(layout);
  const cellW = videoW / cols;
  const cellH = 1 / rows;
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out.push({
      x: col * cellW,
      y: row * cellH,
      w: cellW,
      h: cellH,
    });
  }
  return out;
}

/** @deprecated Prefer computePresetTileFractions — auto grid from count only. */
export function computeTileFractions(
  count: number,
  reserveChat: boolean,
): Array<{ x: number; y: number; w: number; h: number }> {
  const n = Math.max(1, Math.min(MAX_MULTISTREAMS, count));
  let layout: MultistreamLayout = "1";
  if (n <= 1) layout = "1";
  else if (n === 2) layout = "2";
  else if (n === 3) layout = "2plus1";
  else if (n <= 4) layout = "2x2";
  else if (n <= 6) layout = "3x2";
  else layout = "4x2";
  return computePresetTileFractions(layout, n, reserveChat);
}

/** mpv --geometry using percent-of-desktop (mpv accepts W%×H%+X%+Y%). */
export function mpvGeometryPercent(tile: {
  x: number;
  y: number;
  w: number;
  h: number;
}): string {
  const w = Math.max(1, Math.round(tile.w * 100));
  const h = Math.max(1, Math.round(tile.h * 100));
  const x = Math.max(0, Math.round(tile.x * 100));
  const y = Math.max(0, Math.round(tile.y * 100));
  return `--geometry=${w}%x${h}%+${x}%+${y}%`;
}
