import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { scheduleMatch } from '../../service/matchService';
import { getAllTeams } from '../../service/teamService';
import { getAllVenues } from '../../service/venueService';
import { getAllSeasons } from '../../service/seasonService';
import { Loading, ErrorBanner } from '../../components/PageState';

const EMPTY = { homeTeamId: '', awayTeamId: '', matchDate: '', venue: '', seasonId: '' };

export default function MatchForm() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllTeams(), getAllVenues().catch(() => []), getAllSeasons().catch(() => [])])
      .then(([t, v, s]) => {
        setTeams(t);
        setVenues(v);
        setSeasons(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.homeTeamId === form.awayTeamId) {
      setError('Home and away team must be different.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const match = await scheduleMatch({
        ...form,
        // Match.matchDate is a LocalDateTime; datetime-local gives "YYYY-MM-DDTHH:mm" which Jackson accepts directly.
        matchDate: form.matchDate,
      });
      navigate(`/matches/${match.matchId}`);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading teams & venues…" /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <h1 className="h3 mb-3">Schedule Match</h1>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="card card-pitch p-4">
        <div className="mb-3">
          <label className="form-label">Tournament edition (season)</label>
          <select className="form-select" name="seasonId" value={form.seasonId} onChange={handleChange}>
            <option value="">No season (friendly — won't count towards standings)</option>
            {seasons.map((s) => (
              <option key={s.seasonId} value={s.seasonId}>
                {s.tournament?.tournamentName ? `${s.tournament.tournamentName} — ` : ''}{s.seasonName}
              </option>
            ))}
          </select>
          <div className="form-text">Pick the edition this match belongs to, or standings won't update when the match is completed.</div>
        </div>
        <div className="row">
          <div className="col-sm-6 mb-3">
            <label className="form-label">Home team</label>
            <select className="form-select" name="homeTeamId" value={form.homeTeamId} onChange={handleChange} required>
              <option value="">Select…</option>
              {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
            </select>
          </div>
          <div className="col-sm-6 mb-3">
            <label className="form-label">Away team</label>
            <select className="form-select" name="awayTeamId" value={form.awayTeamId} onChange={handleChange} required>
              <option value="">Select…</option>
              {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Kick-off</label>
          <input type="datetime-local" className="form-control" name="matchDate" value={form.matchDate} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Venue</label>
          {venues.length > 0 ? (
            <>
              <input
                className="form-control"
                name="venue"
                list="venueOptions"
                value={form.venue}
                onChange={handleChange}
                placeholder="Pick a saved venue or type a name"
                required
              />
              <datalist id="venueOptions">
                {venues.map((v) => <option key={v.venueId} value={v.venueName} />)}
              </datalist>
            </>
          ) : (
            <input className="form-control" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Athlone Stadium" required />
          )}
        </div>
        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-pitch" disabled={saving}>{saving ? 'Scheduling…' : 'Schedule match'}</button>
          <Link to="/matches" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
