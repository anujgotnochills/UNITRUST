export const CARBON_THRESHOLDS = {
  GREEN_MAX: 0.1,
  NEUTRAL_MAX: 1.0,
} as const;

export const CARBON_TAGS = {
  GREEN: 'Green' as const,
  NEUTRAL: 'Neutral' as const,
  HIGH_IMPACT: 'High Impact' as const,
};

export const CARBON_COLORS = {
  Green: '#16A34A',
  Neutral: '#D97706',
  'High Impact': '#DC2626',
} as const;

export const CARBON_BG_COLORS = {
  Green: '#F0FDF4',
  Neutral: '#FFFBEB',
  'High Impact': '#FEF2F2',
} as const;
