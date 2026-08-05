import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUpcomingMatches, getCompletedMatches } from '../../service/matchService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import { MatchStatusBadge } from '../../components/Badges';

export default function MatchList() {
  const [tab, setTab] = useState('upcoming');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (which) => {
    setLoading(true);
    setError('');
    const fetcher = which === 'upcoming' ? getUpcomingMatches : getCompletedMatches;
    fetcher().then(setMatches).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => load(tab), [tab]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0">Matches</h1>
        <Link to="/matches/new" className="btn btn-pitch">+ Schedule Match</Link>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>Completed</button>
        </li>
      </ul>

      <ErrorBanner message={error} onRetry={() => load(tab)} />

      {loading ? (
        <Loading label="Loading matches…" />
      ) : matches.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming matches' : 'No completed matches yet'}
          action={<Link to="/matches/new" className="btn btn-pitch">+ Schedule Match</Link>}
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead>
              <tr><th>Fixture</th><th>Date</th><th>Venue</th><th>Status</th><th>Score</th><th></th></tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.matchId}>
                  <td className="fw-semibold">{m.homeTeam?.teamName} vs {m.awayTeam?.teamName}</td>
                  <td>{m.matchDate?.replace('T', ' ')}</td>
                  <td>{m.venue || '—'}</td>
                  <td><MatchStatusBadge status={m.status} /></td>
                  <td>{m.status === 'COMPLETED' ? `${m.homeScore} - ${m.awayScore}` : '—'}</td>
                  <td className="text-end"><Link to={`/matches/${m.matchId}`} className="btn btn-sm btn-outline-pitch">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
