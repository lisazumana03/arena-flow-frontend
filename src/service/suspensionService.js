import { get, post } from './api';

const BASE = '/suspensions';

export const issueSuspension = (data) => post(`${BASE}/issue`, data);
export const getActiveSuspensions = (playerId) => get(`${BASE}/player/${playerId}/active`);
export const getSuspensionHistory = (playerId) => get(`${BASE}/player/${playerId}/history`);
export const isPlayerSuspended = (playerId) => get(`${BASE}/player/${playerId}/is-suspended`);
