import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPlayers, deletePlayer } from '../../service/playerService';
import { getAllTeams } from '../../service/teamService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(' ');
}

function age(dob) {
  if (!dob) return '—';
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const teamFilter = searchParams.get('teamId') || '';

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getAllPlayers(), getAllTeams()])
      .then(([p, t]) => {
        setPlayers(p);
        setTeams(t);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => (teamFilter ? players.filter((p) => p.team?.teamId === teamFilter) : players),
    [players, teamFilter]
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      await deletePlayer(id);
      setPlayers((prev) => prev.filter((p) => p.playerId !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0">Players</h1>
        <Link to="/players/new" className="btn btn-pitch">+ New Player</Link>
      </div>

      <div className="mb-3" style={{ maxWidth: 320 }}>
        <select
          className="form-select"
          value={teamFilter}
          onChange={(e) => {
            const val = e.target.value;
            setSearchParams(val ? { teamId: val } : {});
          }}
        >
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
          ))}
        </select>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {loading ? (
        <Loading label="Loading players…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={teamFilter ? 'No players registered for this team' : 'No players yet'}
          hint="Add a player to build out a squad."
          action={<Link to="/players/new" className="btn btn-pitch">+ New Player</Link>}
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Team</th>
                <th>Nationality</th>
                <th>Age</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.playerId}>
                  <td className="fw-semibold">{fullName(p.playerName)}</td>
                  <td><span className="badge badge-pitch">{p.playerPosition}</span></td>
                  <td>{p.team?.teamName || <span className="text-muted">Unassigned</span>}</td>
                  <td>{p.playerNationality || '—'}</td>
                  <td>{age(p.playerDateOfBirth)}</td>
                  <td className="text-end">
                    <Link to={`/players/${p.playerId}/edit`} className="btn btn-sm btn-outline-pitch me-2">Edit</Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={deletingId === p.playerId}
                      onClick={() => handleDelete(p.playerId, fullName(p.playerName))}
                    >
                      {deletingId === p.playerId ? 'Deleting…' : 'Delete'}
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
