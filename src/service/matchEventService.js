import { get, post } from './api';

const BASE = '/match-event';

export const recordGoal = (matchId, data) => post(`${BASE}/${matchId}/goal`, data);
export const recordCard = (matchId, data) => post(`${BASE}/${matchId}/card`, data);
export const recordSubstitution = (matchId, data) => post(`${BASE}/${matchId}/substitution`, data);
export const recordCorner = (matchId, teamId, minute) => post(`${BASE}/${matchId}/corner?teamId=${teamId}&minute=${minute}`);
export const recordFreeKick = (matchId, data) => post(`${BASE}/${matchId}/free-kick`, data);
export const recordInjury = (matchId, data) => post(`${BASE}/${matchId}/injury`, data);
export const getMatchEvents = (matchId) => get(`${BASE}/match/${matchId}`);
export const getMatchEventsByType = (matchId, eventType) => get(`${BASE}/match/${matchId}/type/${eventType}`);
export const finalizeMatch = (matchId) => post(`${BASE}/${matchId}/finalize`);
