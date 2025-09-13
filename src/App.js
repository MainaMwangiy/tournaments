import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./redux/store.js";
import Login from "./components/Login.js";
import TournamentsList from "./components/TournamentsList.js";
import TournamentDetails from "./components/TournamentDetails.js";
import CreateTournament from "./components/CreateTournament.js";
import PlayerEntry from "./components/PlayerEntry.js";
import TournamentBracket from "./components/TournamentBracket.js";
import AdminLogin from "./components/AdminLogin.js";
import TournamentView from "./components/TournamentView.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/tournaments" element={<TournamentsList />} />
            <Route path="/tournament-details/:id" element={<TournamentDetails />} />
            <Route path="/create-tournament" element={<CreateTournament />} />
            <Route path="/player-entry/:id?" element={<PlayerEntry />} />
            <Route path="/" element={<Navigate to="/tournaments" />} />
          </Route>
          <Route path="/bracket/:id" element={
            localStorage.getItem("user") ? <TournamentBracket /> : <TournamentView />
          } />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;