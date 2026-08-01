/** Curated Twitch broadcast language codes (Helix `language` — ISO 639-1 or `other`). */
export interface TwitchLanguage {
  code: string;
  label: string;
}

export const TWITCH_LANGUAGES: TwitchLanguage[] = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
  { code: "nl", label: "Dutch" },
  { code: "sv", label: "Swedish" },
  { code: "no", label: "Norwegian" },
  { code: "da", label: "Danish" },
  { code: "fi", label: "Finnish" },
  { code: "cs", label: "Czech" },
  { code: "hu", label: "Hungarian" },
  { code: "ro", label: "Romanian" },
  { code: "th", label: "Thai" },
  { code: "ar", label: "Arabic" },
  { code: "uk", label: "Ukrainian" },
  { code: "el", label: "Greek" },
  { code: "id", label: "Indonesian" },
  { code: "vi", label: "Vietnamese" },
  { code: "hi", label: "Hindi" },
  { code: "other", label: "Other" },
];

const LABEL_BY_CODE = new Map(
  TWITCH_LANGUAGES.map((l) => [l.code, l.label] as const),
);

export function languageLabel(code: string): string {
  const key = code.toLowerCase();
  return LABEL_BY_CODE.get(key) ?? key;
}

/** Stable key for React Query (sorted unique codes). */
export function languagesQueryKey(codes: string[]): string {
  return [...new Set(codes.map((c) => c.toLowerCase()))].sort().join(",");
}

/** Short button label: All / English / English +2 */
export function summarizeLanguages(
  codes: string[],
  allLabel: string,
): string {
  if (!codes.length) return allLabel;
  const first = languageLabel(codes[0]!);
  if (codes.length === 1) return first;
  return `${first} +${codes.length - 1}`;
}

/** Helix-accepted language token. */
export function isTwitchLanguageCode(code: string): boolean {
  return code === "other" || /^[a-z]{2}$/.test(code);
}
