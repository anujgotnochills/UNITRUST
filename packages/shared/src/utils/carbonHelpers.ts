import { CARBON_THRESHOLDS, CARBON_TAGS, CARBON_COLORS, CARBON_BG_COLORS } from '../constants/carbonTags';

/**
 * Converts a carbon score to a sustainability tag
 */
export function scoreToTag(score: number): 'Green' | 'Neutral' | 'High Impact' {
  if (score < CARBON_THRESHOLDS.GREEN_MAX) return CARBON_TAGS.GREEN;
  if (score <= CARBON_THRESHOLDS.NEUTRAL_MAX) return CARBON_TAGS.NEUTRAL;
  return CARBON_TAGS.HIGH_IMPACT;
}

/**
 * Returns the badge color for a sustainability tag
 */
export function tagToColor(tag: string): string {
  return CARBON_COLORS[tag as keyof typeof CARBON_COLORS] || CARBON_COLORS.Neutral;
}

/**
 * Returns the badge background color for a sustainability tag
 */
export function tagToBgColor(tag: string): string {
  return CARBON_BG_COLORS[tag as keyof typeof CARBON_BG_COLORS] || CARBON_BG_COLORS.Neutral;
}
