import type { AutoEQEntry } from '../../types/autoeq';

export interface SearchResult {
  entry: AutoEQEntry;
  score: number;
}

// Source quality bonus for tiebreaking
const SOURCE_BONUS: Record<string, number> = {
  Resolve: 4,
  oratory1990: 3,
  crinacle: 2,
  Rtings: 1,
};

/**
 * Search AutoEQ entries with simple scored matching.
 *
 * Scoring:
 *   exact match       = 100
 *   starts with query = 80
 *   all words match start of name words = 60
 *   contains query    = 40
 *   all query tokens found somewhere    = 20
 */
export function searchAutoEQ(
  entries: AutoEQEntry[],
  query: string,
  limit = 50,
): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const qTokens = q.split(/\s+/);
  const results: SearchResult[] = [];

  for (const entry of entries) {
    const nameLower = entry.name.toLowerCase();
    let score = 0;

    if (nameLower === q) {
      score = 100;
    } else if (nameLower.startsWith(q)) {
      score = 80;
    } else if (allWordsMatchWordStarts(qTokens, nameLower)) {
      score = 60;
    } else if (nameLower.includes(q)) {
      score = 40;
    } else if (allTokensFound(qTokens, nameLower)) {
      score = 20;
    }

    if (score > 0) {
      // Add small source quality bonus for tiebreaking
      score += SOURCE_BONUS[entry.source] ?? 0;
      results.push({ entry, score });
    }
  }

  // Sort by score desc, then alphabetically
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.name.localeCompare(b.entry.name);
  });

  return results.slice(0, limit);
}

function allWordsMatchWordStarts(qTokens: string[], name: string): boolean {
  const nameWords = name.split(/\s+/);
  return qTokens.every(token =>
    nameWords.some(word => word.startsWith(token)),
  );
}

function allTokensFound(qTokens: string[], name: string): boolean {
  return qTokens.every(token => name.includes(token));
}
