import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTournaments } from '../../service/tournamentService';
import { Loading, ErrorBanner, EmptyState } from '../../components/PageState';
import LogoBadge from '../../components/LogoBadge';

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllTournaments().then(setTournaments).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Tournaments</h1>
        <Link to="/tournaments/new" className="btn btn-pitch">+ New Tournament</Link>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Loading label="Loading tournaments…" />
      ) : tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments yet"
          hint="Create a competition template — e.g. Premier League, FA Cup — then add yearly editions to it."
          action={<Link to="/tournaments/new" className="btn btn-pitch">+ New Tournament</Link>}
        />
      ) : (
        <div className="row g-3">
          {tournaments.map((t) => (
            <div className="col-md-6 col-lg-4" key={t.tournamentId}>
              <Link to={`/tournaments/${t.tournamentId}`} className="text-decoration-none">
                <div className="card card-pitch h-100">
                  <div className="card-header d-flex align-items-center gap-2">
                    <LogoBadge base64={t.tournamentLogo} size={28} alt={t.tournamentName} />
                    {t.tournamentName}
                  </div>
                  <div className="card-body">
                    <span className="badge badge-pitch mb-2">{t.format}</span>
                    {t.pyramidLevel > 0 && (
                      <span className="badge text-bg-light border mb-2 ms-1">Tier {t.pyramidLevel}</span>
                    )}
                    <p className="text-muted small mb-0">{t.description || 'No description yet.'}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
