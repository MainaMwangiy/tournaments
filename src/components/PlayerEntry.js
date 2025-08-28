import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPlayer } from '../redux/actions';
import { Navigate, useNavigate } from 'react-router-dom';

const PlayerEntry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const players = useSelector((state) => state.tournament.players);
  const [name, setName] = useState('');
  const [seed, setSeed] = useState('');

  const handleAddPlayer = () => {
    if (name && seed) {
      dispatch(addPlayer({ name, seed: parseFloat(seed) }));
      setName('');
      setSeed('');
    }
  };

  const handleNext = () => {
    navigate('/bracket');
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="player-entry-container">
      <div className="controls">
        <button className="return-btn" onClick={() => navigate('/tournament-settings')}>
          Return
        </button>
        <h2>Add Players</h2>
        <div className="input-controls">
          <input
            type="text"
            placeholder="Player Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="input-field"
          />
          <button onClick={handleAddPlayer} className="add-btn">
            Add Player
          </button>
          <button
            onClick={handleNext}
            disabled={players.length < 4}
            className="next-btn"
          >
            Next
          </button>
        </div>
      </div>
      <div className="player-table-container">
        <table className="player-table">
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Seed</th>
            </tr>
          </thead>
          <tbody>
            {players.length > 0 ? (
              players.map((player, index) => (
                <tr key={index}>
                  <td>{player.name}</td>
                  <td>{player.seed}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No players added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerEntry;