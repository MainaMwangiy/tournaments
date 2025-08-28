import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

const TournamentSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handleSubmit = () => {
    navigate('/player-entry');
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <button className="return-btn" onClick={() => navigate('/create-tournament')}>
          Return
        </button>
        <h2>Setting</h2>
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
        <button className="next-btn" onClick={handleSubmit}>
          Next
        </button>
        <div className="footer-links">
          <a href="#">Your Event List</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </div>
  );
};

export default TournamentSettings;