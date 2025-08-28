import { createReducer } from '@reduxjs/toolkit';
import { loginSuccess, logout, adminLogin, createTournament, addPlayer, updateBracket, startTournament, updateMatchResult, endTournament, generateTournamentUrl } from './actions';

const initialState = {
  auth: {
    isLoggedIn: false,
    user: null,
    isAdmin: false,
  },
  tournament: {
    id: null,
    name: '', // New field for tournament name
    type: '',
    format: '',
    players: [],
    bracket: [],
    status: 'pending',
    shareUrl: null,
  },
};

export const rootReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loginSuccess, (state, action) => {
      state.auth.isLoggedIn = true;
      state.auth.user = action.payload;
    })
    .addCase(logout, (state) => {
      state.auth.isLoggedIn = false;
      state.auth.user = null;
      state.auth.isAdmin = false;
    })
    .addCase(adminLogin, (state) => {
      state.auth.isAdmin = true;
    })
    .addCase(createTournament, (state, action) => {
      state.tournament.id = Date.now().toString(); // Unique ID based on timestamp
      state.tournament.name = action.payload.name || 'Unnamed Tournament';
      state.tournament.type = action.payload.type;
      state.tournament.format = action.payload.format;
      state.tournament.players = [];
      state.tournament.bracket = [];
      state.tournament.status = 'pending';
      state.tournament.shareUrl = null;
    })
    .addCase(addPlayer, (state, action) => {
      state.tournament.players.push(action.payload);
    })
    .addCase(updateBracket, (state, action) => {
      state.tournament.bracket = action.payload;
    })
    .addCase(startTournament, (state) => {
      state.tournament.status = 'in-progress';
    })
    .addCase(updateMatchResult, (state, action) => {
      const { round, matchIndex, score1, score2 } = action.payload;
      state.tournament.bracket[round][matchIndex] = {
        ...state.tournament.bracket[round][matchIndex],
        score1,
        score2,
      };
      if (round < state.tournament.bracket.length - 1) {
        const nextRound = round + 1;
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const winner = score1 > score2 ? state.tournament.bracket[round][matchIndex].player1 : state.tournament.bracket[round][matchIndex].player2;
        const nextMatch = state.tournament.bracket[nextRound][nextMatchIndex];
        if (matchIndex % 2 === 0) {
          state.tournament.bracket[nextRound][nextMatchIndex] = {
            ...nextMatch,
            player1: winner,
            score1: 0,
            score2: nextMatch.score2 || 0,
          };
        } else {
          state.tournament.bracket[nextRound][nextMatchIndex] = {
            ...nextMatch,
            player2: winner,
            score1: nextMatch.score1 || 0,
            score2: 0,
          };
        }
      }
      if (round === state.tournament.bracket.length - 1 && score1 !== score2) {
        state.tournament.status = 'ended';
      }
    })
    .addCase(endTournament, (state) => {
      state.tournament.status = 'ended';
    })
    .addCase(generateTournamentUrl, (state) => {
      if (state.tournament.id && !state.tournament.shareUrl) {
        state.tournament.shareUrl = `/tournament/${state.tournament.id}`;
      }
    });
});