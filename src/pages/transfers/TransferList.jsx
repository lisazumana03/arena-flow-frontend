import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTransfers, createTransfer } from '../../service/transferService';
import { getAllPlayers } from '../../service/playerService';
import { getAllTeams } from '../../service/teamService';
import { getAllWindows } from '../../service/transferWindowService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import { formatCurrency } from '../../utils/format';

const STATUS_CLASS = {
  RUMOURED: 'text-bg-secondary', IN_TALKS: 'text-bg-info', AGREEMENT_REACHED: 'text-bg-info',
  HERE_WE_GO: 'text-bg-warning', MEDICAL_SCHEDULED: 'text-bg-warning', OFFICIAL: 'text-bg-success', DEAL_COLLAPSED: 'text-bg-danger',
};

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.lastName].filter(Boolean).join(' ');
}

const EMPTY = { playerId: '', sellingTeamId: '', buyingTeamId: '', windowId: '', type: 'PERMANENT', agreedFee: '', reportedDate: new Date().toISOString().slice(0, 10) };

export default function TransferList() {
  const [transfers, setTransfers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getAllTransfers(), getAllPlayers(), getAllTeams(), getAllWindows()])
      .then(([tr, p, t, w]) => { setTransfers(tr); setPlayers(p); setTeams(t.filter((team) => team.teamType === 'CLUB')); setWindows(w); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.sellingTeamId === form.buyingTeamId) {
      setError('Selling and buying team must be different.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createTransfer({
        player: { playerId: form.playerId },
        sellingTeam: { teamId: form.sellingTeamId },
        buyingTeam: { teamId: form.buyingTeamId },
        window: form.windowId ? { windowId: form.windowId } : null,
        type: form.type,
        agreedFee: Number(form.agreedFee) || 0,
        reportedDate: form.reportedDate,
      });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Transfers</h1>
        <button className="btn btn-pitch" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Transfer'}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pitch p-3 mb-4">
          <div className="row">
            <div className="col-sm-6 mb-2">
              <label className="form-label">Player</label>
              <select className="form-select" name="playerId" value={form.playerId} onChange={handleChange} required>
                <option value="">Select…</option>
                {players.map((p) => <option key={p.playerId} value={p.playerId}>{fullName(p.playerName)} ({p.club?.teamName || 'Unassigned'})</option>)}
              </select>
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Selling team</label>
              <select className="form-select" name="sellingTeamId" value={form.sellingTeamId} onChange={handleChange} required>
                <option value="">Select…</option>
                {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Buying team</label>
              <select className="form-select" name="buyingTeamId" value={form.buyingTeamId} onChange={handleChange} required>
                <option value="">Select…</option>
                {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 mb-2">
              <label className="form-label">Type</label>
              <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                <option value="PERMANENT">Permanent</option>
                <option value="LOAN">Loan</option>
                <option value="LOAN_WITH_OPTION">Loan with option</option>
                <option value="FREE">Free transfer</option>
              </select>
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Window (optional)</label>
              <select className="form-select" name="windowId" value={form.windowId} onChange={handleChange}>
                <option value="">None</option>
                {windows.map((w) => <option key={w.windowId} value={w.windowId}>{w.type} {w.year}</option>)}
              </select>
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Agreed fee</label>
              <input type="number" min="0" className="form-control" name="agreedFee" value={form.agreedFee} onChange={handleChange} />
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Reported date</label>
              <input type="date" className="form-control" name="reportedDate" value={form.reportedDate} onChange={handleChange} required />
            </div>
          </div>
          <div><button type="submit" className="btn btn-pitch btn-sm" disabled={saving}>{saving ? 'Creating…' : 'Create transfer'}</button></div>
        </form>
      )}

      {loading ? (
        <Loading label="Loading transfers…" />
      ) : transfers.length === 0 ? (
        <EmptyState title="No transfers yet" action={<button className="btn btn-pitch" onClick={() => setShowForm(true)}>+ New Transfer</button>} />
      ) : (
        <div className="table-responsive">
          <table className="table table-pitch align-middle">
            <thead><tr><th>Player</th><th>From</th><th>To</th><th>Type</th><th>Fee</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.transferId}>
                  <td className="fw-semibold">{fullName(t.player?.playerName)}</td>
                  <td>{t.sellingTeam?.teamName}</td>
                  <td>{t.buyingTeam?.teamName}</td>
                  <td>{t.type?.replace(/_/g, ' ')}</td>
                  <td>{formatCurrency(t.agreedFee)}</td>
                  <td><span className={`badge ${STATUS_CLASS[t.status] || 'text-bg-secondary'}`}>{t.status?.replace(/_/g, ' ')}</span></td>
                  <td className="text-end"><Link to={`/transfers/${t.transferId}`} className="btn btn-sm btn-outline-pitch">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
