import { createAction } from "@reduxjs/toolkit"

export const loginSuccess = createAction("auth/loginSuccess")
export const logout = createAction("auth/logout")
export const adminLogin = createAction("auth/adminLogin") // Re-added adminLogin export that was being imported elsewhere
export const ssoLoginSuccess = createAction("auth/ssoLoginSuccess")
export const createTournament = createAction("tournament/create")
export const addPlayer = createAction("tournament/addPlayer")
export const updateBracket = createAction("tournament/updateBracket")
export const startTournament = createAction("tournament/start")
export const updateMatchResult = createAction("tournament/updateMatchResult")
export const endTournament = createAction("tournament/end")
export const generateTournamentUrl = createAction("tournament/generateUrl")
export const selectTournament = createAction("tournament/select")
export const saveEntryList = createAction("tournament/saveEntryList")
