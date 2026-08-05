import { get, post, put, del } from './api';

const BASE = '/venue';

export const getAllVenues = () => get(`${BASE}/all`);
export const getVenue = (id) => get(`${BASE}/${id}`);
export const getVenuesByType = (type) => get(`${BASE}/type/${type}`);
export const createVenue = (venue) => post(`${BASE}/create`, venue);
export const updateVenue = (id, venue) => put(`${BASE}/update/${id}`, venue);
export const deleteVenue = (id) => del(`${BASE}/delete/${id}`);
