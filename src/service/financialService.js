import { get, post } from './api';

const BASE = '/financials';

export const createAnnualFinancials = (data) => post(`${BASE}/create`, data);
export const getFinancialsByTeamAndYear = (teamId, year) => get(`${BASE}/team/${teamId}/year/${year}`);
export const getFinancialsByTeam = (teamId) => get(`${BASE}/team/${teamId}`);
export const getFinancialsByOwner = (ownerId) => get(`${BASE}/owner/${ownerId}`);
export const getFinancialHealth = (financialId) => get(`${BASE}/${financialId}/health`);
export const recordLoss = (financialId) => post(`${BASE}/${financialId}/record-loss`);
export const recordProfit = (financialId) => post(`${BASE}/${financialId}/record-profit`);
export const addDebt = (financialId, amount) => post(`${BASE}/${financialId}/add-debt?amount=${amount}`);
export const applyRelegationPenalty = (financialId, amount) => post(`${BASE}/${financialId}/apply-relegation-penalty?penaltyAmount=${amount}`);
export const getTakeovers = () => get(`${BASE}/takeovers`);
export const getInterventionRequired = () => get(`${BASE}/intervention`);
export const evaluateForcedSale = (teamId) => post(`${BASE}/takeover/evaluate/${teamId}`);
export const executeTakeover = (data) => post(`${BASE}/takeover/execute`, data);
export const injectFunds = (ownerId, teamId, amount) =>
  post(`${BASE}/owner/${ownerId}/inject-funds?teamId=${teamId}&amount=${amount}`);
