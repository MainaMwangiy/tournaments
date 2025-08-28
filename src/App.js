import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './redux/store';
import Login from './components/Login.js';
import TournamentSettings from './components/TournamentSettings.js';
import PlayerEntry from './components/PlayerEntry.js';
import TournamentBracket from './components/TournamentBracket.js';
import AdminLogin from './components/AdminLogin.js';
import AdminBracket from './components/AdminBracket.js';
import './App.css';
import TournamentView from './components/TournamentView.js';
import CreateTournament from './components/CreateTournament.js';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/tournament-settings" element={<TournamentSettings />} />
          <Route path="/player-entry" element={<PlayerEntry />} />
          <Route path="/bracket" element={<TournamentBracket />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-bracket" element={<AdminBracket />} />
          <Route path="/tournament/:id" element={<TournamentView />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;