import { useEffect, useState } from 'react';
import {
  getMatchEvents, recordGoal, recordCard, recordSubstitution, recordCorner, recordFreeKick, recordInjury, finalizeMatch,
} from '../../service/matchEventService';
import { getAllPlayers } from '../../service/playerService';
import { Loading, ErrorBanner } from '../../components/PageState';

const EVENT_KINDS = [
  { value: 'goal', label: 'Goal' },
  { value: 'card', label: 'Card' },
  { value: 'substitution', label: 'Substitution' },
  { value: 'corner', label: 'Corner' },
  { value: 'free-kick', label: 'Free kick' },
  { value: 'injury', label: 'Injury' },
];

const EVENT_ICON = {
  GOAL: '⚽', PENALTY_GOAL: '⚽', OWN_GOAL: '⚽(OG)', YELLOW_CARD: '🟨', SECOND_YELLOW_CARD: '🟨🟥',
  RED_CARD: '🟥', SUBSTITUTION: '🔄', CORNER: '🚩', FREE_KICK: '⚡', INJURY: '🩹',
};

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.lastName].filter(Boolean).join(' ');
}

export default function EventsPanel({ matchId, homeTeam, awayTeam, onFinalized }) {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [kind, setKind] = useState('goal');
  const [teamId, setTeamId] = useState('');
  const [form, setForm] = useState({});

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getMatchEvents(matchId), getAllPlayers()])
      .then(([ev, p]) => { setEvents(ev); setPlayers(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [matchId]);

  const teamPlayers = (id) => players.filter((p) => p.team?.teamId === id);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (kind === 'goal') {
        await recordGoal(matchId, {
          scoringTeamId: teamId, scorerId: form.scorerId, assistedById: form.assistedById || null,
          goalType: form.goalType || 'GOAL', minute: Number(form.minute), stoppageMinute: form.stoppageMinute ? Number(form.stoppageMinute) : null,
        });
      } else if (kind === 'card') {
        await recordCard(matchId, {
          teamId, playerId: form.playerId, cardType: form.cardType || 'YELLOW_CARD',
          offence: form.offence || null, minute: Number(form.minute), stoppageMinute: form.stoppageMinute ? Number(form.stoppageMinute) : null,
        });
      } else if (kind === 'substitution') {
        await recordSubstitution(matchId, { teamId, playerOffId: form.playerOffId, playerOnId: form.playerOnId, minute: Number(form.minute) });
      } else if (kind === 'corner') {
        await recordCorner(matchId, teamId, Number(form.minute));
      } else if (kind === 'free-kick') {
        await recordFreeKick(matchId, { teamId, playerId: form.playerId || null, minute: Number(form.minute), notes: form.notes || null });
      } else if (kind === 'injury') {
        await recordInjury(matchId, { teamId, playerId: form.playerId, severity: form.severity || 'MINOR', minute: Number(form.minute), notes: form.notes || null });
      }
      setForm({});
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFinalize = async () => {
    setBusy(true);
    setError('');
    try {
      const match = await finalizeMatch(matchId);
      onFinalized?.(match);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading match events…" />;

  const currentTeamPlayers = teamId ? teamPlayers(teamId) : [];

  return (
    <div>
      <ErrorBanner message={error} />

      <h3 className="h6">Timeline</h3>
      {events.length === 0 ? <p className="text-muted small">No events recorded yet.</p> : (
        <ul className="list-unstyled mb-3">
          {[...events].sort((a, b) => a.minute - b.minute).map((ev) => (
            <li key={ev.eventId} className="mb-1">
              <span className="me-2">{ev.minute}'{ev.stoppageMinute ? `+${ev.stoppageMinute}` : ''}</span>
              <span className="me-2">{EVENT_ICON[ev.eventType] || '•'}</span>
              <strong>{ev.team?.teamName}</strong>
              {' — '}{fullName(ev.player?.playerName)}
              {ev.relatedPlayer && ` (${ev.eventType === 'SUBSTITUTION' ? 'on: ' : 'assist: '}${fullName(ev.relatedPlayer.playerName)})`}
              {ev.notes && <span className="text-muted small"> — {ev.notes}</span>}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="border-top pt-3">
        <h3 className="h6">Record event</h3>
        <div className="row g-2 mb-2">
          <div className="col-sm-4">
            <select className="form-select form-select-sm" value={kind} onChange={(e) => { setKind(e.target.value); setForm({}); }}>
              {EVENT_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <div className="col-sm-4">
            <select className="form-select form-select-sm" value={teamId} onChange={(e) => { setTeamId(e.target.value); setForm((f) => ({ ...f, scorerId: '', playerId: '', playerOffId: '', playerOnId: '', assistedById: '' })); }} required>
              <option value="">Team…</option>
              {homeTeam && <option value={homeTeam.teamId}>{homeTeam.teamName}</option>}
              {awayTeam && <option value={awayTeam.teamId}>{awayTeam.teamName}</option>}
            </select>
          </div>
          <div className="col-sm-2">
            <input type="number" min="0" max="120" className="form-control form-control-sm" placeholder="Minute" value={form.minute || ''} onChange={(e) => set('minute', e.target.value)} required />
          </div>
          <div className="col-sm-2">
            <input type="number" min="1" className="form-control form-control-sm" placeholder="+stoppage" value={form.stoppageMinute || ''} onChange={(e) => set('stoppageMinute', e.target.value)} />
          </div>
        </div>

        {kind === 'goal' && (
          <div className="row g-2 mb-2">
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.scorerId || ''} onChange={(e) => set('scorerId', e.target.value)} required>
                <option value="">Scorer…</option>
                {currentTeamPlayers.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
              </select>
            </div>
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.assistedById || ''} onChange={(e) => set('assistedById', e.target.value)}>
                <option value="">No assist</option>
                {currentTeamPlayers.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
              </select>
            </div>
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.goalType || 'GOAL'} onChange={(e) => set('goalType', e.target.value)}>
                <option value="GOAL">Open play</option>
                <option value="PENALTY_GOAL">Penalty</option>
                <option value="OWN_GOAL">Own goal</option>
              </select>
            </div>
          </div>
        )}

        {kind === 'card' && (
          <div className="row g-2 mb-2">
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.playerId || ''} onChange={(e) => set('playerId', e.target.value)} required>
                <option value="">Player…</option>
                {currentTeamPlayers.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
              </select>
            </div>
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.cardType || 'YELLOW_CARD'} onChange={(e) => set('cardType', e.target.value)}>
                <option value="YELLOW_CARD">Yellow</option>
                <option value="SECOND_YELLOW_CARD">Second yellow</option>
                <option value="RED_CARD">Red</option>
              </select>
            </div>
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.offence || ''} onChange={(e) => set('offence', e.target.value)}>
                <option value="">Offence (optional)</option>
                <option value="SERIOUS_FOUL_PLAY">Serious foul play</option>
                <option value="VIOLENT_CONDUCT">Violent conduct</option>
                <option value="SPITTING">Spitting</option>
                <option value="DENYING_OBVIOUS_GOAL_SCORING_OPPORTUNITY_HANDBALL">Denying goal (handball)</option>
                <option value="DENYING_OBVIOUS_GOAL_SCORING_OPPORTUNITY_FOUL">Denying goal (foul)</option>
                <option value="OFFENSIVE_ABUSIVE_LANGUAGE">Offensive language</option>
                <option value="SECOND_BOOKABLE_OFFENCE">Second bookable offence</option>
              </select>
            </div>
          </div>
        )}

        {kind === 'substitution' && (
          <div className="row g-2 mb-2">
            <div className="col-sm-6">
              <select className="form-select form-select-sm" value={form.playerOffId || ''} onChange={(e) => set('playerOffId', e.target.value)} required>
                <option value="">Player off…</option>
                {currentTeamPlayers.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <select className="form-select form-select-sm" value={form.playerOnId || ''} onChange={(e) => set('playerOnId', e.target.value)} required>
                <option value="">Player on…</option>
                {currentTeamPlayers.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
              </select>
            </div>
          </div>
        )}

        {kind === 'free-kick' && (
          <div className="row g-2 mb-2">
            <div className="col-sm-6">
              <select className="form-select form-select-sm" value={form.playerId || ''} onChange={(e) => set('playerId', e.target.value)}>
                <option value="">Player (optional)</option>
                {currentTeamPlayers.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <input className="form-control form-control-sm" placeholder="Notes" value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>
        )}

        {kind === 'injury' && (
          <div className="row g-2 mb-2">
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.playerId || ''} onChange={(e) => set('playerId', e.target.value)} required>
                <option value="">Player…</option>
                {currentTeamPlayers.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)}</option>)}
              </select>
            </div>
            <div className="col-sm-4">
              <select className="form-select form-select-sm" value={form.severity || 'MINOR'} onChange={(e) => set('severity', e.target.value)}>
                <option value="KNOCK">Knock</option>
                <option value="MINOR">Minor</option>
                <option value="MODERATE">Moderate</option>
                <option value="SEVERE">Severe</option>
                <option value="CAREER_THREATENING">Career-threatening</option>
              </select>
            </div>
            <div className="col-sm-4">
              <input className="form-control form-control-sm" placeholder="Notes" value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-sm btn-outline-pitch" disabled={busy}>Record</button>
      </form>

      <div className="border-top pt-3 mt-3">
        <button className="btn btn-sm btn-pitch" disabled={busy} onClick={handleFinalize}>Finalize match from events</button>
        <span className="text-muted small ms-2">Locks the match based on recorded goal events.</span>
      </div>
    </div>
  );
}
