import React, { useState, useEffect } from 'react';

const TournamentBracket = () => {
  const [playerCount, setPlayerCount] = useState(4);
  const [bracket, setBracket] = useState([]);

  // Sample player data - you can modify this or make it dynamic
  const samplePlayers = [
    { name: "Pei pei", seed: 66.33 },
    { name: "Ruto K", seed: 59.22 },
    { name: "Solomon China", seed: 46.97 },
    { name: "Micheal Mutisya", seed: 48.40 },
    { name: "John Doe", seed: 72.15 },
    { name: "Jane Smith", seed: 68.90 },
    { name: "Alex Johnson", seed: 55.78 },
    { name: "Maria Garcia", seed: 61.42 },
    { name: "David Wilson", seed: 49.85 },
    { name: "Sarah Brown", seed: 73.20 },
    { name: "Mike Davis", seed: 58.65 },
    { name: "Lisa Anderson", seed: 64.18 },
    { name: "Chris Taylor", seed: 52.30 },
    { name: "Emma White", seed: 67.95 },
    { name: "Ryan Miller", seed: 45.88 },
    { name: "Amy Jones", seed: 70.12 },
    { name: "Kevin Lee", seed: 56.73 },
    { name: "Sophie Clark", seed: 62.85 },
    { name: "Tom Harris", seed: 48.92 },
    { name: "Julia Martin", seed: 71.55 },
    { name: "Ben Thompson", seed: 53.67 },
    { name: "Kate Rodriguez", seed: 65.38 },
    { name: "Nick Lewis", seed: 47.24 },
    { name: "Grace Walker", seed: 69.81 },
    { name: "Sam Hall", seed: 54.16 },
    { name: "Olivia Young", seed: 66.72 },
    { name: "Jake King", seed: 51.43 },
    { name: "Mia Wright", seed: 68.29 },
    { name: "Luke Lopez", seed: 57.91 },
    { name: "Zoe Hill", seed: 63.54 },
    { name: "Adam Green", seed: 50.76 },
    { name: "Chloe Adams", seed: 72.83 }
  ];

  const createBracketStructure = (playerCount) => {
    const players = samplePlayers.slice(0, playerCount);
    const rounds = Math.log2(playerCount);
    const bracket = [];
    
    // First round - pair up all players
    const firstRound = [];
    for (let i = 0; i < players.length; i += 2) {
      firstRound.push({
        player1: players[i],
        player2: players[i + 1],
        score1: Math.floor(Math.random() * 4), // Random scores for demo
        score2: Math.floor(Math.random() * 4)
      });
    }
    bracket.push(firstRound);
    
    // Subsequent rounds
    let currentRound = firstRound;
    for (let round = 1; round < rounds; round++) {
      const nextRound = [];
      for (let i = 0; i < currentRound.length; i += 2) {
        const match1 = currentRound[i];
        const match2 = currentRound[i + 1] || null; // Handle odd number of matches
        
        // Determine winner from first match
        const winner1 = match1.score1 > match1.score2 ? match1.player1 : match1.player2;
        
        if (match2) {
          // Determine winner from second match
          const winner2 = match2.score1 > match2.score2 ? match2.player1 : match2.player2;
          
          nextRound.push({
            player1: winner1,
            player2: winner2,
            score1: Math.floor(Math.random() * 4),
            score2: Math.floor(Math.random() * 4)
          });
        } else {
          // If there's only one match (odd number), winner advances automatically
          // This creates a placeholder for proper structure
          nextRound.push({
            player1: winner1,
            player2: { name: "BYE", seed: 0 },
            score1: 3,
            score2: 0
          });
        }
      }
      bracket.push(nextRound);
      currentRound = nextRound;
    }
    
    return bracket;
  };

  const generateBracket = () => {
    // Create bracket structure
    const newBracket = createBracketStructure(playerCount);
    setBracket(newBracket);
  };

  const createMatchElement = (match, round, matchIndex) => {
    return (
      <div key={`${round}-${matchIndex}`} className="match" style={{ top: `${getCenters()[round][matchIndex] - 40}px` }}>
        <div className="player">
          <span>{match.player1.name} <span className="seed">({match.player1.seed})</span></span>
          <span className="score">{match.score1}</span>
        </div>
        <div className="player">
          <span>{match.player2.name} <span className="seed">({match.player2.seed})</span></span>
          <span className="score">{match.score2}</span>
        </div>
      </div>
    );
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
      
      // Create horizontal line from first match
      connectorElements.push(
        <div
          key={`h1-${round}-${i}`}
          className="connector horizontal-line"
          style={{
            width: '30px',
            left: '0px',
            top: `${match1Center + 19}px`
          }}
        />
      );
      
      if (hasMatch2) {
        // Create horizontal line from second match
        connectorElements.push(
          <div
            key={`h2-${round}-${i}`}
            className="connector horizontal-line"
            style={{
              width: '30px',
              left: '0px',
              top: `${match2Center + 19}px`
            }}
          />
        );
        
        // Create vertical line connecting the two horizontal lines
        connectorElements.push(
          <div
            key={`v-${round}-${i}`}
            className="connector vertical-line"
            style={{
              left: '29px',
              top: `${Math.min(match1Center, match2Center) + 19}px`,
              height: `${Math.abs(match2Center - match1Center) + 2}px`
            }}
          />
        );
      }
      
      // Create horizontal line to next round
      connectorElements.push(
        <div
          key={`hr-${round}-${i}`}
          className="connector horizontal-line"
          style={{
            width: '30px',
            left: '30px',
            top: `${connectionPoint + 19}px`
          }}
        />
      );
    }
    
    return connectorElements;
  };

  // Generate initial bracket on component mount
  useEffect(() => {
    generateBracket();
  }, []);

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
        padding: '20px'
      }}
    >
      
      <div 
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        <div 
          className="controls"
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <label htmlFor="playerCount">Number of players:</label>
          <select
            id="playerCount"
            value={playerCount}
            onChange={(e) => setPlayerCount(parseInt(e.target.value))}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="4">4 players</option>
            <option value="8">8 players</option>
            <option value="16">16 players</option>
            <option value="32">32 players</option>
          </select>
          <button 
            onClick={generateBracket}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseOver={(e) => e.target.style.background = '#2563eb'}
            onMouseOut={(e) => e.target.style.background = '#3b82f6'}
          >
            Generate Bracket
          </button>
        </div>
        
        <div 
          className="bracket"
          style={{
            display: 'flex',
            gap: '60px',
            alignItems: 'flex-start',
            position: 'relative',
            overflowX: 'auto',
            padding: '20px'
          }}
        >
          {bracket.map((roundMatches, round) => (
            <div 
              key={round} 
              className="round" 
              style={{ 
                height: `${Math.max(...centers[round]) + 40}px`,
                position: 'relative',
                width: '240px'
              }}
            >
              {roundMatches.map((match, matchIndex) => 
                <div 
                  key={`${round}-${matchIndex}`} 
                  className="match" 
                  style={{ 
                    top: `${getCenters()[round][matchIndex] - 40}px`,
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
                    boxSizing: 'border-box'
                  }}
                >
                  <div 
                    className="player"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      fontSize: '14px'
                    }}
                  >
                    <span>{match.player1.name} <span style={{ color: '#9ca3af', fontSize: '13px' }}>({match.player1.seed})</span></span>
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
                        fontWeight: 'bold'
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
                      borderTop: '1px solid #ddd'
                    }}
                  >
                    <span>{match.player2.name} <span style={{ color: '#9ca3af', fontSize: '13px' }}>({match.player2.seed})</span></span>
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
                        fontWeight: 'bold'
                      }}
                    >
                      {match.score2}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Render connectors */}
          {Array.from({ length: rounds - 1 }, (_, round) => (
            <div
              key={`connector-${round}`}
              style={{
                position: 'absolute',
                left: `${(round + 1) * 240 + round * 60 + 20}px`,
                width: '60px',
                height: '100%',
                top: '0px',
                pointerEvents: 'none'
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