import { get, post } from './api';

const BASE = '/matches';

export const scheduleMatch = (data) => post(`${BASE}/schedule`, data);
export const completeMatch = (matchId, homeScore, awayScore) =>
  post(`${BASE}/${matchId}/complete?homeScore=${homeScore}&awayScore=${awayScore}`);
export const getMatch = (matchId) => get(`${BASE}/${matchId}`);
export const getUpcomingMatches = () => get(`${BASE}/upcoming`);
export const getCompletedMatches = () => get(`${BASE}/completed`);
export const getTeamMatches = (teamId) => get(`${BASE}/team/${teamId}`);
export const getSeasonMatches = (seasonId) => get(`${BASE}/season/${seasonId}`);
export const recordFinancials = (matchId, data) => post(`${BASE}/${matchId}/record-financials`, data);
export const updateStandingsAfterMatch = (matchId) => post(`${BASE}/${matchId}/update-standings`);
