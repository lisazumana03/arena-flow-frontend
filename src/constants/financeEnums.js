// Mirrors backend enum metadata (ObjectiveType, OwnerStrategy, OwnershipType,
// TransferStatus, TransferType, TransferWindowType) — the API only serialises the enum
// name (e.g. "WIN_LEAGUE"), so display labels live here on the frontend.

export const OBJECTIVE_TYPES = [
  ['WIN_LEAGUE', 'Win League'],
  ['QUALIFY_FOR_CONTINENTAL_COMPETITION', 'Qualify for Continental Competition'],
  ['AVOID_RELEGATION', 'Avoid Relegation'],
  ['WIN_DOMESTIC_CUP', 'Win Domestic Cup'],
  ['ACHIEVE_PLAYOFF_SPOT', 'Achieve Playoff Spot'],
  ['DEVELOP_YOUNG_PLAYERS', 'Develop Young Players'],
  ['IMPROVE_FINANCIAL_STABILITY', 'Improve Financial Stability'],
  ['ESTABLISH_WINNING_CULTURE', 'Establish Winning Culture'],
  ['EXPAND_STADIUM', 'Expand Stadium'],
  ['WIN_CONTINENTAL_TROPHY', 'Win Continental Trophy'],
  ['REACH_SPECIFIC_LEAGUE_POSITION', 'Reach Specific League Position'],
  ['INCREASE_CLUB_VALUE', 'Increase Club Value'],
  ['ACHIEVE_BREAK_EVEN_BUDGET', 'Achieve Break-Even Budget'],
  ['ATTRACT_SPONSORSHIPS', 'Attract Sponsorships'],
  ['BUILD_ACADEMY', 'Build Academy'],
];

export const OWNERSHIP_TYPES = [
  'PRIVATE_OWNER', 'COMPANY', 'CONSORTIUM', 'SUPPORTERS_TRUST',
  'MUNICIPALITY', 'PRIMARY_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY', 'GOVERNMENT',
];

export const OWNER_STRATEGIES = [
  ['AGGRESSIVE_SPENDING', 'Aggressive Spending'],
  ['YOUTH_DEVELOPMENT', 'Youth Development'],
  ['INFRASTRUCTURE_INVESTMENT', 'Infrastructure Investment'],
  ['CONSERVATIVE_SPENDING', 'Conservative Spending'],
  ['COMMUNITY_ENGAGEMENT', 'Community Engagement'],
  ['SUSTAINABILITY_FOCUS', 'Sustainability Focus'],
  ['BRAND_EXPANSION', 'Brand Expansion'],
  ['MERGERS_AND_ACQUISITIONS', 'Mergers & Acquisitions'],
  ['PROFIT_FOCUS', 'Profit Focus'],
  ['BALANCED_APPROACH', 'Balanced Approach'],
  ['SURVIVAL_MODE', 'Survival Mode'],
];

// Order matters: a Transfer can only move one tier forward, or collapse (see backend TransferStatus.canAdvanceTo).
export const TRANSFER_STATUS_ORDER = [
  'RUMOURED', 'IN_TALKS', 'AGREEMENT_REACHED', 'HERE_WE_GO', 'MEDICAL_SCHEDULED', 'OFFICIAL',
];

export function nextTransferStatuses(current) {
  if (current === 'OFFICIAL' || current === 'DEAL_COLLAPSED') return [];
  const idx = TRANSFER_STATUS_ORDER.indexOf(current);
  const options = ['DEAL_COLLAPSED'];
  if (idx >= 0 && idx + 1 < TRANSFER_STATUS_ORDER.length) options.unshift(TRANSFER_STATUS_ORDER[idx + 1]);
  return options;
}

export const TRANSFER_TYPES = [
  ['PERMANENT', 'Permanent'],
  ['LOAN', 'Loan'],
  ['LOAN_WITH_OPTION', 'Loan with option to buy'],
  ['FREE', 'Free transfer'],
];

export const TRANSFER_WINDOW_TYPES = ['SUMMER', 'WINTER'];

export const FINANCIAL_HEALTH_CLASS = {
  EXCELLENT: 'text-bg-success',
  HEALTHY: 'text-bg-success',
  STABLE: 'text-bg-info',
  CAUTION: 'text-bg-warning',
  AT_RISK: 'text-bg-danger',
  CRITICAL: 'text-bg-danger',
  INSOLVENT: 'text-bg-dark',
};
