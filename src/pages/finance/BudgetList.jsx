import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllBudgets, createBudget, spendTransferBudget, spendWageBudget,
  spendAcademyBudget, freezeBudget, unfreezeBudget,
} from '../../service/budgetService';
import { getAllTeams } from '../../service/teamService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import { formatCurrency } from '../../utils/format';

const EMPTY_FORM = { teamId: '', budgetYear: new Date().getFullYear(), totalBudget: '' };

const STATUS_CLASS = {
  ACTIVE: 'text-bg-success',
  FROZEN: 'text-bg-info',
  EXCEEDED: 'text-bg-danger',
  COMPLETED: 'text-bg-secondary',
  SUSPENDED: 'text-bg-dark',
};

function BudgetBar({ label, allocated, spent }) {
  const pct = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
  const barClass = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-success';
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between small">
        <span>{label}</span>
        <span>{formatCurrency(spent)} / {formatCurrency(allocated)}</span>
      </div>
      <div className="progress" style={{ height: 6 }}>
        <div className={`progress-bar ${barClass}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

export default function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Simple per-card "spend" amount inputs, keyed by budgetId + category
  const [spendAmounts, setSpendAmounts] = useState({});

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getAllBudgets(), getAllTeams()])
      .then(([b, t]) => { setBudgets(b); setTeams(t); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const selectedTeam = teams.find((t) => t.teamId === form.teamId);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'budgetYear' ? Number(value) : value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedTeam?.owner?.ownerId) {
      setError('Selected team has no owner assigned. Assign one on the Teams page first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createBudget({
        teamId: form.teamId,
        ownerId: selectedTeam.owner.ownerId,
        budgetYear: `${form.budgetYear}-01-01`,
        totalBudget: Number(form.totalBudget),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const doSpend = async (budgetId, category, fn) => {
    const amount = Number(spendAmounts[`${budgetId}:${category}`] || 0);
    if (!amount) return;
    setBusyId(budgetId);
    setError('');
    try {
      await fn(budgetId, amount);
      setSpendAmounts((s) => ({ ...s, [`${budgetId}:${category}`]: '' }));
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusyId(null);
    }
  };

  const doToggleFreeze = async (budget) => {
    setBusyId(budget.budgetId);
    setError('');
    try {
      await (budget.status === 'FROZEN' ? unfreezeBudget(budget.budgetId) : freezeBudget(budget.budgetId));
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Budgets</h1>
        <button className="btn btn-pitch" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Budget'}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pitch p-3 mb-4">
          <div className="row">
            <div className="col-sm-5 mb-2">
              <label className="form-label">Team</label>
              <select className="form-select" name="teamId" value={form.teamId} onChange={handleFormChange} required>
                <option value="">Select…</option>
                {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}{!t.owner ? ' (no owner)' : ''}</option>)}
              </select>
              {form.teamId && !selectedTeam?.owner && (
                <div className="form-text text-danger">This team needs an owner before it can have a budget.</div>
              )}
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Budget year</label>
              <input type="number" className="form-control" name="budgetYear" value={form.budgetYear} onChange={handleFormChange} required />
            </div>
            <div className="col-sm-4 mb-2">
              <label className="form-label">Total budget</label>
              <input type="number" min="0" className="form-control" name="totalBudget" value={form.totalBudget} onChange={handleFormChange} required />
            </div>
          </div>
          <div><button type="submit" className="btn btn-pitch btn-sm" disabled={saving}>{saving ? 'Creating…' : 'Create budget'}</button></div>
          <p className="text-muted small mb-0 mt-2">
            Total budget is split by the backend's own allocation logic into transfer, wage, operating,
            youth-academy and infrastructure pots — shown below once created.
          </p>
        </form>
      )}

      {loading ? (
        <Loading label="Loading budgets…" />
      ) : budgets.length === 0 ? (
        <EmptyState title="No budgets yet" action={<button className="btn btn-pitch" onClick={() => setShowForm(true)}>+ New Budget</button>} />
      ) : (
        <div className="row g-3">
          {budgets.map((b) => (
            <div className="col-lg-6" key={b.budgetId}>
              <div className="card card-pitch h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>{b.team?.teamName} — {new Date(b.budgetYear).getFullYear()}</span>
                  <span className={`badge ${STATUS_CLASS[b.status] || 'text-bg-secondary'}`}>{b.status}</span>
                </div>
                <div className="card-body">
                  <BudgetBar label="Transfer" allocated={b.transferBudget} spent={b.transferSpent} />
                  <BudgetBar label="Wages" allocated={b.wageBudget} spent={b.wageSpent} />
                  <BudgetBar label="Youth academy" allocated={b.youthAcademyBudget} spent={b.youthAcademySpent} />
                  <BudgetBar label="Operating" allocated={b.operatingBudget} spent={b.operatingSpent} />
                  <BudgetBar label="Infrastructure" allocated={b.infrastructureBudget} spent={b.infrastructureSpent} />

                  <hr />
                  <div className="row g-2">
                    {[
                      { key: 'transfer', label: 'Spend transfer', fn: spendTransferBudget },
                      { key: 'wages', label: 'Spend wages', fn: spendWageBudget },
                      { key: 'academy', label: 'Spend academy', fn: spendAcademyBudget },
                    ].map(({ key, label, fn }) => (
                      <div className="col-12 d-flex gap-2" key={key}>
                        <input
                          type="number" min="0" className="form-control form-control-sm"
                          placeholder={label}
                          value={spendAmounts[`${b.budgetId}:${key}`] || ''}
                          onChange={(e) => setSpendAmounts((s) => ({ ...s, [`${b.budgetId}:${key}`]: e.target.value }))}
                        />
                        <button
                          className="btn btn-sm btn-outline-pitch flex-shrink-0"
                          disabled={busyId === b.budgetId}
                          onClick={() => doSpend(b.budgetId, key, fn)}
                        >
                          {label}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-sm btn-outline-secondary mt-3"
                    disabled={busyId === b.budgetId}
                    onClick={() => doToggleFreeze(b)}
                  >
                    {b.status === 'FROZEN' ? 'Unfreeze budget' : 'Freeze budget'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
