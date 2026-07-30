/** Max concurrent streams in multistream (auto-tile) mode. */
export const MAX_MULTISTREAMS = 8;

/** Fraction of the primary screen reserved for Chatterino on the right. */
export const CHAT_WIDTH_FRACTION = 0.18;

export type MultistreamLayout =
  | "1"
  | "2"
  | "2x2"
  | "3plus1"
  | "3x2"
  | "4x2";

export const MULTISTREAM_LAYOUTS: MultistreamLayout[] = [
  "1",
  "2",
  "2x2",
  "3plus1",
  "3x2",
  "4x2",
];

export const LAYOUT_CAPACITY: Record<MultistreamLayout, number> = {
  "1": 1,
  "2": 2,
  "2x2": 4,
  "3plus1": 4,
  "3x2": 6,
  "4x2": 8,
};

export const DEFAULT_MULTISTREAM_LAYOUT: MultistreamLayout = "2x2";

export function isMultistreamLayout(value: string): value is MultistreamLayout {
  return (MULTISTREAM_LAYOUTS as string[]).includes(value);
}

export function layoutCapacity(layout: MultistreamLayout): number {
  return LAYOUT_CAPACITY[layout];
}

export interface TileRect {
  /** Pixel x */
  x: number;
  /** Pixel y */
  y: number;
  /** Pixel width */
  w: number;
  /** Pixel height */
  h: number;
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
    case "3plus1":
      return { cols: 2, rows: 2 }; // unused — special-cased
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
): Array<{ x: number; y: number; w: number; h: number }> {
  const cap = LAYOUT_CAPACITY[layout];
  const n = Math.max(0, Math.min(count, cap, MAX_MULTISTREAMS));
  const videoW = reserveChat ? 1 - CHAT_WIDTH_FRACTION : 1;
  const out: Array<{ x: number; y: number; w: number; h: number }> = [];

  if (layout === "3plus1") {
    const mainW = (videoW * 2) / 3;
    const sideW = videoW - mainW;
    if (n >= 1) {
      out.push({ x: 0, y: 0, w: mainW, h: 1 });
    }
    for (let i = 1; i < n; i++) {
      out.push({
        x: mainW,
        y: (i - 1) / 3,
        w: sideW,
        h: 1 / 3,
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
