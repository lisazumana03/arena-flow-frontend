import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTeams, deleteTeam } from '../../service/teamService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import LogoBadge from '../../components/LogoBadge';

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    getAllTeams()
      .then(setTeams)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.teamId !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Teams</h1>
        <Link to="/teams/new" className="btn btn-pitch">+ New Team</Link>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {loading ? (
        <Loading label="Loading teams…" />
      ) : teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          hint="Add the first club or national side to get started."
          action={<Link to="/teams/new" className="btn btn-pitch">+ New Team</Link>}
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Side</th>
                <th>Nationality</th>
                <th>Academy</th>
                <th>Formed</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.teamId}>
                  <td className="fw-semibold">
                    <div className="d-flex align-items-center gap-2">
                      <LogoBadge base64={t.teamLogo} size={28} alt={t.teamName} />
                      {t.teamName}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.teamType === 'NATIONAL' ? 'text-bg-primary' : 'badge-pitch'}`}>
                      {t.teamType}
                    </span>
                  </td>
                  <td>{t.teamGender === 'FEMALE' ? 'Female' : 'Male'}</td>
                  <td>{t.teamNationality || '—'}</td>
                  <td>{t.teamType === 'CLUB' ? (t.hasYouthAcademy ? 'Yes' : 'No') : '—'}</td>
                  <td>{t.teamFormationYear}</td>
                  <td className="text-end">
                    <Link to={`/teams/${t.teamId}/edit`} className="btn btn-sm btn-outline-pitch me-2">Edit</Link>
                    <Link to={`/players?teamId=${t.teamId}`} className="btn btn-sm btn-outline-secondary me-2">Squad</Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={deletingId === t.teamId}
                      onClick={() => handleDelete(t.teamId, t.teamName)}
                    >
                      {deletingId === t.teamId ? 'Deleting…' : 'Delete'}
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
