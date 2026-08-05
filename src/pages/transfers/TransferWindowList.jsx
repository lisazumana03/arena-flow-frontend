import { useEffect, useState } from 'react';
import { getAllWindows, createWindow, deleteWindow } from '../../service/transferWindowService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';

const EMPTY = { type: 'SUMMER', year: new Date().getFullYear(), openDate: '', closeDate: '' };

export default function TransferWindowList() {
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    getAllWindows().then(setWindows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const isOpenNow = (w) => {
    const today = new Date().toISOString().slice(0, 10);
    return w.openDate <= today && today <= w.closeDate;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createWindow(form);
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transfer window?')) return;
    setBusyId(id);
    setError('');
    try {
      await deleteWindow(id);
      setWindows((prev) => prev.filter((w) => w.windowId !== id));
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Transfer Windows</h1>
        <button className="btn btn-pitch" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Window'}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pitch p-3 mb-4">
          <div className="row">
            <div className="col-sm-3 mb-2">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="SUMMER">Summer</option>
                <option value="WINTER">Winter</option>
              </select>
            </div>
            <div className="col-sm-2 mb-2">
              <label className="form-label">Year</label>
              <input type="number" className="form-control" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} required />
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Opens</label>
              <input type="date" className="form-control" value={form.openDate} onChange={(e) => setForm((f) => ({ ...f, openDate: e.target.value }))} required />
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Closes</label>
              <input type="date" className="form-control" value={form.closeDate} onChange={(e) => setForm((f) => ({ ...f, closeDate: e.target.value }))} required />
            </div>
          </div>
          <div><button type="submit" className="btn btn-pitch btn-sm" disabled={saving}>{saving ? 'Creating…' : 'Create window'}</button></div>
        </form>
      )}

      {loading ? (
        <Loading label="Loading transfer windows…" />
      ) : windows.length === 0 ? (
        <EmptyState title="No transfer windows yet" action={<button className="btn btn-pitch" onClick={() => setShowForm(true)}>+ New Window</button>} />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead><tr><th>Type</th><th>Year</th><th>Opens</th><th>Closes</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {windows.map((w) => (
                <tr key={w.windowId}>
                  <td className="fw-semibold">{w.type}</td>
                  <td>{w.year}</td>
                  <td>{w.openDate}</td>
                  <td>{w.closeDate}</td>
                  <td>{isOpenNow(w) ? <span className="badge text-bg-success">Open</span> : <span className="badge text-bg-secondary">Closed</span>}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger" disabled={busyId === w.windowId} onClick={() => handleDelete(w.windowId)}>
                      {busyId === w.windowId ? 'Deleting…' : 'Delete'}
                    </button>
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
