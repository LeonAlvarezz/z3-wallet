export function normalizeForMatch(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[\s]+/g, " ")
      // keep letters/numbers/spaces only; makes matching tolerant to punctuation like '&'
      .replace(/[^\p{L}\p{N} ]+/gu, "")
  );
}
