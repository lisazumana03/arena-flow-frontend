import { get, post, put, del } from './api';

const BASE = '/owner';

export const getAllOwners = () => get(`${BASE}/all`);
export const createOwner = (owner) => post(`${BASE}/create`, owner);
// Note: the backend's update endpoint takes no path param — it saves whatever
// ownerId is embedded in the body, so the payload must always include it.
export const updateOwner = (owner) => put(`${BASE}/update`, owner);
export const deleteOwner = (id) => del(`${BASE}/delete/${id}`);
