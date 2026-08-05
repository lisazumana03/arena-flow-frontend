import { useEffect, useState } from 'react';
import { getOfficialsForMatch, assignOfficials, updateOfficials } from '../../service/officialsService';
import { Loading, ErrorBanner } from '../../components/PageState';

const EMPTY = { referee: '', assistantReferee1: '', assistantReferee2: '', fourthOfficial: '', matchCommissioner: '' };

export default function OfficialsPanel({ matchId }) {
  const [officials, setOfficials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getOfficialsForMatch(matchId)
      .then((o) => { setOfficials(o); setForm(o); })
      .catch(() => setOfficials(null)) // backend 400s when none assigned yet — that's a valid "not set" state here
      .finally(() => setLoading(false));
  };
  useEffect(load, [matchId]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (officials) await updateOfficials(officials.officialsId, { ...form, officialsId: officials.officialsId });
      else await assignOfficials(matchId, form);
      setEditing(false);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading officials…" />;

  return (
    <div>
      <ErrorBanner message={error} />
      {!editing && officials && (
        <div>
          <dl className="row mb-2">
            <dt className="col-4">Referee</dt><dd className="col-8">{officials.referee || '—'}</dd>
            <dt className="col-4">Assistant 1</dt><dd className="col-8">{officials.assistantReferee1 || '—'}</dd>
            <dt className="col-4">Assistant 2</dt><dd className="col-8">{officials.assistantReferee2 || '—'}</dd>
            <dt className="col-4">Fourth official</dt><dd className="col-8">{officials.fourthOfficial || '—'}</dd>
            <dt className="col-4">Commissioner</dt><dd className="col-8">{officials.matchCommissioner || '—'}</dd>
          </dl>
          <button className="btn btn-sm btn-outline-pitch" onClick={() => setEditing(true)}>Edit officials</button>
        </div>
      )}

      {!editing && !officials && (
        <div>
          <p className="text-muted">No officials assigned to this match yet.</p>
          <button className="btn btn-sm btn-pitch" onClick={() => setEditing(true)}>Assign officials</button>
        </div>
      )}

      {editing && (
        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-sm-6"><label className="form-label small">Referee</label><input className="form-control form-control-sm" name="referee" value={form.referee || ''} onChange={handleChange} /></div>
            <div className="col-sm-6"><label className="form-label small">Fourth official</label><input className="form-control form-control-sm" name="fourthOfficial" value={form.fourthOfficial || ''} onChange={handleChange} /></div>
            <div className="col-sm-6"><label className="form-label small">Assistant referee 1</label><input className="form-control form-control-sm" name="assistantReferee1" value={form.assistantReferee1 || ''} onChange={handleChange} /></div>
            <div className="col-sm-6"><label className="form-label small">Assistant referee 2</label><input className="form-control form-control-sm" name="assistantReferee2" value={form.assistantReferee2 || ''} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label small">Match commissioner</label><input className="form-control form-control-sm" name="matchCommissioner" value={form.matchCommissioner || ''} onChange={handleChange} /></div>
          </div>
          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="btn btn-sm btn-pitch" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
