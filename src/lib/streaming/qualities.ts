export const STREAM_QUALITIES = [
  "best",
  "1080p60",
  "1080p",
  "720p60",
  "720p",
  "480p",
  "360p",
  "160p",
  "audio_only",
  "worst",
] as const;

export type StreamQualityPreset = (typeof STREAM_QUALITIES)[number];

export function isKnownQuality(value: string): value is StreamQualityPreset {
  return (STREAM_QUALITIES as readonly string[]).includes(value);
}
