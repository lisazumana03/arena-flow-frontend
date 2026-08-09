import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAllOwners, createOwner, updateOwner } from '../../service/ownerService';
import { newId } from '../../service/api';
import { Loading, ErrorBanner } from '../../components/PageState';
import CountrySelect from '../../components/CountrySelect';

const EMPTY = {
  firstName: '',
  middleName: '',
  lastName: '',
  birthDate: '',
  ownerNationality: '',
  ownershipType: 'PRIVATE_OWNER',
  strategy: 'BALANCED_APPROACH',
  netWorth: '',
  availableFunds: '',
  investmentBudget: '',
  reputation: 50,
};

const OWNERSHIP_TYPES = [
  'PRIVATE_OWNER', 'COMPANY', 'CONSORTIUM', 'SUPPORTERS_TRUST',
  'MUNICIPALITY', 'PRIMARY_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY', 'GOVERNMENT',
];

const STRATEGIES = [
  'AGGRESSIVE_SPENDING', 'YOUTH_DEVELOPMENT', 'INFRASTRUCTURE_INVESTMENT', 'CONSERVATIVE_SPENDING',
  'COMMUNITY_ENGAGEMENT', 'SUSTAINABILITY_FOCUS', 'BRAND_EXPANSION', 'MERGERS_AND_ACQUISITIONS',
  'PROFIT_FOCUS', 'BALANCED_APPROACH', 'SURVIVAL_MODE',
];

export default function OwnerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // No GET /owner/{id} on the backend — load the full list and find the match.
    if (!isEdit) return;
    getAllOwners()
      .then((owners) => {
        const owner = owners.find((o) => o.ownerId === id);
        if (!owner) throw new Error('Owner not found.');
        setForm({
          firstName: owner.ownerName?.firstName || '',
          middleName: owner.ownerName?.middleName || '',
          lastName: owner.ownerName?.lastName || '',
          birthDate: owner.birthDate || '',
          ownerNationality: owner.ownerNationality || '',
          ownershipType: owner.ownershipType || 'PRIVATE_OWNER',
          strategy: owner.strategy || 'BALANCED_APPROACH',
          netWorth: owner.netWorth ?? '',
          availableFunds: owner.availableFunds ?? '',
          investmentBudget: owner.investmentBudget ?? '',
          reputation: owner.reputation ?? 50,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'reputation' ? Number(value) : value }));
  };

  const buildPayload = () => ({
    ownerId: isEdit ? id : newId(),
    ownerName: { firstName: form.firstName, middleName: form.middleName || null, lastName: form.lastName },
    birthDate: form.birthDate || null,
    ownerNationality: form.ownerNationality,
    ownershipType: form.ownershipType,
    strategy: form.strategy,
    netWorth: Number(form.netWorth) || 0,
    availableFunds: Number(form.availableFunds) || 0,
    investmentBudget: Number(form.investmentBudget) || 0,
    reputation: Number(form.reputation),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (isEdit) await updateOwner(payload);
      else await createOwner(payload);
      navigate('/owners');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading owner…" /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-3">{isEdit ? 'Edit Owner' : 'New Owner'}</h1>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="card card-pitch p-4">
        <div className="row">
          <div className="col-sm-4 mb-3">
            <label className="form-label">First name</label>
            <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Middle name</label>
            <input className="form-control" name="middleName" value={form.middleName} onChange={handleChange} />
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Last name</label>
            <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6 mb-3">
            <label className="form-label">Birth date</label>
            <input type="date" className="form-control" name="birthDate" value={form.birthDate} onChange={handleChange} />
          </div>
          <div className="col-sm-6 mb-3">
            <label className="form-label">Nationality</label>
            <CountrySelect value={form.ownerNationality} onChange={(name) => setForm((f) => ({ ...f, ownerNationality: name }))} />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6 mb-3">
            <label className="form-label">Ownership type</label>
            <select className="form-select" name="ownershipType" value={form.ownershipType} onChange={handleChange}>
              {OWNERSHIP_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="col-sm-6 mb-3">
            <label className="form-label">Strategy</label>
            <select className="form-select" name="strategy" value={form.strategy} onChange={handleChange}>
              {STRATEGIES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-4 mb-3">
            <label className="form-label">Net worth</label>
            <input type="number" min="0" className="form-control" name="netWorth" value={form.netWorth} onChange={handleChange} required />
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Available funds</label>
            <input type="number" min="0" className="form-control" name="availableFunds" value={form.availableFunds} onChange={handleChange} required />
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Investment budget</label>
            <input type="number" min="0" className="form-control" name="investmentBudget" value={form.investmentBudget} onChange={handleChange} required />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Reputation: {form.reputation}/100</label>
          <input type="range" min="0" max="100" className="form-range" name="reputation" value={form.reputation} onChange={handleChange} />
        </div>

        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-pitch" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create owner'}
          </button>
          <Link to="/owners" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
