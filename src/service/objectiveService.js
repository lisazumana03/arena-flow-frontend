import { get, post, put, del } from './api';

const BASE = '/objectives';

export const getAllObjectives = () => get(BASE);
export const createObjective = (data) => post(`${BASE}/create`, data);
export const updateProgress = (objectiveId, progressPercentage) =>
  put(`${BASE}/${objectiveId}/progress?progressPercentage=${progressPercentage}`);
export const markAsAchieved = (objectiveId) => put(`${BASE}/${objectiveId}/achieve`);
export const deleteObjective = (objectiveId) => del(`${BASE}/${objectiveId}`);
