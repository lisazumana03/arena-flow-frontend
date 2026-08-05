import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getVenue, createVenue, updateVenue } from '../../service/venueService';
import { newId } from '../../service/api';
import { Loading, ErrorBanner } from '../../components/PageState';

const EMPTY = {
  venueName: '',
  venueType: 'MUNICIPAL_STADIUM',
  city: '',
  address: '',
  capacity: '',
  hasFloodlights: false,
};

export default function VenueForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getVenue(id)
      .then((v) => setForm({
        venueName: v.venueName || '',
        venueType: v.venueType || 'MUNICIPAL_STADIUM',
        city: v.city || '',
        address: v.address || '',
        capacity: v.capacity ?? '',
        hasFloodlights: Boolean(v.hasFloodlights),
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, capacity: Number(form.capacity) || 0 };
    try {
      if (isEdit) {
        await updateVenue(id, { venueId: id, ...payload });
      } else {
        await createVenue({ venueId: newId(), ...payload });
      }
      navigate('/venues');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading venue…" /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <h1 className="h3 mb-3">{isEdit ? 'Edit Venue' : 'New Venue'}</h1>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="card card-pitch p-4">
        <div className="mb-3">
          <label className="form-label">Venue name</label>
          <input className="form-control" name="venueName" value={form.venueName} onChange={handleChange} required placeholder="e.g. Athlone Stadium" />
        </div>
        <div className="row">
          <div className="col-sm-6 mb-3">
            <label className="form-label">Type</label>
            <select className="form-select" name="venueType" value={form.venueType} onChange={handleChange}>
              <option value="COMMUNITY_GROUND">Community Ground</option>
              <option value="MUNICIPAL_STADIUM">Municipal Stadium</option>
              <option value="SOCCER_STADIUM">Soccer Stadium</option>
            </select>
          </div>
          <div className="col-sm-6 mb-3">
            <label className="form-label">Capacity</label>
            <input type="number" min="0" className="form-control" name="capacity" value={form.capacity} onChange={handleChange} required />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">City</label>
          <input className="form-control" name="city" value={form.city} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input className="form-control" name="address" value={form.address} onChange={handleChange} />
        </div>
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="hasFloodlights" name="hasFloodlights" checked={form.hasFloodlights} onChange={handleChange} />
          <label className="form-check-label" htmlFor="hasFloodlights">Has floodlights</label>
        </div>
        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-pitch" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create venue'}
          </button>
          <Link to="/venues" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
