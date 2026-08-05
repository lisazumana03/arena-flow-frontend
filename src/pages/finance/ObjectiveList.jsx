import { useEffect, useState } from 'react';
import { getAllObjectives, createObjective, updateProgress, markAsAchieved, deleteObjective } from '../../service/objectiveService';
import { getAllOwners } from '../../service/ownerService';
import { getAllTeams } from '../../service/teamService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';

const OBJECTIVE_TYPES = [
  'WIN_LEAGUE', 'QUALIFY_FOR_CONTINENTAL_COMPETITION', 'AVOID_RELEGATION', 'WIN_DOMESTIC_CUP',
  'ACHIEVE_PLAYOFF_SPOT', 'DEVELOP_YOUNG_PLAYERS', 'IMPROVE_FINANCIAL_STABILITY', 'ESTABLISH_WINNING_CULTURE',
  'EXPAND_STADIUM', 'WIN_CONTINENTAL_TROPHY', 'REACH_SPECIFIC_LEAGUE_POSITION', 'INCREASE_CLUB_VALUE',
  'ACHIEVE_BREAK_EVEN_BUDGET', 'ATTRACT_SPONSORSHIPS', 'BUILD_ACADEMY',
];

function fullName(name) {
  if (!name) return '—';
  return [name.firstName, name.lastName].filter(Boolean).join(' ');
}

export default function ObjectiveList() {
  const [objectives, setObjectives] = useState([]);
  const [owners, setOwners] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ownerId: '', teamId: '', objectiveType: 'WIN_LEAGUE', priority: 3 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getAllObjectives(), getAllOwners(), getAllTeams()])
      .then(([o, ow, t]) => { setObjectives(o); setOwners(ow); setTeams(t); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createObjective({
        owner: { ownerId: form.ownerId },
        team: form.teamId ? { teamId: form.teamId } : null,
        objectiveType: form.objectiveType,
        priority: Number(form.priority),
      });
      setShowForm(false);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const doProgress = async (id, value) => {
    setBusyId(id);
    setError('');
    try {
      await updateProgress(id, value);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusyId(null);
    }
  };

  const doAchieve = async (id) => {
    setBusyId(id);
    setError('');
    try {
      await markAsAchieved(id);
      load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this objective?')) return;
    setBusyId(id);
    setError('');
    try {
      await deleteObjective(id);
      setObjectives((prev) => prev.filter((o) => o.objectiveId !== id));
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Owner Objectives</h1>
        <button className="btn btn-pitch" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Objective'}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pitch p-3 mb-4">
          <div className="row">
            <div className="col-sm-4 mb-2">
              <label className="form-label">Owner</label>
              <select className="form-select" value={form.ownerId} onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))} required>
                <option value="">Select…</option>
                {owners.map((o) => <option key={o.ownerId} value={o.ownerId}>{fullName(o.ownerName)}</option>)}
              </select>
            </div>
            <div className="col-sm-4 mb-2">
              <label className="form-label">Team (optional)</label>
              <select className="form-select" value={form.teamId} onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}>
                <option value="">Not team-specific</option>
                {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="col-sm-4 mb-2">
              <label className="form-label">Priority: {form.priority}/5</label>
              <input type="range" min="1" max="5" className="form-range" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} />
            </div>
          </div>
          <div className="mb-2">
            <label className="form-label">Objective</label>
            <select className="form-select" value={form.objectiveType} onChange={(e) => setForm((f) => ({ ...f, objectiveType: e.target.value }))}>
              {OBJECTIVE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div><button type="submit" className="btn btn-pitch btn-sm" disabled={saving}>{saving ? 'Creating…' : 'Create objective'}</button></div>
        </form>
      )}

      {loading ? (
        <Loading label="Loading objectives…" />
      ) : objectives.length === 0 ? (
        <EmptyState title="No objectives set yet" action={<button className="btn btn-pitch" onClick={() => setShowForm(true)}>+ New Objective</button>} />
      ) : (
        <div className="row g-3">
          {objectives.map((o) => (
            <div className="col-lg-6" key={o.objectiveId}>
              <div className="card card-pitch h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>{o.objectiveType?.replace(/_/g, ' ')}</span>
                  {o.achieved && <span className="badge badge-pitch">Achieved</span>}
                </div>
                <div className="card-body">
                  <p className="mb-1"><strong>Owner:</strong> {fullName(o.owner?.ownerName)}</p>
                  <p className="mb-1"><strong>Team:</strong> {o.team?.teamName || 'Club-wide'}</p>
                  <p className="mb-2"><strong>Priority:</strong> {o.priority}/5</p>

                  <div className="d-flex justify-content-between small mb-1">
                    <span>Progress</span><span>{o.progressPercentage}%</span>
                  </div>
                  <div className="progress mb-2" style={{ height: 6 }}>
                    <div className="progress-bar bg-success" style={{ width: `${o.progressPercentage}%` }}></div>
                  </div>
                  <input
                    type="range" min="0" max="100" className="form-range mb-2"
                    defaultValue={o.progressPercentage}
                    disabled={o.achieved || busyId === o.objectiveId}
                    onMouseUp={(e) => doProgress(o.objectiveId, Number(e.target.value))}
                    onTouchEnd={(e) => doProgress(o.objectiveId, Number(e.target.value))}
                  />

                  <div className="d-flex gap-2">
                    {!o.achieved && (
                      <button className="btn btn-sm btn-outline-pitch" disabled={busyId === o.objectiveId} onClick={() => doAchieve(o.objectiveId)}>
                        Mark achieved
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-danger" disabled={busyId === o.objectiveId} onClick={() => doDelete(o.objectiveId)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
