import { useEffect, useState } from 'react';
import { namePlayer, getLineupForMatchAndTeam, substitutePlayerOff } from '../../service/lineupService';
import { getAllPlayers } from '../../service/playerService';
import { Loading, ErrorBanner } from '../../components/PageState';

const POSITIONS = ['GK', 'LWB', 'LB', 'CB', 'RB', 'RWB', 'LM', 'CM', 'CDM', 'CAM', 'RM', 'LW', 'LF', 'ST', 'CF', 'RF', 'RW'];

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.lastName].filter(Boolean).join(' ');
}

function TeamLineup({ matchId, team }) {
  const [lineup, setLineup] = useState([]);
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [subMinutes, setSubMinutes] = useState({});

  const [form, setForm] = useState({ playerId: '', starting: true, shirtNumber: '', matchPosition: 'ST' });

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getLineupForMatchAndTeam(matchId, team.teamId), getAllPlayers()])
      .then(([l, allPlayers]) => {
        setLineup(l);
        setSquad(allPlayers.filter((p) => p.team?.teamId === team.teamId));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [matchId, team.teamId]);

  const named = new Set(lineup.map((l) => l.player?.playerId));
  const available = squad.filter((p) => !named.has(p.playerId));

  const handleNamePlayer = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await namePlayer(matchId, team.teamId, {
        playerId: form.playerId,
        starting: form.starting,
        shirtNumber: Number(form.shirtNumber),
        matchPosition: form.matchPosition,
      });
      setForm({ playerId: '', starting: true, shirtNumber: '', matchPosition: 'ST' });
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubOff = async (playerId) => {
    const minute = Number(subMinutes[playerId] || 0);
    if (!minute) return;
    setBusy(true);
    setError('');
    try {
      await substitutePlayerOff(matchId, playerId, minute);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const starters = lineup.filter((l) => l.starting);
  const bench = lineup.filter((l) => !l.starting);

  if (loading) return <Loading label={`Loading ${team.teamName} lineup…`} />;

  return (
    <div>
      <ErrorBanner message={error} />
      <h3 className="h6">Starting XI</h3>
      {starters.length === 0 ? <p className="text-muted small">No starters named yet.</p> : (
        <ul className="list-unstyled">
          {starters.map((l) => (
            <li key={l.lineupId} className="d-flex justify-content-between align-items-center mb-1 p-2 border rounded">
              <span>#{l.shirtNumber} {fullName(l.player?.playerName)} <span className="badge badge-pitch ms-1">{l.matchPosition}</span></span>
              {l.substitutedOffMinute != null ? (
                <span className="text-muted small">Off {l.substitutedOffMinute}'</span>
              ) : (
                <span className="d-flex gap-1">
                  <input type="number" min="1" max="120" className="form-control form-control-sm" style={{ width: 70 }} placeholder="min"
                    value={subMinutes[l.player?.playerId] || ''} onChange={(e) => setSubMinutes((s) => ({ ...s, [l.player.playerId]: e.target.value }))} />
                  <button className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => handleSubOff(l.player.playerId)}>Sub off</button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3 className="h6 mt-3">Bench</h3>
      {bench.length === 0 ? <p className="text-muted small">No substitutes named yet.</p> : (
        <ul className="list-unstyled">
          {bench.map((l) => (
            <li key={l.lineupId} className="mb-1">#{l.shirtNumber} {fullName(l.player?.playerName)} <span className="badge badge-pitch ms-1">{l.matchPosition}</span></li>
          ))}
        </ul>
      )}

      <form onSubmit={handleNamePlayer} className="border-top pt-3 mt-3">
        <h3 className="h6">Name a player</h3>
        <div className="row g-2">
          <div className="col-sm-5">
            <select className="form-select form-select-sm" value={form.playerId} onChange={(e) => setForm((f) => ({ ...f, playerId: e.target.value }))} required>
              <option value="">Select player…</option>
              {available.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
            </select>
          </div>
          <div className="col-sm-3">
            <select className="form-select form-select-sm" value={form.matchPosition} onChange={(e) => setForm((f) => ({ ...f, matchPosition: e.target.value }))}>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="col-sm-2">
            <input type="number" min="1" max="99" className="form-control form-control-sm" placeholder="Shirt #" value={form.shirtNumber} onChange={(e) => setForm((f) => ({ ...f, shirtNumber: e.target.value }))} required />
          </div>
          <div className="col-sm-2 form-check d-flex align-items-center">
            <input type="checkbox" className="form-check-input me-2" id={`starting-${team.teamId}`} checked={form.starting} onChange={(e) => setForm((f) => ({ ...f, starting: e.target.checked }))} />
            <label className="form-check-label small" htmlFor={`starting-${team.teamId}`}>Starting</label>
          </div>
        </div>
        <button type="submit" className="btn btn-sm btn-outline-pitch mt-2" disabled={busy || available.length === 0}>Add to lineup</button>
        {available.length === 0 && squad.length > 0 && <span className="text-muted small ms-2">Whole squad named.</span>}
        {squad.length === 0 && <div className="form-text text-danger">No players assigned to {team.teamName} yet.</div>}
      </form>
    </div>
  );
}

export default function LineupPanel({ matchId, homeTeam, awayTeam }) {
  const [side, setSide] = useState('home');
  const team = side === 'home' ? homeTeam : awayTeam;

  return (
    <div>
      <ul className="nav nav-pills mb-3">
        <li className="nav-item"><button className={`nav-link ${side === 'home' ? 'active' : ''}`} onClick={() => setSide('home')}>{homeTeam?.teamName}</button></li>
        <li className="nav-item"><button className={`nav-link ${side === 'away' ? 'active' : ''}`} onClick={() => setSide('away')}>{awayTeam?.teamName}</button></li>
      </ul>
      {team && <TeamLineup key={team.teamId} matchId={matchId} team={team} />}
    </div>
  );
}
