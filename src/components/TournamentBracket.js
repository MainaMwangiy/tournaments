import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBracket, startTournament, generateTournamentUrl } from '../redux/actions';
import { Navigate, useNavigate } from 'react-router-dom';

const TournamentBracket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { players, bracket, status, shareUrl } = useSelector((state) => state.tournament);
  const playerCount = players.length;

  const createBracketStructure = (players) => {
    const sortedPlayers = [...players].sort((a, b) => b.seed - a.seed);
    const rounds = Math.log2(playerCount);
    const bracket = [];

    const firstRound = [];
    for (let i = 0; i < sortedPlayers.length; i += 2) {
      firstRound.push({
        player1: sortedPlayers[i],
        player2: sortedPlayers[i + 1] || { name: 'BYE', seed: 0 },
        score1: 0,
        score2: 0,
      });
    }
    bracket.push(firstRound);

    let currentRound = firstRound;
    for (let round = 1; round < rounds; round++) {
      const nextRound = [];
      for (let i = 0; i < currentRound.length; i += 2) {
        const match1 = currentRound[i];
        const match2 = currentRound[i + 1] || null;
        const winner1 = match1.score1 > match1.score2 ? match1.player1 : match1.player2;
        let winner2 = { name: 'TBD', seed: 0 };
        if (match2) {
          winner2 = match2.score1 > match2.score2 ? match2.player1 : match2.player2;
        }
        nextRound.push({
          player1: winner1,
          player2: match2 ? winner2 : { name: 'BYE', seed: 0 },
          score1: 0,
          score2: 0,
        });
      }
      bracket.push(nextRound);
      currentRound = nextRound;
    }

    return bracket;
  };

  const generateBracket = () => {
    const newBracket = createBracketStructure(players);
    dispatch(updateBracket(newBracket));
  };

  const getCenters = () => {
    const rounds = Math.log2(playerCount);
    const centers = Array.from({ length: rounds }, () => []);
    const baseInterval = 160;
    const firstMatches = bracket[0]?.length || 0;

    for (let j = 0; j < firstMatches; j++) {
      centers[0][j] = 40 + j * baseInterval;
    }

    for (let r = 1; r < rounds; r++) {
      const numMatches = bracket[r]?.length || 0;
      for (let k = 0; k < numMatches; k++) {
        const feeder1Center = centers[r - 1][2 * k];
        const feeder2Index = 2 * k + 1;
        let feeder2Center = feeder1Center;
        if (feeder2Index < centers[r - 1].length) {
          feeder2Center = centers[r - 1][feeder2Index];
        }
        centers[r][k] = (feeder1Center + feeder2Center) / 2;
      }
    }

    return centers;
  };

  const createConnectors = (round, centers, totalRounds) => {
    const connectorElements = [];
    const matchCount = centers[round].length;

    for (let i = 0; i < matchCount; i += 2) {
      const match1Index = i;
      const match2Index = i + 1;
      const match1Center = centers[round][match1Index];
      let match2Center = match1Center;
      let hasMatch2 = false;
      if (match2Index < matchCount) {
        match2Center = centers[round][match2Index];
        hasMatch2 = true;
      }
      const connectionPoint = (match1Center + match2Center) / 2;

      connectorElements.push(
        <div
          key={`h1-${round}-${i}`}
          className="connector horizontal-line"
          style={{
            width: '30px',
            left: '0px',
            top: `${match1Center + 19}px`,
          }}
        />
      );

      if (hasMatch2) {
        connectorElements.push(
          <div
            key={`h2-${round}-${i}`}
            className="connector horizontal-line"
            style={{
              width: '30px',
              left: '0px',
              top: `${match2Center + 19}px`,
            }}
          />
        );

        connectorElements.push(
          <div
            key={`v-${round}-${i}`}
            className="connector vertical-line"
            style={{
              left: '29px',
              top: `${Math.min(match1Center, match2Center) + 19}px`,
              height: `${Math.abs(match2Center - match1Center) + 2}px`,
            }}
          />
        );
      }

      connectorElements.push(
        <div
          key={`hr-${round}-${i}`}
          className="connector horizontal-line"
          style={{
            width: '30px',
            left: '30px',
            top: `${connectionPoint + 19}px`,
          }}
        />
      );
    }

    return connectorElements;
  };

  useEffect(() => {
    if (players.length >= 4 && bracket.length === 0) {
      generateBracket();
    }
  }, [players]);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const rounds = Math.log2(playerCount);
  const centers = getCenters();

  return (
    <div
      className="tournament-container"
      style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: '#f3f4f6',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
      }}
    >
      <div className="container">
        <div className="controls">
          <button className="return-btn" onClick={() => navigate('/player-entry')}>
            Return
          </button>
          <h2>Tournament Bracket</h2>
          {status === 'pending' && (
            <button
              onClick={() => {
                dispatch(startTournament());
                dispatch(generateTournamentUrl());
              }}
            >
              Next (In Session)
            </button>
          )}
          {status === 'in-progress' && shareUrl && (
            <div>
              <p>Share this link with everyone to view the tournament:</p>
              <input
                type="text"
                value={window.location.origin + shareUrl}
                readOnly
                style={{ width: '300px', padding: '5px' }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(window.location.origin + shareUrl)}
                style={{ marginLeft: '10px' }}
              >
                Copy Link
              </button>
            </div>
          )}
          <button onClick={() => navigate('/admin-login')}>Admin Login</button>
        </div>
        {status === 'ended' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>Tournament Ended!</h2>
            <p>
              Winner:{' '}
              {bracket[bracket.length - 1][0].score1 > bracket[bracket.length - 1][0].score2
                ? bracket[bracket.length - 1][0].player1.name
                : bracket[bracket.length - 1][0].player2.name}
            </p>
          </div>
        )}
        <div
          className="bracket"
          style={{
            display: 'flex',
            gap: '60px',
            alignItems: 'flex-start',
            position: 'relative',
            overflowX: 'auto',
            padding: '20px',
          }}
        >
          {bracket.map((roundMatches, round) => (
            <div
              key={round}
              className="round"
              style={{
                height: `${Math.max(...centers[round]) + 40}px`,
                position: 'relative',
                width: '240px',
              }}
            >
              {roundMatches.map((match, matchIndex) => (
                <div
                  key={`${round}-${matchIndex}`}
                  className="match"
                  style={{
                    top: `${centers[round][matchIndex] - 40}px`,
                    position: 'absolute',
                    width: '240px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    left: 0,
                    margin: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    className="player"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      fontSize: '14px',
                    }}
                  >
                    <span>
                      {match.player1.name}{' '}
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                        ({match.player1.seed})
                      </span>
                    </span>
                    <span
                      className="score"
                      style={{
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        borderRadius: '6px',
                        width: '24px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 'bold',
                      }}
                    >
                      {match.score1}
                    </span>
                  </div>
                  <div
                    className="player"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      fontSize: '14px',
                      borderTop: '1px solid #ddd',
                    }}
                  >
                    <span>
                      {match.player2.name}{' '}
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                        ({match.player2.seed})
                      </span>
                    </span>
                    <span
                      className="score"
                      style={{
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        borderRadius: '6px',
                        width: '24px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 'bold',
                      }}
                    >
                      {match.score2}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {Array.from({ length: rounds - 1 }, (_, round) => (
            <div
              key={`connector-${round}`}
              style={{
                position: 'absolute',
                left: `${(round + 1) * 240 + round * 60 + 20}px`,
                width: '60px',
                height: '100%',
                top: '0px',
                pointerEvents: 'none',
              }}
            >
              {createConnectors(round, centers, rounds)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;