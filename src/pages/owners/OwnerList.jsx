import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOwners, deleteOwner } from '../../service/ownerService';
import { getAllTeams } from '../../service/teamService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import { formatCurrency } from '../../utils/format';

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(' ');
}

export default function OwnerList() {
  const [owners, setOwners] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getAllOwners(), getAllTeams()])
      .then(([o, t]) => {
        setOwners(o);
        setTeams(t);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  // Owner.ownedTeams is @JsonIgnore'd server-side (avoids Team -> Owner -> Team recursion),
  // so we derive it here from each Team's (non-ignored) owner reference instead.
  const ownedTeamNames = (ownerId) => teams.filter((t) => t.owner?.ownerId === ownerId).map((t) => t.teamName);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete owner ${name}? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteOwner(id);
      setOwners((prev) => prev.filter((o) => o.ownerId !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Owners</h1>
        <Link to="/owners/new" className="btn btn-pitch">+ New Owner</Link>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {loading ? (
        <Loading label="Loading owners…" />
      ) : owners.length === 0 ? (
        <EmptyState
          title="No owners yet"
          hint="Add an owner, then assign them to a team from the team's edit page."
          action={<Link to="/owners/new" className="btn btn-pitch">+ New Owner</Link>}
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead>
              <tr>
                <th>Name</th><th>Type</th><th>Strategy</th><th>Reputation</th>
                <th>Net worth</th><th>Available funds</th><th>Owned teams</th><th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.ownerId}>
                  <td className="fw-semibold">{fullName(o.ownerName)}</td>
                  <td><span className="badge badge-pitch">{o.ownershipType?.replace(/_/g, ' ')}</span></td>
                  <td>{o.strategy?.replace(/_/g, ' ')}</td>
                  <td>{o.reputation}/100</td>
                  <td>{formatCurrency(o.netWorth)}</td>
                  <td>{formatCurrency(o.availableFunds)}</td>
                  <td>{ownedTeamNames(o.ownerId).join(', ') || '—'}</td>
                  <td className="text-end">
                    <Link to={`/owners/${o.ownerId}/edit`} className="btn btn-sm btn-outline-pitch me-2">Edit</Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={deletingId === o.ownerId}
                      onClick={() => handleDelete(o.ownerId, fullName(o.ownerName))}
                    >
                      {deletingId === o.ownerId ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
