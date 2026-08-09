import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAllPlayers, createPlayer, updatePlayer } from '../../service/playerService';
import { getAllTeams } from '../../service/teamService';
import { newId } from '../../service/api';
import { Loading, ErrorBanner } from '../../components/PageState';
import CountrySelect from '../../components/CountrySelect';

const POSITIONS = [
  'GK', 'LWB', 'LB', 'CB', 'RB', 'RWB', 'LM', 'CM', 'CDM', 'CAM', 'RM', 'LW', 'LF', 'ST', 'CF', 'RF', 'RW',
];

const EMPTY = {
  firstName: '',
  middleName: '',
  lastName: '',
  playerGender: 'MALE',
  playerDateOfBirth: '',
  playerPosition: 'ST',
  playerNationality: '',
  playerHeight: '',
  playerWeight: '',
  teamId: '',
};

export default function PlayerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // The backend has no GET /player/{id}, so for editing we load the full list and
    // find the matching player — the team dropdown load doubles up here too.
    Promise.all([getAllTeams(), isEdit ? getAllPlayers() : Promise.resolve(null)])
      .then(([teamList, players]) => {
        setTeams(teamList);
        if (isEdit) {
          const player = players.find((p) => p.playerId === id);
          if (!player) throw new Error('Player not found.');
          setForm({
            firstName: player.playerName?.firstName || '',
            middleName: player.playerName?.middleName || '',
            lastName: player.playerName?.lastName || '',
            playerGender: player.playerGender || 'MALE',
            playerDateOfBirth: player.playerDateOfBirth || '',
            playerPosition: player.playerPosition || 'ST',
            playerNationality: player.playerNationality || '',
            playerHeight: player.playerHeight ?? '',
            playerWeight: player.playerWeight ?? '',
            teamId: player.team?.teamId || '',
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const buildPayload = () => ({
    playerId: isEdit ? id : newId(),
    playerName: {
      firstName: form.firstName,
      middleName: form.middleName || null,
      lastName: form.lastName,
    },
    playerGender: form.playerGender,
    playerDateOfBirth: form.playerDateOfBirth || null,
    playerPosition: form.playerPosition,
    playerNationality: form.playerNationality,
    playerHeight: form.playerHeight === '' ? 0 : Number(form.playerHeight),
    playerWeight: form.playerWeight === '' ? 0 : Number(form.playerWeight),
    team: form.teamId ? { teamId: form.teamId } : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updatePlayer(id, payload);
      } else {
        await createPlayer(payload);
      }
      navigate('/players');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4"><Loading label="Loading player…" /></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-3">{isEdit ? 'Edit Player' : 'New Player'}</h1>
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
          <div className="col-sm-4 mb-3">
            <label className="form-label">Position</label>
            <select className="form-select" name="playerPosition" value={form.playerPosition} onChange={handleChange}>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Gender</label>
            <select className="form-select" name="playerGender" value={form.playerGender} onChange={handleChange}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Date of birth</label>
            <input type="date" className="form-control" name="playerDateOfBirth" value={form.playerDateOfBirth} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-4 mb-3">
            <label className="form-label">Nationality</label>
            <CountrySelect value={form.playerNationality} onChange={(name) => setForm((f) => ({ ...f, playerNationality: name }))} />
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Height (m)</label>
            <input type="number" step="0.01" className="form-control" name="playerHeight" value={form.playerHeight} onChange={handleChange} />
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Weight (kg)</label>
            <input type="number" step="0.1" className="form-control" name="playerWeight" value={form.playerWeight} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Team</label>
          <select className="form-select" name="teamId" value={form.teamId} onChange={handleChange}>
            <option value="">Unassigned</option>
            {teams.map((t) => (
              <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
            ))}
          </select>
        </div>

        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-pitch" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create player'}
          </button>
          <Link to="/players" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
