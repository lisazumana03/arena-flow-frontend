import { get, post, put, del } from './api';

const BASE = '/officials';

export const assignOfficials = (matchId, data) => post(`${BASE}/match/${matchId}/assign`, data);
export const getOfficialsForMatch = (matchId) => get(`${BASE}/match/${matchId}`);
export const updateOfficials = (id, data) => put(`${BASE}/update/${id}`, data);
export const deleteOfficials = (id) => del(`${BASE}/delete/${id}`);
