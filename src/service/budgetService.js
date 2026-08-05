import { get, post } from './api';

const BASE = '/budgets';

export const getAllBudgets = () => get(BASE);
export const createBudget = (data) => post(`${BASE}/create`, data);
export const getBudgetByTeamAndYear = (teamId, year) => get(`${BASE}/team/${teamId}/year/${year}`);
export const getBudgetsByTeam = (teamId) => get(`${BASE}/team/${teamId}`);
export const getBudgetsByOwner = (ownerId) => get(`${BASE}/owner/${ownerId}`);
export const spendTransferBudget = (budgetId, amount) => post(`${BASE}/${budgetId}/spend-transfer?amount=${amount}`);
export const spendWageBudget = (budgetId, amount) => post(`${BASE}/${budgetId}/spend-wages?amount=${amount}`);
export const spendAcademyBudget = (budgetId, amount) => post(`${BASE}/${budgetId}/spend-academy?amount=${amount}`);
export const getBudgetHealth = (budgetId) => get(`${BASE}/${budgetId}/health`);
export const freezeBudget = (budgetId) => post(`${BASE}/${budgetId}/freeze`);
export const unfreezeBudget = (budgetId) => post(`${BASE}/${budgetId}/unfreeze`);
