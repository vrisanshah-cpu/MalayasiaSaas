import type { FlaggedPhrase } from "./compliance-schema";

export type HighlightSegment =
  | { type: "text"; text: string }
  | { type: "flag"; text: string; flag: FlaggedPhrase };

/**
 * Splits `text` into plain/flagged segments so the UI can render the
 * original ad copy with flagged phrases wrapped in a tooltip-bearing <mark>.
 * Matches case-insensitively; when phrases overlap, the earliest/longest
 * match wins and later overlapping matches are dropped rather than nested.
 */
export function highlightPhrases(
  text: string,
  flags: FlaggedPhrase[]
): HighlightSegment[] {
  type Range = { start: number; end: number; flag: FlaggedPhrase };
  const ranges: Range[] = [];

  for (const flag of flags) {
    const phrase = flag.phrase.trim();
    if (!phrase) continue;
    const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
    if (idx === -1) continue;
    ranges.push({ start: idx, end: idx + phrase.length, flag });
  }

  ranges.sort((a, b) => a.start - b.start || b.end - a.end);

  const resolved: Range[] = [];
  let lastEnd = -1;
  for (const range of ranges) {
    if (range.start >= lastEnd) {
      resolved.push(range);
      lastEnd = range.end;
    }
  }

  if (resolved.length === 0) {
    return [{ type: "text", text }];
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const range of resolved) {
    if (range.start > cursor) {
      segments.push({ type: "text", text: text.slice(cursor, range.start) });
    }
    segments.push({
      type: "flag",
      text: text.slice(range.start, range.end),
      flag: range.flag,
    });
    cursor = range.end;
  }
  if (cursor < text.length) {
    segments.push({ type: "text", text: text.slice(cursor) });
  }

  return segments;
}
