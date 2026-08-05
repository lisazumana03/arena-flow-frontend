import { get, post } from './api';

const BASE = '/seasons';

export const getAllSeasons = () => get(BASE);
export const getCurrentSeason = () => get(`${BASE}/current`);
export const getSeasonById = (seasonId) => get(`${BASE}/${seasonId}`);
export const createSeason = (data) => post(`${BASE}/create`, data);
export const startSeason = (seasonId) => post(`${BASE}/${seasonId}/start`);
export const completeSeason = (seasonId) => post(`${BASE}/${seasonId}/complete`);

// Full league-table style standings (games played, W/D/L, goal difference, points)
export const getStandings = (seasonId) => get(`${BASE}/${seasonId}/standings`);
export const getTeamStanding = (seasonId, teamId) => get(`${BASE}/${seasonId}/standings/${teamId}`);
export const recalculateStandings = (seasonId) => post(`${BASE}/${seasonId}/recalculate-standings`);
