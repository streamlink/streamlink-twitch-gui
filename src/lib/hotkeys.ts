/** Parse and match keyboard shortcuts like `Ctrl+Shift+S`, `F5`, `Ctrl+,`. */

export function normalizeHotkey(combo: string): string {
  return combo
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const lower = p.toLowerCase();
      if (lower === "control" || lower === "ctrl") return "Ctrl";
      if (lower === "meta" || lower === "cmd" || lower === "command") return "Meta";
      if (lower === "option" || lower === "alt") return "Alt";
      if (lower === "shift") return "Shift";
      if (lower === ",") return ",";
      if (/^f\d{1,2}$/i.test(p)) return p.toUpperCase();
      return p.length === 1 ? p.toUpperCase() : p;
    })
    .join("+");
}

export function eventToHotkey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  if (e.metaKey) parts.push("Meta");

  const key = e.key;
  if (["Control", "Alt", "Shift", "Meta"].includes(key)) {
    return parts.join("+");
  }
  if (key === ",") {
    parts.push(",");
  } else if (/^f\d{1,2}$/i.test(key)) {
    parts.push(key.toUpperCase());
  } else if (key.length === 1) {
    parts.push(key.toUpperCase());
  } else {
    parts.push(key);
  }
  return parts.join("+");
}

export function matchesHotkey(e: KeyboardEvent, combo: string): boolean {
  if (!combo.trim()) return false;
  return normalizeHotkey(eventToHotkey(e)) === normalizeHotkey(combo);
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
