// Additional Redux Actions for API Integration
import { createAction } from "@reduxjs/toolkit"

// Existing actions
export const loginSuccess = createAction("auth/loginSuccess")
export const logout = createAction("auth/logout")
export const adminLogin = createAction("auth/adminLogin")
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

// New actions for API integration
export const setTournaments = createAction("tournaments/setAll")
export const setLoading = createAction("app/setLoading")
export const setError = createAction("app/setError")
export const clearError = createAction("app/clearError")
