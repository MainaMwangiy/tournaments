import { createAction } from '@reduxjs/toolkit';

export const loginSuccess = createAction('auth/loginSuccess');
export const logout = createAction('auth/logout');
export const adminLogin = createAction('auth/adminLogin');
export const createTournament = createAction('tournament/create');
export const addPlayer = createAction('tournament/addPlayer');
export const updateBracket = createAction('tournament/updateBracket');
export const startTournament = createAction('tournament/start');
export const updateMatchResult = createAction('tournament/updateMatchResult');
export const endTournament = createAction('tournament/end');
export const generateTournamentUrl = createAction('tournament/generateUrl');