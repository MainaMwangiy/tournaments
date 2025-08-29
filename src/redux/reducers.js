import { createReducer } from "@reduxjs/toolkit"
import {
  loginSuccess,
  logout,
  adminLogin,
  createTournament,
  addPlayer,
  updateBracket,
  startTournament,
  updateMatchResult,
  endTournament,
  generateTournamentUrl,
  selectTournament,
  saveEntryList,
} from "./actions"

const initialState = {
  auth: {
    isLoggedIn: false,
    user: null,
    isAdmin: false,
  },
  tournament: {
    id: null,
    name: "",
    type: "",
    format: "",
    players: [],
    bracket: [],
    status: "pending",
    shareUrl: null,
    entryList: [],
  },
  tournaments: [
    {
      id: 1,
      name: "Spring Pool Championship",
      type: "Pool (Billiards)",
      format: "Knockout",
      status: "completed",
      players: 16,
      createdDate: "2024-03-15",
      winner: "John Smith",
      entryList: [],
    },
    {
      id: 2,
      name: "Weekend Darts Tournament",
      type: "Darts",
      format: "Knockout",
      status: "in-progress",
      players: 8,
      createdDate: "2024-03-20",
      winner: null,
      entryList: [],
    },
    {
      id: 3,
      name: "Car Show Competition",
      type: "Cars",
      format: "Round Robin",
      status: "pending",
      players: 12,
      createdDate: "2024-03-22",
      winner: null,
      entryList: [],
    },
  ],
}

export const rootReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loginSuccess, (state, action) => {
      state.auth.isLoggedIn = true
      state.auth.user = action.payload
    })
    .addCase(logout, (state) => {
      state.auth.isLoggedIn = false
      state.auth.user = null
      state.auth.isAdmin = false
    })
    .addCase(adminLogin, (state) => {
      state.auth.isAdmin = true
    })
    .addCase(selectTournament, (state, action) => {
      const tournament = action.payload
      state.tournament.id = tournament.id.toString()
      state.tournament.name = tournament.name
      state.tournament.type = tournament.type
      state.tournament.format = tournament.format
      state.tournament.status = tournament.status
      state.tournament.entryList = tournament.entryList || []
      state.tournament.players = []
      state.tournament.bracket = []
      state.tournament.shareUrl = tournament.shareUrl || null
    })
    .addCase(createTournament, (state, action) => {
      const newTournament = {
        id: Date.now(),
        name: action.payload.name || "Unnamed Tournament",
        type: action.payload.type,
        format: action.payload.format,
        status: "pending",
        players: 0,
        createdDate: new Date().toISOString().split("T")[0],
        winner: null,
        entryList: [],
      }

      state.tournaments.push(newTournament)

      state.tournament.id = newTournament.id.toString()
      state.tournament.name = newTournament.name
      state.tournament.type = newTournament.type
      state.tournament.format = newTournament.format
      state.tournament.players = []
      state.tournament.bracket = []
      state.tournament.status = "pending"
      state.tournament.shareUrl = null
      state.tournament.entryList = []
    })
    .addCase(addPlayer, (state, action) => {
      const player = {
        ...action.payload,
        seed: Math.floor(Math.random() * 100) + 1,
        id: Date.now() + Math.random(),
      }
      state.tournament.players.push(player)

      state.tournament.entryList.push(player)

      const tournamentIndex = state.tournaments.findIndex((t) => t.id === Number.parseInt(state.tournament.id))
      if (tournamentIndex !== -1) {
        state.tournaments[tournamentIndex].players = state.tournament.players.length
        state.tournaments[tournamentIndex].entryList = state.tournament.entryList
      }
    })
    .addCase(updateBracket, (state, action) => {
      state.tournament.bracket = action.payload
    })
    .addCase(startTournament, (state) => {
      state.tournament.status = "in-progress"

      const tournamentIndex = state.tournaments.findIndex((t) => t.id === Number.parseInt(state.tournament.id))
      if (tournamentIndex !== -1) {
        state.tournaments[tournamentIndex].status = "in-progress"
      }
    })
    .addCase(updateMatchResult, (state, action) => {
      const { round, matchIndex, score1, score2 } = action.payload

      if (state.tournament.bracket[round] && state.tournament.bracket[round][matchIndex]) {
        state.tournament.bracket[round][matchIndex] = {
          ...state.tournament.bracket[round][matchIndex],
          score1,
          score2,
        }

        if (round < state.tournament.bracket.length - 1) {
          const nextRound = round + 1
          const nextMatchIndex = Math.floor(matchIndex / 2)
          const winner =
            score1 > score2
              ? state.tournament.bracket[round][matchIndex].player1
              : state.tournament.bracket[round][matchIndex].player2

          if (state.tournament.bracket[nextRound] && state.tournament.bracket[nextRound][nextMatchIndex]) {
            const nextMatch = state.tournament.bracket[nextRound][nextMatchIndex]

            if (matchIndex % 2 === 0) {
              state.tournament.bracket[nextRound][nextMatchIndex] = {
                ...nextMatch,
                player1: winner,
                score1: 0,
                score2: nextMatch.score2 || 0,
              }
            } else {
              state.tournament.bracket[nextRound][nextMatchIndex] = {
                ...nextMatch,
                player2: winner,
                score1: nextMatch.score1 || 0,
                score2: 0,
              }
            }
          }
        }

        if (round === state.tournament.bracket.length - 1 && score1 !== score2) {
          state.tournament.status = "ended"

          const winner =
            score1 > score2
              ? state.tournament.bracket[round][matchIndex].player1.name
              : state.tournament.bracket[round][matchIndex].player2.name

          const tournamentIndex = state.tournaments.findIndex((t) => t.id === Number.parseInt(state.tournament.id))
          if (tournamentIndex !== -1) {
            state.tournaments[tournamentIndex].status = "ended"
            state.tournaments[tournamentIndex].winner = winner
          }
        }
      }
    })
    .addCase(endTournament, (state) => {
      state.tournament.status = "ended"

      const tournamentIndex = state.tournaments.findIndex((t) => t.id === Number.parseInt(state.tournament.id))
      if (tournamentIndex !== -1) {
        state.tournaments[tournamentIndex].status = "ended"
      }
    })
    .addCase(generateTournamentUrl, (state) => {
      if (state.tournament.id && !state.tournament.shareUrl) {
        state.tournament.shareUrl = `/tournament/${state.tournament.id}`
      }
    })
    .addCase(saveEntryList, (state, action) => {
      state.tournament.entryList = action.payload

      const tournamentIndex = state.tournaments.findIndex((t) => t.id === Number.parseInt(state.tournament.id))
      if (tournamentIndex !== -1) {
        state.tournaments[tournamentIndex].entryList = action.payload
      }
    })
})
