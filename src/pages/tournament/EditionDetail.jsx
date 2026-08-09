import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getEntriesForSeason,
  registerTeam,
  getStandingsForSeason,
  getGroupNames,
} from '../../service/tournamentService';
import {
  getSeasonById,
  startSeason,
  completeSeason,
  getStandings,
  recalculateStandings,
} from '../../service/seasonService';
import { getSeasonMatches } from '../../service/matchService';
import { getAllTeams } from '../../service/teamService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import { QualificationBadge, SeasonStatusBadge, MatchStatusBadge } from '../../components/Badges';
import LogoBadge from '../../components/LogoBadge';

const EMPTY_REG = { teamId: '', groupName: '', registrationDate: new Date().toISOString().slice(0, 10) };

export default function EditionDetail() {
  const { seasonId } = useParams();

  const [season, setSeason] = useState(null);
  const [entries, setEntries] = useState([]);
  const [standings, setStandings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [allTeams, setAllTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showReg, setShowReg] = useState(false);
  const [regForm, setRegForm] = useState(EMPTY_REG);
  const [showZones, setShowZones] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      getSeasonById(seasonId),
      getEntriesForSeason(seasonId),
      getStandings(seasonId).catch(() => []),
      getGroupNames(seasonId).catch(() => []),
      getSeasonMatches(seasonId).catch(() => []),
      getAllTeams(),
    ])
      .then(([s, e, st, g, m, teams]) => {
        setSeason(s);
        setEntries(e);
        setStandings(st);
        setGroups(g);
        setMatches(m);
        setAllTeams(teams);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [seasonId]);

  const unregisteredTeams = allTeams.filter((t) => !entries.some((e) => e.team?.teamId === t.teamId));

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegForm((f) => ({ ...f, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await registerTeam(seasonId, { ...regForm, groupName: regForm.groupName || null });
      setRegForm(EMPTY_REG);
      setShowReg(false);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const doAction = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading edition…" /></div>;
  if (!season) return <div className="container py-4"><ErrorBanner message={error || 'Edition not found.'} /></div>;

  const promotionSpots = season.tournament?.promotionSpots || 0;
  const relegationSpots = season.tournament?.relegationSpots || 0;
  const hasZones = (promotionSpots > 0 || relegationSpots > 0) && season.tournament?.format !== 'KNOCKOUT';

  const zoneClassFor = (position) => {
    if (!showZones || !hasZones) return '';
    if (promotionSpots > 0 && position <= promotionSpots) return 'row-promotion';
    if (relegationSpots > 0 && position > standings.length - relegationSpots) return 'row-relegation';
    return '';
  };

  return (
    <div className="container py-4">
      <Link to={`/tournaments/${season.tournament?.tournamentId}`} className="text-decoration-none">&larr; {season.tournament?.tournamentName}</Link>

      <div className="d-flex justify-content-between align-items-start mt-2 mb-3 flex-wrap gap-2">
        <div>
          <h1 className="h3 mb-1">{season.seasonName}</h1>
          <SeasonStatusBadge status={season.status} />
          <span className="text-muted ms-2">{season.startDate} &rarr; {season.endDate}</span>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {season.status === 'UPCOMING' && (
            <button className="btn btn-pitch" disabled={busy} onClick={() => doAction(() => startSeason(seasonId))}>Start edition</button>
          )}
          {season.status === 'IN_PROGRESS' && (
            <>
              <button className="btn btn-outline-pitch" disabled={busy} onClick={() => doAction(() => recalculateStandings(seasonId))}>Recalculate standings</button>
              <button className="btn btn-pitch" disabled={busy} onClick={() => doAction(() => completeSeason(seasonId))}>Complete edition</button>
            </>
          )}
        </div>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {/* Registered teams */}
      <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
        <h2 className="h5 mb-0">Registered teams ({entries.length})</h2>
        <button className="btn btn-sm btn-outline-pitch" onClick={() => setShowReg((s) => !s)}>
          {showReg ? 'Cancel' : '+ Register team'}
        </button>
      </div>

      {showReg && (
        <form onSubmit={handleRegister} className="card card-pitch p-3 mb-3">
          <div className="row">
            <div className="col-sm-5 mb-2">
              <label className="form-label">Team</label>
              <select className="form-select" name="teamId" value={regForm.teamId} onChange={handleRegChange} required>
                <option value="">Select a team…</option>
                {unregisteredTeams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="col-sm-4 mb-2">
              <label className="form-label">Group (optional)</label>
              <input className="form-control" name="groupName" value={regForm.groupName} onChange={handleRegChange} placeholder="e.g. Group A" />
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Registration date</label>
              <input type="date" className="form-control" name="registrationDate" value={regForm.registrationDate} onChange={handleRegChange} required />
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-pitch btn-sm" disabled={busy}>{busy ? 'Registering…' : 'Register'}</button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <EmptyState title="No teams registered yet" />
      ) : (
        <div className="table-responsive mb-4">
          <table className="table table-pitch align-middle">
            <thead>
              <tr><th>Team</th><th>Group</th><th>Points</th><th>Status</th><th>Registered</th></tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.tournamentTeamId}>
                  <td className="fw-semibold">
                    <div className="d-flex align-items-center gap-2">
                      <LogoBadge base64={e.team?.teamLogo} size={24} alt={e.team?.teamName} />
                      {e.team?.teamName}
                    </div>
                  </td>
                  <td>{e.groupName || '—'}</td>
                  <td>{e.points}</td>
                  <td><QualificationBadge status={e.qualificationStatus} /></td>
                  <td>{e.registrationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* League table */}
      {standings.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <h2 className="h5 mb-0">Standings</h2>
            {hasZones && (
              <div className="d-flex align-items-center gap-3">
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="showZones"
                    checked={showZones}
                    onChange={(e) => setShowZones(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="showZones">
                    Colour promotion/relegation
                  </label>
                </div>
                {showZones && (
                  <span className="small text-muted">
                    {promotionSpots > 0 && <><span className="zone-swatch promotion" />Promotion </>}
                    {promotionSpots > 0 && relegationSpots > 0 && '  '}
                    {relegationSpots > 0 && <><span className="zone-swatch relegation" />Relegation</>}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="table-responsive mb-4">
            <table className="table table-pitch align-middle">
              <thead>
                <tr>
                  <th>#</th><th>Team</th><th>GP</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => (
                  <tr key={s.standingId} className={zoneClassFor(s.position)}>
                    <td>{s.position}</td>
                    <td className="fw-semibold">
                      <div className="d-flex align-items-center gap-2">
                        <LogoBadge base64={s.team?.teamLogo} size={24} alt={s.team?.teamName} />
                        {s.team?.teamName}
                      </div>
                    </td>
                    <td>{s.gamesPlayed}</td>
                    <td>{s.wins}</td>
                    <td>{s.draws}</td>
                    <td>{s.losses}</td>
                    <td>{s.goalsFor}</td>
                    <td>{s.goalsAgainst}</td>
                    <td>{s.goalDifference}</td>
                    <td className="fw-bold">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {groups.length > 0 && (
        <p className="text-muted small">Groups in this edition: {groups.join(', ')}</p>
      )}

      {/* Matches in this edition */}
      <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
        <h2 className="h5 mb-0">Matches</h2>
        <Link to="/matches/new" className="btn btn-sm btn-outline-pitch">+ Schedule match</Link>
      </div>
      {matches.length === 0 ? (
        <EmptyState title="No matches scheduled for this edition yet" />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead><tr><th>Fixture</th><th>Date</th><th>Status</th><th>Score</th></tr></thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.matchId}>
                  <td>
                    <Link to={`/matches/${m.matchId}`} className="d-inline-flex align-items-center gap-1 text-decoration-none">
                      <LogoBadge base64={m.homeTeam?.teamLogo} size={20} alt={m.homeTeam?.teamName} />
                      {m.homeTeam?.teamName} vs {m.awayTeam?.teamName}
                      <LogoBadge base64={m.awayTeam?.teamLogo} size={20} alt={m.awayTeam?.teamName} />
                    </Link>
                  </td>
                  <td>{m.matchDate?.replace('T', ' ')}</td>
                  <td><MatchStatusBadge status={m.status} /></td>
                  <td>{m.status === 'COMPLETED' ? `${m.homeScore} - ${m.awayScore}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
