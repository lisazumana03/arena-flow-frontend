import { get, post, put, del } from './api';

const BASE = '/player';

export const getAllPlayers = () => get(`${BASE}/all`);
export const createPlayer = (player) => post(`${BASE}/create`, player);
export const updatePlayer = (id, player) => put(`${BASE}/update/${id}`, player);
export const deletePlayer = (id) => del(`${BASE}/delete/${id}`);
