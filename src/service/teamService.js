import { get, post, put, del } from './api';

const BASE = '/team';

export const getAllTeams = () => get(`${BASE}/all`);
export const getTeam = (id) => get(`${BASE}/${id}`);
export const createTeam = (team) => post(`${BASE}/create`, team);
export const updateTeam = (id, team) => put(`${BASE}/update/${id}`, team);
export const deleteTeam = (id) => del(`${BASE}/delete/${id}`);
