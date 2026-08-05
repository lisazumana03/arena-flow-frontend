import { get, post } from './api';

const BASE = '/lineup';

export const namePlayer = (matchId, teamId, data) => post(`${BASE}/match/${matchId}/team/${teamId}/name-player`, data);
export const getLineupForMatch = (matchId) => get(`${BASE}/match/${matchId}`);
export const getLineupForMatchAndTeam = (matchId, teamId) => get(`${BASE}/match/${matchId}/team/${teamId}`);
export const getStartingXI = (matchId, teamId) => get(`${BASE}/match/${matchId}/team/${teamId}/starting-xi`);
export const substitutePlayerOff = (matchId, playerId, minute) =>
  post(`${BASE}/match/${matchId}/player/${playerId}/substitute-off?minute=${minute}`);
