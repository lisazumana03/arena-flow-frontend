// Colour-coded status pills reused across matches, seasons and tournament entries.

const MATCH_STATUS_CLASS = {
  SCHEDULED: 'text-bg-secondary',
  IN_PROGRESS: 'text-bg-warning',
  COMPLETED: 'text-bg-success',
  POSTPONED: 'text-bg-info',
  CANCELLED: 'text-bg-danger',
};

export function MatchStatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge ${MATCH_STATUS_CLASS[status] || 'text-bg-secondary'}`}>{status.replace('_', ' ')}</span>;
}

const QUALIFICATION_CLASS = {
  REGISTERED: 'text-bg-secondary',
  GROUP_STAGE: 'text-bg-info',
  ROUND_OF_16: 'text-bg-info',
  QUARTERFINALIST: 'text-bg-primary',
  SEMIFINALIST: 'text-bg-primary',
  RUNNER_UP: 'badge-pitch',
  CHAMPION: 'badge-pitch',
  QUALIFIED: 'text-bg-success',
  ELIMINATED: 'text-bg-danger',
  WITHDRAWN: 'text-bg-dark',
};

export function QualificationBadge({ status }) {
  if (!status) return <span className="badge text-bg-secondary">—</span>;
  return <span className={`badge ${QUALIFICATION_CLASS[status] || 'text-bg-secondary'}`}>{status.replace(/_/g, ' ')}</span>;
}

const SEASON_STATUS_CLASS = {
  UPCOMING: 'text-bg-secondary',
  IN_PROGRESS: 'text-bg-warning',
  COMPLETED: 'text-bg-success',
};

export function SeasonStatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge ${SEASON_STATUS_CLASS[status] || 'text-bg-secondary'}`}>{status.replace('_', ' ')}</span>;
}

const TRANSFER_STATUS_CLASS = {
  RUMOURED: 'text-bg-secondary',
  IN_TALKS: 'text-bg-info',
  AGREEMENT_REACHED: 'text-bg-info',
  HERE_WE_GO: 'text-bg-warning',
  MEDICAL_SCHEDULED: 'text-bg-warning',
  OFFICIAL: 'text-bg-success',
  DEAL_COLLAPSED: 'text-bg-danger',
};

export function TransferStatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge ${TRANSFER_STATUS_CLASS[status] || 'text-bg-secondary'}`}>{status.replace(/_/g, ' ')}</span>;
}
