import { get, post } from './api';

const BASE = '/squad-registration';

export const createSquadRegistration = (registration) => post(`${BASE}/create`, registration);
export const getPlayerRegistrationHistory = (playerId) => get(`${BASE}/player/${playerId}`);
export const getSquad = (teamId, seasonId) => get(`${BASE}/squad?teamId=${teamId}&seasonId=${seasonId}`);
