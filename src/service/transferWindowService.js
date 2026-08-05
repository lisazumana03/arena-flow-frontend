import { get, post, put, del } from './api';

const BASE = '/transfer-window';

export const getAllWindows = () => get(`${BASE}/all`);
export const getWindow = (id) => get(`${BASE}/${id}`);
export const getOpenWindows = () => get(`${BASE}/open`);
export const createWindow = (data) => post(`${BASE}/create`, data);
export const updateWindow = (id, data) => put(`${BASE}/update/${id}`, data);
export const deleteWindow = (id) => del(`${BASE}/delete/${id}`);
