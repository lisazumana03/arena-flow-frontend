import { get, post, put, del } from './api';

const BASE = '/transfer';

export const getAllTransfers = () => get(`${BASE}/all`);
export const getTransfer = (id) => get(`${BASE}/${id}`);
export const createTransfer = (data) => post(`${BASE}/create`, data);
export const getTransfersByWindow = (windowId) => get(`${BASE}/window/${windowId}`);
export const getTransfersByStatus = (status) => get(`${BASE}/status/${status}`);
export const updateTransfer = (id, data) => put(`${BASE}/update/${id}`, data);
export const advanceStatus = (id, next) => put(`${BASE}/${id}/status?next=${next}`);
export const finalizeTransfer = (id, { seasonId, buyingTeamBudgetId, newKitNumber }) =>
  post(`${BASE}/${id}/finalize?seasonId=${seasonId}&buyingTeamBudgetId=${buyingTeamBudgetId}&newKitNumber=${newKitNumber}`);
export const deleteTransfer = (id) => del(`${BASE}/delete/${id}`);
