import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTeam, createTeam, updateTeam } from '../../service/teamService';
import { getAllOwners } from '../../service/ownerService';
import { newId } from '../../service/api';
import { Loading, ErrorBanner } from '../../components/PageState';
import LogoPicker from '../../components/LogoPicker';
import CountrySelect from '../../components/CountrySelect';

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
    teamGender: 'MALE',
    hasYouthAcademy: false,
    teamNationality: '',
    ownerId: '',
    teamLogo: null,
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
            teamGender: team.teamGender || 'MALE',
            hasYouthAcademy: team.hasYouthAcademy || false,
            teamNationality: team.teamNationality || '',
            ownerId: team.owner?.ownerId || '',
            teamLogo: team.teamLogo || null,
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : name === 'teamFormationYear' ? Number(value) : value,
    }));
  };

  const buildPayload = (teamId) => ({
    teamId,
    teamName: form.teamName,
    teamFormationYear: form.teamFormationYear,
    teamType: form.teamType,
    teamGender: form.teamGender,
    hasYouthAcademy: form.hasYouthAcademy,
    teamNationality: form.teamNationality || null,
    owner: form.ownerId ? { ownerId: form.ownerId } : null,
    teamLogo: form.teamLogo || null,
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
        <div className="mb-3">
          <label className="form-label">Logo</label>
          <LogoPicker value={form.teamLogo} onChange={(logo) => setForm((f) => ({ ...f, teamLogo: logo }))} suggestedName={form.teamName} />
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
        <div className="row">
          <div className="col-sm-6 mb-3">
            <label className="form-label">Side</label>
            <select className="form-select" name="teamGender" value={form.teamGender} onChange={handleChange}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="col-sm-6 mb-3">
            <label className="form-label">Nationality</label>
            <CountrySelect
              value={form.teamNationality}
              onChange={(name) => setForm((f) => ({ ...f, teamNationality: name }))}
              placeholder="Country the team represents…"
            />
            {form.teamType === 'NATIONAL' && (
              <div className="form-text">
                Players whose nationality matches this country are auto-assigned to this team when created.
              </div>
            )}
          </div>
        </div>
        {form.teamType === 'CLUB' && (
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="hasYouthAcademy"
              name="hasYouthAcademy"
              checked={form.hasYouthAcademy}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="hasYouthAcademy">
              Has a youth academy
            </label>
          </div>
        )}
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
