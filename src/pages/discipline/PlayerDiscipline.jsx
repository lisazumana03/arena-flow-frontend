import { useEffect, useState } from 'react';
import { getAllPlayers } from '../../service/playerService';
import { getAllTeams } from '../../service/teamService';
import { getUpcomingMatches, getCompletedMatches } from '../../service/matchService';
import {
  reportInjury, markRecovered, getActiveInjuries, getInjuryHistory,
} from '../../service/injuryService';
import { issueSuspension, getActiveSuspensions, getSuspensionHistory } from '../../service/suspensionService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';

const SEVERITIES = ['KNOCK', 'MINOR', 'MODERATE', 'SEVERE', 'CAREER_THREATENING'];
const OFFENCES = [
  'SERIOUS_FOUL_PLAY', 'VIOLENT_CONDUCT', 'SPITTING',
  'DENYING_OBVIOUS_GOAL_SCORING_OPPORTUNITY_HANDBALL', 'DENYING_OBVIOUS_GOAL_SCORING_OPPORTUNITY_FOUL',
  'OFFENSIVE_ABUSIVE_LANGUAGE', 'SECOND_BOOKABLE_OFFENCE',
];

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.lastName].filter(Boolean).join(' ');
}

export default function PlayerDiscipline() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const [activeInjuries, setActiveInjuries] = useState([]);
  const [injuryHistory, setInjuryHistory] = useState([]);
  const [activeSuspensions, setActiveSuspensions] = useState([]);
  const [suspensionHistory, setSuspensionHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [injuryForm, setInjuryForm] = useState({ severity: 'MINOR', injuryDate: new Date().toISOString().slice(0, 10), triggeringMatchId: '' });
  const [suspensionForm, setSuspensionForm] = useState({ offence: 'SERIOUS_FOUL_PLAY', triggeringMatchId: '', gamesBanned: '' });

  useEffect(() => {
    Promise.all([getAllPlayers(), getAllTeams(), getUpcomingMatches().catch(() => []), getCompletedMatches().catch(() => [])])
      .then(([p, t, up, comp]) => { setPlayers(p); setTeams(t); setMatches([...comp, ...up]); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const loadPlayerDetail = (playerId) => {
    if (!playerId) return;
    setDetailLoading(true);
    setError('');
    Promise.all([
      getActiveInjuries(playerId), getInjuryHistory(playerId),
      getActiveSuspensions(playerId), getSuspensionHistory(playerId),
    ])
      .then(([ai, ih, as_, sh]) => {
        setActiveInjuries(ai); setInjuryHistory(ih);
        setActiveSuspensions(as_); setSuspensionHistory(sh);
      })
      .catch((e) => setError(e.message))
      .finally(() => setDetailLoading(false));
  };

  useEffect(() => { loadPlayerDetail(selectedPlayerId); }, [selectedPlayerId]);

  const handleReportInjury = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await reportInjury({
        playerId: selectedPlayerId,
        triggeringMatchId: injuryForm.triggeringMatchId || null,
        severity: injuryForm.severity,
        injuryDate: injuryForm.injuryDate,
      });
      loadPlayerDetail(selectedPlayerId);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const handleIssueSuspension = async (e) => {
    e.preventDefault();
    if (!suspensionForm.triggeringMatchId) {
      setError('A triggering match is required to issue a suspension.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await issueSuspension({
        playerId: selectedPlayerId,
        triggeringMatchId: suspensionForm.triggeringMatchId,
        offence: suspensionForm.offence,
        gamesBanned: suspensionForm.gamesBanned === '' ? null : Number(suspensionForm.gamesBanned),
      });
      loadPlayerDetail(selectedPlayerId);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRecover = async (injuryId) => {
    setBusy(true);
    setError('');
    try {
      await markRecovered(injuryId);
      loadPlayerDetail(selectedPlayerId);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const selectedPlayer = players.find((p) => p.playerId === selectedPlayerId);

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Injuries &amp; Suspensions</h1>
      <ErrorBanner message={error} />

      <div className="mb-4" style={{ maxWidth: 360 }}>
        <label className="form-label">Player</label>
        {loading ? <Loading label="Loading players…" /> : (
          <select className="form-select" value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)}>
            <option value="">Select a player…</option>
            {players.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)} ({p.team?.teamName || 'Unassigned'})</option>)}
          </select>
        )}
      </div>

      {!selectedPlayerId ? (
        <EmptyState title="Pick a player to view or record injuries and suspensions" />
      ) : detailLoading ? (
        <Loading label="Loading player record…" />
      ) : (
        <div className="row g-4">
          {/* Injuries */}
          <div className="col-lg-6">
            <div className="card card-pitch h-100">
              <div className="card-header">Injuries</div>
              <div className="card-body">
                {activeInjuries.length === 0 ? (
                  <p className="text-success small">No active injuries.</p>
                ) : (
                  <ul className="list-unstyled mb-3">
                    {activeInjuries.map((i) => (
                      <li key={i.injuryId} className="mb-2 p-2 border rounded">
                        <span className="badge text-bg-danger me-2">{i.severity.replace(/_/g, ' ')}</span>
                        Since {i.injuryDate}{i.expectedReturnDate ? ` · Expected back ${i.expectedReturnDate}` : ''}
                        <div>
                          <button className="btn btn-sm btn-outline-success mt-1" disabled={busy} onClick={() => handleRecover(i.injuryId)}>
                            Mark recovered
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleReportInjury} className="border-top pt-3">
                  <h2 className="h6">Report injury</h2>
                  <div className="row g-2 mb-2">
                    <div className="col-sm-6">
                      <select className="form-select form-select-sm" value={injuryForm.severity} onChange={(e) => setInjuryForm((f) => ({ ...f, severity: e.target.value }))}>
                        {SEVERITIES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <input type="date" className="form-control form-control-sm" value={injuryForm.injuryDate} onChange={(e) => setInjuryForm((f) => ({ ...f, injuryDate: e.target.value }))} required />
                    </div>
                    <div className="col-12">
                      <select className="form-select form-select-sm" value={injuryForm.triggeringMatchId} onChange={(e) => setInjuryForm((f) => ({ ...f, triggeringMatchId: e.target.value }))}>
                        <option value="">Not from a match (e.g. training)</option>
                        {matches.map((m) => <option key={m.matchId} value={m.matchId}>{m.homeTeam?.teamName} vs {m.awayTeam?.teamName}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-sm btn-outline-pitch" disabled={busy}>Report injury</button>
                </form>

                {injuryHistory.length > 0 && (
                  <details className="mt-3">
                    <summary className="small text-muted">Full injury history ({injuryHistory.length})</summary>
                    <ul className="small mt-2">
                      {injuryHistory.map((i) => (
                        <li key={i.injuryId}>{i.severity.replace(/_/g, ' ')} — {i.injuryDate} {i.active ? '(active)' : '(recovered)'}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>

          {/* Suspensions */}
          <div className="col-lg-6">
            <div className="card card-pitch h-100">
              <div className="card-header">Suspensions</div>
              <div className="card-body">
                {activeSuspensions.length === 0 ? (
                  <p className="text-success small">No active suspensions.</p>
                ) : (
                  <ul className="list-unstyled mb-3">
                    {activeSuspensions.map((s) => (
                      <li key={s.suspensionId} className="mb-2 p-2 border rounded">
                        <span className="badge text-bg-warning me-2">{s.offence.replace(/_/g, ' ')}</span>
                        {s.gamesServed}/{s.gamesBanned} games served
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleIssueSuspension} className="border-top pt-3">
                  <h2 className="h6">Issue suspension</h2>
                  <div className="row g-2 mb-2">
                    <div className="col-12">
                      <select className="form-select form-select-sm" value={suspensionForm.offence} onChange={(e) => setSuspensionForm((f) => ({ ...f, offence: e.target.value }))}>
                        {OFFENCES.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                    <div className="col-sm-8">
                      <select className="form-select form-select-sm" value={suspensionForm.triggeringMatchId} onChange={(e) => setSuspensionForm((f) => ({ ...f, triggeringMatchId: e.target.value }))} required>
                        <option value="">Triggering match…</option>
                        {matches.map((m) => <option key={m.matchId} value={m.matchId}>{m.homeTeam?.teamName} vs {m.awayTeam?.teamName}</option>)}
                      </select>
                    </div>
                    <div className="col-sm-4">
                      <input type="number" min="1" className="form-control form-control-sm" placeholder="Games (auto)" value={suspensionForm.gamesBanned} onChange={(e) => setSuspensionForm((f) => ({ ...f, gamesBanned: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-sm btn-outline-pitch" disabled={busy}>Issue suspension</button>
                  <div className="form-text">Leave games blank to use the offence's default ban length.</div>
                </form>

                {suspensionHistory.length > 0 && (
                  <details className="mt-3">
                    <summary className="small text-muted">Full suspension history ({suspensionHistory.length})</summary>
                    <ul className="small mt-2">
                      {suspensionHistory.map((s) => (
                        <li key={s.suspensionId}>{s.offence.replace(/_/g, ' ')} — {s.gamesServed}/{s.gamesBanned} served {s.active ? '(active)' : '(served)'}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
