import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMatch, completeMatch, updateStandingsAfterMatch } from '../../service/matchService';
import { Loading, ErrorBanner } from '../../components/PageState';
import { MatchStatusBadge } from '../../components/Badges';
import LineupPanel from './LineupPanel';
import EventsPanel from './EventsPanel';
import OfficialsPanel from './OfficialsPanel';

const TABS = ['Overview', 'Lineups', 'Events', 'Officials'];

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [scoreForm, setScoreForm] = useState({ homeScore: 0, awayScore: 0 });
  const [tab, setTab] = useState('Overview');

  const load = () => {
    setLoading(true);
    setError('');
    getMatch(id).then(setMatch).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleComplete = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const updated = await completeMatch(id, Number(scoreForm.homeScore), Number(scoreForm.awayScore));
      setMatch(updated);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateStandings = async () => {
    setBusy(true);
    setError('');
    try {
      await updateStandingsAfterMatch(id);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading match…" /></div>;
  if (!match) return <div className="container py-4"><ErrorBanner message={error || 'Match not found.'} /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <Link to="/matches" className="text-decoration-none">&larr; All matches</Link>

      <div className="card card-pitch mt-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Matchday</span>
          <MatchStatusBadge status={match.status} />
        </div>
        <div className="card-body">
          <div className="pitch-bg rounded-3 p-4 text-center mb-3">
            <div className="row align-items-center">
              <div className="col-5 text-end fw-bold fs-5">{match.homeTeam?.teamName}</div>
              <div className="col-2">
                <span className="fs-3 fw-bold">
                  {match.status === 'COMPLETED' ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                </span>
              </div>
              <div className="col-5 text-start fw-bold fs-5">{match.awayTeam?.teamName}</div>
            </div>
          </div>

          <dl className="row mb-0">
            <dt className="col-4">Kick-off</dt>
            <dd className="col-8">{match.matchDate?.replace('T', ' ')}</dd>
            <dt className="col-4">Venue</dt>
            <dd className="col-8">{match.venue || '—'}</dd>
            {match.attendance > 0 && (<><dt className="col-4">Attendance</dt><dd className="col-8">{match.attendance.toLocaleString()}</dd></>)}
          </dl>
        </div>
      </div>

      <ErrorBanner message={error} />

      <ul className="nav nav-tabs mt-4 mb-3">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>

      {tab === 'Overview' && (
        <div>
          {match.status !== 'COMPLETED' && match.status !== 'CANCELLED' && (
            <form onSubmit={handleComplete} className="card card-pitch p-4">
              <h2 className="h6 mb-3">Record result</h2>
              <div className="row align-items-end">
                <div className="col-5">
                  <label className="form-label">{match.homeTeam?.teamName}</label>
                  <input type="number" min="0" className="form-control" value={scoreForm.homeScore}
                    onChange={(e) => setScoreForm((f) => ({ ...f, homeScore: e.target.value }))} required />
                </div>
                <div className="col-2 text-center fw-bold pb-2">—</div>
                <div className="col-5">
                  <label className="form-label">{match.awayTeam?.teamName}</label>
                  <input type="number" min="0" className="form-control" value={scoreForm.awayScore}
                    onChange={(e) => setScoreForm((f) => ({ ...f, awayScore: e.target.value }))} required />
                </div>
              </div>
              <button type="submit" className="btn btn-pitch mt-3" disabled={busy}>{busy ? 'Saving…' : 'Complete match'}</button>
            </form>
          )}

          {match.status === 'COMPLETED' && (
            <div>
              <button className="btn btn-outline-pitch" disabled={busy} onClick={handleUpdateStandings}>
                {busy ? 'Updating…' : 'Apply result to standings'}
              </button>
              <span className="text-muted small ms-2">Pushes this result into the season's league table.</span>
            </div>
          )}
        </div>
      )}

      {tab === 'Lineups' && (
        <div className="card card-pitch p-4">
          <LineupPanel matchId={id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        </div>
      )}

      {tab === 'Events' && (
        <div className="card card-pitch p-4">
          <EventsPanel matchId={id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} onFinalized={setMatch} />
        </div>
      )}

      {tab === 'Officials' && (
        <div className="card card-pitch p-4">
          <OfficialsPanel matchId={id} />
        </div>
      )}
    </div>
  );
}
