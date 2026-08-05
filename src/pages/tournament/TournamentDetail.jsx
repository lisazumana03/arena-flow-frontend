import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTournament, getEditions, createEdition } from '../../service/tournamentService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';

const EMPTY_EDITION = { year: new Date().getFullYear(), seasonName: '', startDate: '', endDate: '' };

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_EDITION);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getTournament(id), getEditions(id)])
      .then(([t, e]) => {
        setTournament(t);
        setEditions(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'year' ? Number(value) : value }));
  };

  const handleCreateEdition = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createEdition(id, form);
      setForm(EMPTY_EDITION);
      setShowForm(false);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading tournament…" /></div>;
  if (!tournament) return <div className="container py-4"><ErrorBanner message={error || 'Tournament not found.'} /></div>;

  return (
    <div className="container py-4">
      <Link to="/tournaments" className="text-decoration-none">&larr; All tournaments</Link>
      <div className="d-flex justify-content-between align-items-start mt-2 mb-3 flex-wrap gap-2">
        <div>
          <h1 className="h3 mb-1">{tournament.tournamentName}</h1>
          <span className="badge badge-pitch me-2">{tournament.format}</span>
          <span className="text-muted">{tournament.description}</span>
        </div>
        <button className="btn btn-pitch" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Edition'}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {showForm && (
        <form onSubmit={handleCreateEdition} className="card card-pitch p-4 mb-4">
          <h2 className="h6 mb-3">New edition</h2>
          <div className="row">
            <div className="col-sm-3 mb-3">
              <label className="form-label">Year</label>
              <input type="number" className="form-control" name="year" value={form.year} onChange={handleChange} required />
            </div>
            <div className="col-sm-5 mb-3">
              <label className="form-label">Edition name</label>
              <input className="form-control" name="seasonName" value={form.seasonName} onChange={handleChange} required placeholder={`e.g. ${tournament.tournamentName} ${form.year}`} />
            </div>
            <div className="col-sm-2 mb-3">
              <label className="form-label">Start date</label>
              <input type="date" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="col-sm-2 mb-3">
              <label className="form-label">End date</label>
              <input type="date" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-pitch" disabled={saving}>{saving ? 'Creating…' : 'Create edition'}</button>
          </div>
        </form>
      )}

      <h2 className="h5 mb-3">Editions</h2>
      {editions.length === 0 ? (
        <EmptyState title="No editions yet" hint="Create a yearly run of this tournament to start registering teams." />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead>
              <tr>
                <th>Edition</th>
                <th>Year</th>
                <th>Dates</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editions.map((s) => (
                <tr key={s.seasonId}>
                  <td className="fw-semibold">{s.seasonName}</td>
                  <td>{s.year}</td>
                  <td>{s.startDate} &rarr; {s.endDate}</td>
                  <td><span className="badge text-bg-secondary">{s.status}</span></td>
                  <td className="text-end">
                    <Link to={`/editions/${s.seasonId}`} className="btn btn-sm btn-outline-pitch">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
