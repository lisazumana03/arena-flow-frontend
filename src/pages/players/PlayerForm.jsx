import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAllPlayers, createPlayer, updatePlayer } from '../../service/playerService';
import { getAllTeams } from '../../service/teamService';
import { getAllSeasons, getCurrentSeason } from '../../service/seasonService';
import { createSquadRegistration } from '../../service/squadRegistrationService';
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
  clubId: '',
  clubKitNumber: '',
  seasonId: '',
  nationalTeamId: '',
  nationalTeamKitNumber: '',
};

export default function PlayerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const clubs = teams.filter((t) => t.teamType === 'CLUB');
  const nationalTeams = teams.filter((t) => t.teamType === 'NATIONAL');

  useEffect(() => {
    // The backend has no GET /player/{id}, so for editing we load the full list and
    // find the matching player — the team dropdown load doubles up here too.
    Promise.all([
      getAllTeams(),
      getAllSeasons().catch(() => []),
      getCurrentSeason().catch(() => null),
      isEdit ? getAllPlayers() : Promise.resolve(null),
    ])
      .then(([teamList, seasonList, currentSeason, players]) => {
        setTeams(teamList);
        setSeasons(seasonList || []);
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
            clubId: player.club?.teamId || '',
            clubKitNumber: '',
            seasonId: currentSeason?.seasonId || '',
            nationalTeamId: player.nationalTeam?.teamId || '',
            nationalTeamKitNumber: player.nationalTeamKitNumber ?? '',
          });
        } else {
          setForm((f) => ({ ...f, seasonId: currentSeason?.seasonId || '' }));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const buildPlayerPayload = (playerId) => ({
    playerId,
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
    // Football rule: a player must play for a club and must represent a national team.
    club: form.clubId ? { teamId: form.clubId } : null,
    nationalTeam: form.nationalTeamId ? { teamId: form.nationalTeamId } : null,
    // The national team kit number is never auto-derived - it's always set by hand here.
    nationalTeamKitNumber: form.nationalTeamKitNumber === '' ? null : Number(form.nationalTeamKitNumber),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const playerId = isEdit ? id : newId();
      const payload = buildPlayerPayload(playerId);
      if (isEdit) {
        await updatePlayer(id, payload);
      } else {
        await createPlayer(payload);
      }

      // Assigning a player to a club always requires a kit number, enforced by the
      // squad-registration record (and unique per team + season).
      if (!isEdit && form.clubId) {
        await createSquadRegistration({
          squadRegistrationId: newId(),
          player: { playerId },
          team: { teamId: form.clubId },
          season: { seasonId: form.seasonId },
          kitNumber: Number(form.clubKitNumber),
          registrationDate: new Date().toISOString().slice(0, 10),
          status: 'ACTIVE',
        });
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

        <hr className="my-1" />
        <p className="text-muted small mb-2">Every player must play for a club and represent a national team.</p>

        <div className="row">
          <div className="col-sm-4 mb-3">
            <label className="form-label">Club</label>
            <select className="form-select" name="clubId" value={form.clubId} onChange={handleChange} required disabled={isEdit}>
              <option value="">Select a club…</option>
              {clubs.map((t) => (
                <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
              ))}
            </select>
            {isEdit && (
              <div className="form-text">Club changes go through the Transfers page.</div>
            )}
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Club kit number</label>
            <input
              type="number"
              min="1"
              className="form-control"
              name="clubKitNumber"
              value={form.clubKitNumber}
              onChange={handleChange}
              required={!isEdit}
              disabled={isEdit}
              placeholder="e.g. 9"
            />
            {isEdit && (
              <div className="form-text">Club kit numbers are changed via transfers or squad registration, not here.</div>
            )}
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">Season</label>
            <select className="form-select" name="seasonId" value={form.seasonId} onChange={handleChange} required={!isEdit} disabled={isEdit}>
              <option value="">Select a season…</option>
              {seasons.map((s) => (
                <option key={s.seasonId} value={s.seasonId}>{s.seasonName || s.seasonId}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-4 mb-3">
            <label className="form-label">National team</label>
            <select className="form-select" name="nationalTeamId" value={form.nationalTeamId} onChange={handleChange} required>
              <option value="">Select a national team…</option>
              {nationalTeams.map((t) => (
                <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
              ))}
            </select>
          </div>
          <div className="col-sm-4 mb-3">
            <label className="form-label">National team kit number</label>
            <input
              type="number"
              min="1"
              className="form-control"
              name="nationalTeamKitNumber"
              value={form.nationalTeamKitNumber}
              onChange={handleChange}
              required
              placeholder="Manually assigned"
            />
          </div>
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
