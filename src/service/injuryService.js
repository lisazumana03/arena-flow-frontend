import { get, post, put } from './api';

const BASE = '/injuries';

export const reportInjury = (data) => post(`${BASE}/report`, data);
export const updateExpectedReturn = (injuryId, date) => put(`${BASE}/${injuryId}/expected-return?date=${date}`);
export const markRecovered = (injuryId) => post(`${BASE}/${injuryId}/recover`);
export const getActiveInjuries = (playerId) => get(`${BASE}/player/${playerId}/active`);
export const getInjuryHistory = (playerId) => get(`${BASE}/player/${playerId}/history`);
export const isPlayerInjured = (playerId) => get(`${BASE}/player/${playerId}/is-injured`);
