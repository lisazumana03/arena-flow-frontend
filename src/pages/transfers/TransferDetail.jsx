import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTransfer, advanceStatus, finalizeTransfer } from '../../service/transferService';
import { getBudgetsByTeam } from '../../service/budgetService';
import { getAllSeasons } from '../../service/seasonService';
import { Loading, ErrorBanner } from '../../components/PageState';
import { formatCurrency } from '../../utils/format';

const TIERS = ['RUMOURED', 'IN_TALKS', 'AGREEMENT_REACHED', 'HERE_WE_GO', 'MEDICAL_SCHEDULED', 'OFFICIAL'];

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.lastName].filter(Boolean).join(' ');
}

export default function TransferDetail() {
  const { id } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [finalizeForm, setFinalizeForm] = useState({ seasonId: '', buyingTeamBudgetId: '', newKitNumber: '' });

  const load = () => {
    setLoading(true);
    setError('');
    getTransfer(id)
      .then((res) => {
        const t = res?.transferId ? res : res?.value;
        if (!t) throw new Error('Transfer not found.');
        setTransfer(t);
        return Promise.all([
          getBudgetsByTeam(t.buyingTeam?.teamId).catch(() => []),
          getAllSeasons().catch(() => []),
        ]);
      })
      .then(([b, s]) => { setBudgets(b); setSeasons(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const currentIdx = transfer ? TIERS.indexOf(transfer.status) : -1;
  const nextTier = currentIdx >= 0 && currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
  const isTerminal = transfer?.status === 'OFFICIAL' || transfer?.status === 'DEAL_COLLAPSED';

  const doAdvance = async (next) => {
    setBusy(true);
    setError('');
    try {
      const updated = await advanceStatus(id, next);
      setTransfer(updated);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const doFinalize = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const updated = await finalizeTransfer(id, {
        seasonId: finalizeForm.seasonId,
        buyingTeamBudgetId: finalizeForm.buyingTeamBudgetId,
        newKitNumber: Number(finalizeForm.newKitNumber),
      });
      setTransfer(updated);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading transfer…" /></div>;
  if (!transfer) return <div className="container py-4"><ErrorBanner message={error || 'Transfer not found.'} /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <Link to="/transfers" className="text-decoration-none">&larr; All transfers</Link>

      <div className="card card-pitch mt-3">
        <div className="card-header">Transfer</div>
        <div className="card-body">
          <h2 className="h4">{fullName(transfer.player?.playerName)}</h2>
          <p className="mb-1">{transfer.sellingTeam?.teamName} &rarr; {transfer.buyingTeam?.teamName}</p>
          <p className="mb-1">Type: {transfer.type?.replace(/_/g, ' ')} &middot; Fee: {formatCurrency(transfer.agreedFee)}</p>
          <p className="mb-3 text-muted">Reported {transfer.reportedDate}{transfer.confirmedDate ? ` · Confirmed ${transfer.confirmedDate}` : ''}</p>

          <ErrorBanner message={error} />

          {/* Reliability tier tracker */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {TIERS.map((tier) => (
              <span
                key={tier}
                className={`badge ${tier === transfer.status ? 'badge-pitch' : TIERS.indexOf(tier) < currentIdx ? 'text-bg-success' : 'text-bg-secondary'}`}
              >
                {tier.replace(/_/g, ' ')}
              </span>
            ))}
            {transfer.status === 'DEAL_COLLAPSED' && <span className="badge text-bg-danger">DEAL COLLAPSED</span>}
          </div>

          {!isTerminal && (
            <div className="d-flex gap-2 flex-wrap">
              {nextTier && (
                <button className="btn btn-pitch btn-sm" disabled={busy} onClick={() => doAdvance(nextTier)}>
                  Advance to "{nextTier.replace(/_/g, ' ')}"
                </button>
              )}
              <button className="btn btn-outline-danger btn-sm" disabled={busy} onClick={() => doAdvance('DEAL_COLLAPSED')}>
                Collapse deal
              </button>
            </div>
          )}
        </div>
      </div>

      {transfer.status === 'OFFICIAL' && (
        <div className="card card-pitch p-3 mt-3">
          <p className="text-muted small mb-0">
            This transfer is official — the finalize saga (window check, budget spend, squad swap, player re-registration)
            below only applies before a deal reaches this stage. If it hasn't run yet, you can still trigger it here.
          </p>
        </div>
      )}

      {transfer.status !== 'DEAL_COLLAPSED' && (
        <form onSubmit={doFinalize} className="card card-pitch p-4 mt-3">
          <h2 className="h6 mb-2">Finalize transfer</h2>
          <p className="text-muted small">
            Runs the finalize saga: checks the transfer window is open, spends from the buying team's budget,
            moves the player to the new squad, and assigns their new kit number.
          </p>
          <div className="mb-2">
            <label className="form-label">Season</label>
            <select className="form-select" value={finalizeForm.seasonId} onChange={(e) => setFinalizeForm((f) => ({ ...f, seasonId: e.target.value }))} required>
              <option value="">Select…</option>
              {seasons.map((s) => <option key={s.seasonId} value={s.seasonId}>{s.seasonName}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Buying team's budget</label>
            <select className="form-select" value={finalizeForm.buyingTeamBudgetId} onChange={(e) => setFinalizeForm((f) => ({ ...f, buyingTeamBudgetId: e.target.value }))} required>
              <option value="">Select…</option>
              {budgets.map((b) => <option key={b.budgetId} value={b.budgetId}>{new Date(b.budgetYear).getFullYear()} budget</option>)}
            </select>
            {budgets.length === 0 && <div className="form-text text-danger">{transfer.buyingTeam?.teamName} has no budget yet — create one on the Budgets page first.</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">New kit number</label>
            <input type="number" min="1" max="99" className="form-control" value={finalizeForm.newKitNumber} onChange={(e) => setFinalizeForm((f) => ({ ...f, newKitNumber: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-pitch" disabled={busy}>{busy ? 'Finalizing…' : 'Finalize transfer'}</button>
        </form>
      )}
    </div>
  );
}
