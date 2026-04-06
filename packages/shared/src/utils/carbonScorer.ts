import {
  CARBON_DATABASE,
  CATEGORY_DEFAULTS,
  GLOBAL_FALLBACK,
  type SustainabilityTag,
} from '../constants/carbonDatabase';

export interface CarbonScoreResult {
  carbonScore: number;
  sustainabilityTag: SustainabilityTag;
  matched: boolean;           // true = keyword hit, false = fallback used
  matchedLabel: string;       // human-readable label explaining the match
  matchSource: 'keyword' | 'category_default' | 'global_default';
}

/**
 * Auto-calculates carbon score from asset name + category.
 *
 * Priority:
 *   1. Exact keyword match (longest keyword first for accuracy)
 *   2. Category-level fallback
 *   3. Global fallback (unknown item / unknown category)
 *
 * All matching is case-insensitive.
 */
export function calculateCarbonScore(assetName: string, category: string): CarbonScoreResult {
  const nameLower = assetName.toLowerCase().trim();
  const categoryTrimmed = category.trim();

  // Edge case: empty asset name — use category default directly
  if (!nameLower) {
    return getCategoryFallback(categoryTrimmed);
  }

  // Step 1: Filter entries matching the category first for tighter scope
  const categoryEntries = CARBON_DATABASE.filter(
    (entry) => entry.category.toLowerCase() === categoryTrimmed.toLowerCase()
  );

  // Step 2: Try matching keywords within category-scoped entries
  const categoryMatch = findBestMatch(nameLower, categoryEntries);
  if (categoryMatch) {
    return {
      carbonScore: categoryMatch.carbonScore,
      sustainabilityTag: categoryMatch.sustainabilityTag,
      matched: true,
      matchedLabel: categoryMatch.label,
      matchSource: 'keyword',
    };
  }

  // Step 3: Try matching ALL entries (cross-category) in case user
  // picked wrong category but the item name is recognizable
  const globalMatch = findBestMatch(nameLower, CARBON_DATABASE);
  if (globalMatch) {
    return {
      carbonScore: globalMatch.carbonScore,
      sustainabilityTag: globalMatch.sustainabilityTag,
      matched: true,
      matchedLabel: `${globalMatch.label} (matched from ${globalMatch.category})`,
      matchSource: 'keyword',
    };
  }

  // Step 4: No keyword match — use category fallback
  return getCategoryFallback(categoryTrimmed);
}

/**
 * Finds the best matching entry by checking all keywords.
 * Prefers longer keyword matches (more specific).
 */
function findBestMatch(
  nameLower: string,
  entries: typeof CARBON_DATABASE
): typeof CARBON_DATABASE[number] | null {
  let bestMatch: typeof CARBON_DATABASE[number] | null = null;
  let bestKeywordLength = 0;

  for (const entry of entries) {
    for (const keyword of entry.keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        // Prefer longer keyword matches (e.g., "electric car" > "car")
        if (keyword.length > bestKeywordLength) {
          bestKeywordLength = keyword.length;
          bestMatch = entry;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Returns category-level fallback, or global fallback if category unknown
 */
function getCategoryFallback(category: string): CarbonScoreResult {
  const catDefault = CATEGORY_DEFAULTS[category];

  if (catDefault) {
    return {
      carbonScore: catDefault.carbonScore,
      sustainabilityTag: catDefault.sustainabilityTag,
      matched: false,
      matchedLabel: catDefault.label,
      matchSource: 'category_default',
    };
  }

  // Unknown category — global fallback
  return {
    carbonScore: GLOBAL_FALLBACK.carbonScore,
    sustainabilityTag: GLOBAL_FALLBACK.sustainabilityTag,
    matched: false,
    matchedLabel: GLOBAL_FALLBACK.label,
    matchSource: 'global_default',
  };
}
