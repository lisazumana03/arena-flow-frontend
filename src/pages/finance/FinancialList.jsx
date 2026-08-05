import { useEffect, useState } from 'react';
import {
  createAnnualFinancials, getFinancialsByTeam, getFinancialHealth,
  recordLoss, recordProfit, addDebt, applyRelegationPenalty,
  getTakeovers, getInterventionRequired,
} from '../../service/financialService';
import { getAllTeams } from '../../service/teamService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import { formatCurrency } from '../../utils/format';

const HEALTH_CLASS = {
  Excellent: 'text-bg-success', Healthy: 'text-bg-success', Stable: 'text-bg-info',
  Caution: 'text-bg-warning', 'At Risk': 'text-bg-warning', Critical: 'text-bg-danger', Insolvent: 'text-bg-dark',
};

export default function FinancialList() {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [records, setRecords] = useState([]);
  const [health, setHealth] = useState({}); // financialId -> health response
  const [takeovers, setTakeovers] = useState([]);
  const [intervention, setIntervention] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [debtAmounts, setDebtAmounts] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teamId: '', year: new Date().getFullYear() });
  const [saving, setSaving] = useState(false);

  const loadDashboard = () => {
    Promise.all([getTakeovers().catch(() => []), getInterventionRequired().catch(() => [])])
      .then(([tk, iv]) => { setTakeovers(tk); setIntervention(iv); })
      .catch(() => {});
  };

  const loadTeamRecords = (teamId) => {
    if (!teamId) { setRecords([]); return; }
    setLoading(true);
    setError('');
    getFinancialsByTeam(teamId)
      .then((recs) => {
        setRecords(recs);
        return Promise.all(recs.map((r) => getFinancialHealth(r.financialId).then((h) => [r.financialId, h]).catch(() => null)));
      })
      .then((pairs) => setHealth(Object.fromEntries(pairs.filter(Boolean))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getAllTeams().then(setTeams).catch((e) => setError(e.message)).finally(() => setLoading(false));
    loadDashboard();
  }, []);

  useEffect(() => { loadTeamRecords(selectedTeamId); }, [selectedTeamId]);

  const selectedTeam = teams.find((t) => t.teamId === form.teamId);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedTeam?.owner?.ownerId) {
      setError('Selected team has no owner assigned. Assign one on the Teams page first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createAnnualFinancials({
        teamId: form.teamId,
        ownerId: selectedTeam.owner.ownerId,
        year: `${form.year}-01-01`,
      });
      setShowForm(false);
      if (selectedTeamId === form.teamId) loadTeamRecords(form.teamId);
      else setSelectedTeamId(form.teamId);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const doAction = async (financialId, fn) => {
    setBusyId(financialId);
    setError('');
    try {
      await fn();
      loadTeamRecords(selectedTeamId);
      loadDashboard();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Financials</h1>
        <button className="btn btn-pitch" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Annual Financials'}
        </button>
      </div>

      <ErrorBanner message={error} />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pitch p-3 mb-4">
          <div className="row align-items-end">
            <div className="col-sm-6 mb-2">
              <label className="form-label">Team</label>
              <select className="form-select" value={form.teamId} onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))} required>
                <option value="">Select…</option>
                {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}{!t.owner ? ' (no owner)' : ''}</option>)}
              </select>
            </div>
            <div className="col-sm-3 mb-2">
              <label className="form-label">Year</label>
              <input type="number" className="form-control" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} required />
            </div>
            <div className="col-sm-3 mb-2">
              <button type="submit" className="btn btn-pitch w-100" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </form>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card card-pitch h-100">
            <div className="card-header">Takeover watch ({takeovers.length})</div>
            <div className="card-body">
              {takeovers.length === 0 ? <p className="text-muted mb-0">No clubs currently flagged as takeover candidates.</p> : (
                <ul className="mb-0">
                  {takeovers.map((r) => <li key={r.financialId}>{r.team?.teamName} — {new Date(r.financialYear).getFullYear()}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card card-pitch h-100">
            <div className="card-header">Requires intervention ({intervention.length})</div>
            <div className="card-body">
              {intervention.length === 0 ? <p className="text-muted mb-0">No clubs currently require intervention.</p> : (
                <ul className="mb-0">
                  {intervention.map((r) => <li key={r.financialId}>{r.team?.teamName} — {new Date(r.financialYear).getFullYear()}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3" style={{ maxWidth: 320 }}>
        <label className="form-label">View financials for team</label>
        <select className="form-select" value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
          <option value="">Select a team…</option>
          {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
        </select>
      </div>

      {loading ? (
        <Loading label="Loading…" />
      ) : !selectedTeamId ? (
        <EmptyState title="Pick a team to view its financial history" />
      ) : records.length === 0 ? (
        <EmptyState title="No financial records for this team yet" action={<button className="btn btn-pitch" onClick={() => { setForm((f) => ({ ...f, teamId: selectedTeamId })); setShowForm(true); }}>+ New Annual Financials</button>} />
      ) : (
        <div className="row g-3">
          {records.map((r) => {
            const h = health[r.financialId];
            const revenue = (r.ticketRevenue || 0) + (r.sponsorshipRevenue || 0) + (r.merchandiseRevenue || 0) + (r.mediaRights || 0) + (r.otherRevenue || 0);
            const expenses = (r.playerWages || 0) + (r.staffCosts || 0) + (r.operatingCosts || 0) + (r.depreciationCosts || 0) + (r.otherExpenses || 0);
            return (
              <div className="col-lg-6" key={r.financialId}>
                <div className="card card-pitch h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>{new Date(r.financialYear).getFullYear()}</span>
                    {h && <span className={`badge ${HEALTH_CLASS[h.status] || 'text-bg-secondary'}`}>{h.status}</span>}
                  </div>
                  <div className="card-body">
                    <dl className="row mb-2 small">
                      <dt className="col-7">Revenue (tickets, sponsorship, media, merch)</dt><dd className="col-5 text-end">{formatCurrency(revenue)}</dd>
                      <dt className="col-7">Expenses (wages, staff, operating)</dt><dd className="col-5 text-end">{formatCurrency(expenses)}</dd>
                      <dt className="col-7">Debt</dt><dd className="col-5 text-end">{formatCurrency(r.debt)}</dd>
                      <dt className="col-7">Net worth</dt><dd className="col-5 text-end">{formatCurrency(r.netWorth)}</dd>
                      <dt className="col-7">Consecutive loss-making years</dt><dd className="col-5 text-end">{r.consecutiveLosses}</dd>
                    </dl>
                    {h && <p className="small text-muted">{h.description}</p>}

                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <button className="btn btn-sm btn-outline-success" disabled={busyId === r.financialId} onClick={() => doAction(r.financialId, () => recordProfit(r.financialId))}>Record profit</button>
                      <button className="btn btn-sm btn-outline-danger" disabled={busyId === r.financialId} onClick={() => doAction(r.financialId, () => recordLoss(r.financialId))}>Record loss</button>
                    </div>

                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="number" min="0" className="form-control" placeholder="Amount"
                        value={debtAmounts[r.financialId] || ''}
                        onChange={(e) => setDebtAmounts((s) => ({ ...s, [r.financialId]: e.target.value }))}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        disabled={busyId === r.financialId}
                        onClick={() => doAction(r.financialId, () => addDebt(r.financialId, Number(debtAmounts[r.financialId] || 0)))}
                      >
                        Add debt
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        disabled={busyId === r.financialId}
                        onClick={() => doAction(r.financialId, () => applyRelegationPenalty(r.financialId, Number(debtAmounts[r.financialId] || 0)))}
                      >
                        Relegation penalty
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
