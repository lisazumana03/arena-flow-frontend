// Small shared loading / error / empty-state blocks so every page handles
// the network round trip the same way.

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-muted py-5 justify-content-center">
      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span>{label}</span>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="text-center py-5 text-muted">
      <p className="fw-semibold mb-1">{title}</p>
      {hint && <p className="mb-3">{hint}</p>}
      {action}
    </div>
  );
}
