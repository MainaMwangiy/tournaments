import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTournament } from '../redux/actions';
import { Navigate, useNavigate } from 'react-router-dom';

const CreateTournament = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [tournamentName, setTournamentName] = useState('');
  const [competitionType, setCompetitionType] = useState('Pool (Billiards)');
  const [competitionFormat, setCompetitionFormat] = useState('Single Elimination');

  const handleCreate = () => {
    if (tournamentName) {
      dispatch(createTournament({ name: tournamentName, type: competitionType, format: competitionFormat }));
      navigate('/tournament-settings');
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <button className="return-btn" onClick={() => navigate('/login')}>
          Return
        </button>
        <h2>Create Tournament</h2>
        <div className="setting-section">
          <h3>Tournament Name</h3>
          <input
            type="text"
            placeholder="Enter Tournament Name"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="setting-section">
          <h3>Select a competition type</h3>
          <button className="selected-btn" disabled>
            Pool (Billiards)
          </button>
        </div>
        <div className="setting-section">
          <h3>Select a competition format</h3>
          <button className="selected-btn" disabled>
            Single Elimination
          </button>
        </div>
        <button className="next-btn" onClick={handleCreate} disabled={!tournamentName}>
          Create
        </button>
        <div className="footer-links">
          <a href="#">Your Event List</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </div>
  );
};

export default CreateTournament;