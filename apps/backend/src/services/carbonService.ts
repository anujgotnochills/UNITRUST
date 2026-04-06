/**
 * Determines sustainability tag from carbon score
 */
export function getTagFromScore(score: number): 'Green' | 'Neutral' | 'High Impact' {
  if (score < 0.1) return 'Green';
  if (score <= 1.0) return 'Neutral';
  return 'High Impact';
}

/**
 * Validates and normalizes carbon data
 */
export function normalizeCarbonData(carbonScore?: number, sustainabilityTag?: string): {
  carbonScore: number;
  sustainabilityTag: string;
} {
  const score = carbonScore ?? 0;
  const tag = sustainabilityTag || getTagFromScore(score);
  return { carbonScore: score, sustainabilityTag: tag };
}
