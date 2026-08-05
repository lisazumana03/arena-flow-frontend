import { get, post } from './api';

const BASE = '/tournaments';

export const getAllTournaments = () => get(BASE);
export const getTournament = (id) => get(`${BASE}/${id}`);
export const createTournament = (data) => post(`${BASE}/create`, data);

// Editions (a specific yearly run of a tournament, e.g. "Premier League 2027")
export const getEditions = (tournamentId) => get(`${BASE}/${tournamentId}/editions`);
export const createEdition = (tournamentId, data) => post(`${BASE}/${tournamentId}/editions`, data);

// Team entries within one edition
export const getEntriesForSeason = (seasonId) => get(`${BASE}/editions/${seasonId}/teams`);
export const registerTeam = (seasonId, data) => post(`${BASE}/editions/${seasonId}/teams`, data);
export const getStandingsForSeason = (seasonId) => get(`${BASE}/editions/${seasonId}/standings`);
export const getEntriesForTeam = (teamId) => get(`${BASE}/teams/${teamId}/entries`);

// Groups (HYBRID / group-stage formats)
export const getGroupNames = (seasonId) => get(`${BASE}/editions/${seasonId}/groups`);
export const getGroupStandings = (seasonId, groupName) =>
  get(`${BASE}/editions/${seasonId}/groups/${encodeURIComponent(groupName)}`);
export const getThirdPlaceRanking = (seasonId) => get(`${BASE}/editions/${seasonId}/third-place-ranking`);
export const qualifyBestThirdPlaced = (seasonId, spots) =>
  post(`${BASE}/editions/${seasonId}/third-place-ranking/qualify?spots=${spots}`);
