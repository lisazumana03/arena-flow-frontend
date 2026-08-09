import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTeams } from '../service/teamService';
import { getAllPlayers } from '../service/playerService';
import { getAllTournaments } from '../service/tournamentService';
import { getUpcomingMatches } from '../service/matchService';
import LogoBadge from '../components/LogoBadge';

export default function Menu() {
  const [counts, setCounts] = useState({ teams: null, players: null, tournaments: null });
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    getAllTeams().then((t) => setCounts((c) => ({ ...c, teams: t.length }))).catch(() => {});
    getAllPlayers().then((p) => setCounts((c) => ({ ...c, players: p.length }))).catch(() => {});
    getAllTournaments().then((t) => setCounts((c) => ({ ...c, tournaments: t.length }))).catch(() => {});
    getUpcomingMatches().then((m) => setUpcoming(m.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div>
      <div className="pitch-bg p-5 mb-4 text-center">
        <h1 className="fw-bold mb-2">Welcome to ArenaFlow</h1>
        <p className="mb-0 fs-5">Manage tournaments, teams, players and matchday results — end to end.</p>
      </div>

      <div className="container">
        <div className="row g-3 mb-4">
          <StatCard label="Teams" value={counts.teams} to="/teams" />
          <StatCard label="Players" value={counts.players} to="/players" />
          <StatCard label="Tournaments" value={counts.tournaments} to="/tournaments" />
        </div>

        <div className="row g-3">
          <div className="col-lg-7">
            <div className="card card-pitch h-100">
              <div className="card-header">Get set up</div>
              <div className="card-body">
                <ol className="mb-0">
                  <li className="mb-2">Add your <Link to="/teams">teams</Link> and <Link to="/players">players</Link>.</li>
                  <li className="mb-2">Create a <Link to="/tournaments">tournament</Link> (e.g. "Premier League") and add a yearly edition to it.</li>
                  <li className="mb-2">Register teams into the edition and, for group formats, assign them to groups.</li>
                  <li className="mb-2">Start the edition, then <Link to="/matches/new">schedule matches</Link> between registered teams.</li>
                  <li>Record results as matches are played — standings update from there.</li>
                </ol>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card card-pitch h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Upcoming matches</span>
                <Link to="/matches" className="small">See all</Link>
              </div>
              <div className="card-body">
                {upcoming.length === 0 ? (
                  <p className="text-muted mb-0">No upcoming matches scheduled.</p>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {upcoming.map((m) => (
                      <li key={m.matchId} className="mb-2">
                        <Link to={`/matches/${m.matchId}`} className="text-decoration-none d-flex align-items-center gap-2">
                          <LogoBadge base64={m.homeTeam?.teamLogo} size={18} alt={m.homeTeam?.teamName} />
                          {m.homeTeam?.teamName} <span className="text-muted">vs</span> {m.awayTeam?.teamName}
                          <LogoBadge base64={m.awayTeam?.teamLogo} size={18} alt={m.awayTeam?.teamName} />
                        </Link>
                        <div className="small text-muted">{m.matchDate?.replace('T', ' ')}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr className="pitch-divider" />
      </div>
    </div>
  );
}

function StatCard({ label, value, to }) {
  return (
    <div className="col-md-4">
      <Link to={to} className="text-decoration-none">
        <div className="card card-pitch text-center py-3">
          <div className="display-6 fw-bold">{value === null ? '—' : value}</div>
          <div className="text-muted">{label}</div>
        </div>
      </Link>
    </div>
  );
}
