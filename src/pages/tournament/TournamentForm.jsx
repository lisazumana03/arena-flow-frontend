import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTournament } from '../../service/tournamentService';
import { ErrorBanner } from '../../components/PageState';

export default function TournamentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ tournamentName: '', format: 'LEAGUE', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const tournament = await createTournament(form);
      navigate(`/tournaments/${tournament.tournamentId}`);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <h1 className="h3 mb-3">New Tournament</h1>
      <p className="text-muted">
        A tournament is a competition's identity — e.g. "Premier League" — independent of any
        given year. Once created, add yearly editions (e.g. "Premier League 2027") to it.
      </p>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="card card-pitch p-4">
        <div className="mb-3">
          <label className="form-label">Tournament name</label>
          <input
            className="form-control"
            name="tournamentName"
            value={form.tournamentName}
            onChange={handleChange}
            required
            placeholder="e.g. Premier League"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Format</label>
          <select className="form-select" name="format" value={form.format} onChange={handleChange}>
            <option value="LEAGUE">League — round-robin, decided on points</option>
            <option value="KNOCKOUT">Knockout — single/two-legged elimination</option>
            <option value="HYBRID">Hybrid — group stage + knockout</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" name="description" rows="3" value={form.description} onChange={handleChange} />
        </div>
        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-pitch" disabled={saving}>
            {saving ? 'Creating…' : 'Create tournament'}
          </button>
          <Link to="/tournaments" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
