/**
 * Returns true if the text contains at least 2 recognisable question lines.
 * Mirrors the fingerprint logic in backend/app/utils.py.
 */
export function hasQuestions(text) {
  let count = 0;
  for (const line of text.split("\n")) {
    const s = line.trim();
    if (!s) continue;
    if (/^(Q?\d+[.)]\s|Question\s+\d+)/i.test(s)) count++;
    else if (s.endsWith("?") && s.length > 15) count++;
    if (count >= 2) return true;
  }
  return false;
}
