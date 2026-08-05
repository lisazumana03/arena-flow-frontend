import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllVenues, deleteVenue } from '../../service/venueService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';

const TYPE_LABEL = {
  COMMUNITY_GROUND: 'Community Ground',
  MUNICIPAL_STADIUM: 'Municipal Stadium',
  SOCCER_STADIUM: 'Soccer Stadium',
};

export default function VenueList() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    getAllVenues().then(setVenues).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteVenue(id);
      setVenues((prev) => prev.filter((v) => v.venueId !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Venues</h1>
        <Link to="/venues/new" className="btn btn-pitch">+ New Venue</Link>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {loading ? (
        <Loading label="Loading venues…" />
      ) : venues.length === 0 ? (
        <EmptyState
          title="No venues yet"
          hint="Add a ground so matches can be scheduled somewhere real."
          action={<Link to="/venues/new" className="btn btn-pitch">+ New Venue</Link>}
        />
      ) : (
        <div className="row g-3">
          {venues.map((v) => (
            <div className="col-md-6 col-lg-4" key={v.venueId}>
              <div className="card card-pitch h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>{v.venueName}</span>
                  {v.hasFloodlights && <span title="Floodlights">💡</span>}
                </div>
                <div className="card-body">
                  <p className="mb-1"><span className="badge badge-pitch">{TYPE_LABEL[v.venueType] || v.venueType}</span></p>
                  <p className="mb-1 text-muted">{v.city}</p>
                  <p className="mb-1 small">{v.address}</p>
                  <p className="mb-3 small">Capacity: {v.capacity?.toLocaleString?.() ?? v.capacity}</p>
                  <div className="d-flex gap-2">
                    <Link to={`/venues/${v.venueId}/edit`} className="btn btn-sm btn-outline-pitch">Edit</Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={deletingId === v.venueId}
                      onClick={() => handleDelete(v.venueId, v.venueName)}
                    >
                      {deletingId === v.venueId ? 'Deleting…' : 'Delete'}
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
