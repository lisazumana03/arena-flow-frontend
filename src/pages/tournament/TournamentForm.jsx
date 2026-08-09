import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTournament, createTournament, updateTournament } from '../../service/tournamentService';
import { Loading, ErrorBanner } from '../../components/PageState';
import LogoPicker from '../../components/LogoPicker';
import CountrySelect from '../../components/CountrySelect';

const EMPTY = {
  tournamentName: '',
  format: 'LEAGUE',
  description: '',
  tournamentLogo: null,
  promotionSpots: 0,
  relegationSpots: 0,
  country: '',
};

export default function TournamentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getTournament(id)
      .then((t) => setForm({
        tournamentName: t.tournamentName || '',
        format: t.format || 'LEAGUE',
        description: t.description || '',
        tournamentLogo: t.tournamentLogo || null,
        promotionSpots: t.promotionSpots ?? 0,
        relegationSpots: t.relegationSpots ?? 0,
        country: t.country || '',
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateTournament(id, {
          tournamentId: id,
          tournamentName: form.tournamentName,
          format: form.format,
          description: form.description,
          tournamentLogo: form.tournamentLogo || null,
          promotionSpots: form.promotionSpots,
          relegationSpots: form.relegationSpots,
          country: form.country || null,
        });
        navigate(`/tournaments/${id}`);
      } else {
        // create() doesn't accept a logo — create first, then set the logo with a follow-up
        // update if one was chosen.
        const tournament = await createTournament({
          tournamentName: form.tournamentName,
          format: form.format,
          description: form.description,
          promotionSpots: form.promotionSpots,
          relegationSpots: form.relegationSpots,
          // Backend resolves this + the tournament name into a pyramidLevel (see TournamentUtil)
          country: form.country || null,
        });
        if (form.tournamentLogo) {
          await updateTournament(tournament.tournamentId, { ...tournament, tournamentLogo: form.tournamentLogo });
        }
        navigate(`/tournaments/${tournament.tournamentId}`);
      }
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading tournament…" /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <h1 className="h3 mb-3">{isEdit ? 'Edit Tournament' : 'New Tournament'}</h1>
      {!isEdit && (
        <p className="text-muted">
          A tournament is a competition's identity — e.g. "Premier League" — independent of any
          given year. Once created, add yearly editions (e.g. "Premier League 2027") to it.
        </p>
      )}
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
          <label className="form-label">Logo</label>
          <LogoPicker value={form.tournamentLogo} onChange={(logo) => setForm((f) => ({ ...f, tournamentLogo: logo }))} suggestedName={form.tournamentName} />
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
        {form.format !== 'KNOCKOUT' && (
          <div className="mb-3">
            <label className="form-label">Country</label>
            <CountrySelect
              value={form.country}
              onChange={(country) => setForm((f) => ({ ...f, country }))}
              placeholder="Select the association's country…"
            />
            <div className="form-text">
              Used to place this league on its country's association pyramid (e.g. "Premier League" →
              tier 1 in England). Leave blank for competitions that aren't part of a domestic pyramid.
            </div>
          </div>
        )}
        {form.format !== 'KNOCKOUT' && (
          <div className="row">
            <div className="col-sm-6 mb-3">
              <label className="form-label">Promotion spots</label>
              <input
                type="number"
                className="form-control"
                name="promotionSpots"
                value={form.promotionSpots}
                onChange={handleChange}
                min="0"
              />
              <div className="form-text">Top N places in the table, coloured to show promotion. 0 = none.</div>
            </div>
            <div className="col-sm-6 mb-3">
              <label className="form-label">Relegation spots</label>
              <input
                type="number"
                className="form-control"
                name="relegationSpots"
                value={form.relegationSpots}
                onChange={handleChange}
                min="0"
              />
              <div className="form-text">Bottom N places in the table, coloured to show relegation. 0 = none.</div>
            </div>
          </div>
        )}
        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-pitch" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create tournament'}
          </button>
          <Link to={isEdit ? `/tournaments/${id}` : '/tournaments'} className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
