import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTeam, createTeam, updateTeam } from '../../service/teamService';
import { getAllOwners } from '../../service/ownerService';
import { newId } from '../../service/api';
import { Loading, ErrorBanner } from '../../components/PageState';

const CURRENT_YEAR = new Date().getFullYear();

function fullName(name) {
  if (!name) return 'Unnamed owner';
  return [name.firstName, name.lastName].filter(Boolean).join(' ');
}

export default function TeamForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    teamName: '',
    teamFormationYear: CURRENT_YEAR,
    teamType: 'CLUB',
    ownerId: '',
  });
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllOwners().catch(() => []), isEdit ? getTeam(id) : Promise.resolve(null)])
      .then(([ownerList, res]) => {
        setOwners(ownerList);
        if (isEdit) {
          const team = res?.teamId ? res : res?.value;
          if (!team) throw new Error('Team not found.');
          setForm({
            teamName: team.teamName || '',
            teamFormationYear: team.teamFormationYear || CURRENT_YEAR,
            teamType: team.teamType || 'CLUB',
            ownerId: team.owner?.ownerId || '',
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'teamFormationYear' ? Number(value) : value }));
  };

  const buildPayload = (teamId) => ({
    teamId,
    teamName: form.teamName,
    teamFormationYear: form.teamFormationYear,
    teamType: form.teamType,
    owner: form.ownerId ? { ownerId: form.ownerId } : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateTeam(id, buildPayload(id));
      } else {
        await createTeam(buildPayload(newId()));
      }
      navigate('/teams');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading team…" /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <h1 className="h3 mb-3">{isEdit ? 'Edit Team' : 'New Team'}</h1>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="card card-pitch p-4">
        <div className="mb-3">
          <label className="form-label">Team name</label>
          <input
            className="form-control"
            name="teamName"
            value={form.teamName}
            onChange={handleChange}
            required
            placeholder="e.g. Cape Town City FC"
          />
        </div>
        <div className="row">
          <div className="col-sm-6 mb-3">
            <label className="form-label">Formation year</label>
            <input
              type="number"
              className="form-control"
              name="teamFormationYear"
              value={form.teamFormationYear}
              onChange={handleChange}
              min="1850"
              max={CURRENT_YEAR}
              required
            />
          </div>
          <div className="col-sm-6 mb-3">
            <label className="form-label">Type</label>
            <select className="form-select" name="teamType" value={form.teamType} onChange={handleChange}>
              <option value="CLUB">Club</option>
              <option value="NATIONAL">National</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Owner</label>
          <select className="form-select" name="ownerId" value={form.ownerId} onChange={handleChange}>
            <option value="">No owner assigned</option>
            {owners.map((o) => <option key={o.ownerId} value={o.ownerId}>{fullName(o.ownerName)}</option>)}
          </select>
          <div className="form-text">Owners are managed on the <Link to="/owners">Owners</Link> page.</div>
        </div>
        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-pitch" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create team'}
          </button>
          <Link to="/teams" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
