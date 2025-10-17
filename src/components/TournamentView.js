import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { tournamentApi } from "../utils/tournamentApi"

const TournamentView = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Local state (independent of Redux for public users)
  const [players, setPlayers] = useState([])
  const [bracket, setBracket] = useState([])
  const [status, setStatus] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const roundWidth = isMobile ? 210 : 240
  const gap = isMobile ? 30 : 60
  const baseInterval = isMobile ? 100 : 160
  const matchHeight = isMobile ? 60 : 80
  const connectorHalf = gap / 2
  const connectorOffset = isMobile ? 10 : 19
  const initialOffset = isMobile ? 30 : 40
  const playerPadding = isMobile ? "4px 6px" : "6px 8px"
  const playerFontSize = isMobile ? "12px" : "14px"
  const scoreSize = isMobile ? "20px" : "24px"
  const scoreHeight = isMobile ? "18px" : "22px"
  const containerPadding = isMobile ? "10px" : "20px"
  const bracketPadding = 20

  const getWinner = (match) => {
    if (!match || !match.player1 || !match.player2) {
      return { name: "TBD", seed: 0 }
    }
    if (match.score1 > match.score2) {
      return match.player1
    } else if (match.score2 > match.score1) {
      return match.player2
    } else if (match.score1 === 0 && match.score2 === 0) {
      return { name: "TBD", seed: 0 }
    } else {
      // Handle tie as TBD for progression
      return { name: "TIE", seed: 0 }
    }
  }

  const propagateWinners = (currentBracket) => {
    if (!currentBracket || currentBracket.length < 2) {
      return currentBracket || []
    }
    const newBracket = JSON.parse(JSON.stringify(currentBracket))
    const numRounds = newBracket.length
    for (let r = 0; r < numRounds - 1; r++) {
      const currentRound = newBracket[r]
      const nextRound = newBracket[r + 1]
      for (let pair = 0; pair < currentRound.length / 2; pair++) {
        const match1Index = 2 * pair
        const match2Index = 2 * pair + 1
        const winner1 = getWinner(currentRound[match1Index])
        const winner2 = match2Index < currentRound.length ? getWinner(currentRound[match2Index]) : { name: "TBD", seed: 0 }
        nextRound[pair].player1 = winner1
        nextRound[pair].player2 = winner2
      }
    }
    return newBracket
  }

  // Fetch tournament data on component mount
  useEffect(() => {
    if (id) {
      fetchTournamentData()
    }
  }, [id])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)
      setError(null)
      const details = await tournamentApi.getTournamentDetails(id)
      let effectiveStatus = details.data?.status || details.status || "pending"

      if (details.data?.entries) {
        const mappedPlayers = details.data.entries.map((entry) => ({
          id: entry.id,
          name: entry.player_name,
          seed: entry.seed_number || 0,
        }))
        setPlayers(mappedPlayers)
      } else {
        setPlayers([])
      }

      const bracketData = await tournamentApi.getTournamentBracket(id)
      if (bracketData?.data?.bracket) {
        const propagatedBracket = propagateWinners(bracketData.data.bracket)
        setBracket(propagatedBracket)

        // Check if tournament is ended based on final match
        const finalRound = propagatedBracket.length - 1
        if (finalRound > 0) {
          const finalMatch = propagatedBracket[finalRound][0]
          if (finalMatch?.score1 > 0 && finalMatch?.score2 >= 0 && finalMatch?.score1 !== finalMatch?.score2) {
            effectiveStatus = "ended"
          }
        }
      } else {
        setBracket([])
      }

      setStatus(effectiveStatus)

      console.log("[Public View] Loaded tournament details:", details)
      console.log("[Public View] Loaded bracket:", bracketData?.data?.bracket)
    } catch (err) {
      setError("Failed to fetch tournament data")
      console.log("Error fetching tournament data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Generate bracket if needed
  const effectivePlayers = players.length > 0 ? players : []
  const playerCount = effectivePlayers.length > 0 ? effectivePlayers.length : bracket[0]?.length ? bracket[0].length * 2 : 0
  const isValidPlayerCount = playerCount > 0 && Number.isInteger(Math.log2(playerCount))

  const createBracketStructure = (players) => {
    if (!players || players.length < 2 || !Number.isInteger(Math.log2(players.length))) {
      setError("Invalid number of players for bracket generation")
      return []
    }

    const sortedPlayers = [...players].sort((a, b) => b.seed - a.seed)
    const rounds = Math.log2(players.length)
    const bracket = []

    const firstRound = []
    for (let i = 0; i < sortedPlayers.length; i += 2) {
      firstRound.push({
        player1: sortedPlayers[i],
        player2: sortedPlayers[i + 1] || { name: "BYE", seed: 0 },
        score1: 0,
        score2: 0,
      })
    }
    bracket.push(firstRound)

    let currentRound = firstRound
    for (let round = 1; round < rounds; round++) {
      const nextRound = []
      for (let i = 0; i < currentRound.length; i += 2) {
        const match1 = currentRound[i]
        const match2 = currentRound[i + 1] || null
        const winner1 = getWinner(match1)
        let winner2 = { name: "TBD", seed: 0 }
        if (match2) {
          winner2 = getWinner(match2)
        }
        nextRound.push({
          player1: winner1,
          player2: match2 ? winner2 : { name: "BYE", seed: 0 },
          score1: 0,
          score2: 0,
        })
      }
      bracket.push(nextRound)
      currentRound = nextRound
    }

    return bracket
  }

  const generateBracket = async () => {
    try {
      const newBracket = createBracketStructure(effectivePlayers)
      if (newBracket.length === 0) return;
      const propagatedBracket = propagateWinners(newBracket);
      setBracket(propagatedBracket);
    } catch (err) {
      console.error("Error generating bracket:", err)
      setError("Failed to generate bracket")
    }
  }

  // Auto-generate bracket if no bracket exists but valid players are available
  useEffect(() => {
    if (effectivePlayers.length >= 4 && bracket.length === 0 && isValidPlayerCount) {
      generateBracket()
    }
  }, [effectivePlayers, bracket, isValidPlayerCount])

  // Calculate centers for bracket layout
  const getCenters = () => {
    if (!bracket || !Array.isArray(bracket) || bracket.length === 0 || !isValidPlayerCount) {
      return [];
    }

    const rounds = Math.log2(playerCount);
    const centers = Array.from({ length: rounds }, () => []);
    const firstMatches = bracket[0]?.length || 0;

    for (let j = 0; j < firstMatches; j++) {
      centers[0][j] = initialOffset + j * baseInterval;
    }

    for (let r = 1; r < rounds; r++) {
      const numMatches = bracket[r]?.length || 0;
      for (let k = 0; k < numMatches; k++) {
        const feeder1Center = centers[r - 1][2 * k] || 0;
        const feeder2Index = 2 * k + 1;
        let feeder2Center = feeder1Center;
        if (feeder2Index < centers[r - 1].length) {
          feeder2Center = centers[r - 1][feeder2Index] || 0;
        }
        centers[r][k] = (feeder1Center + feeder2Center) / 2;
      }
    }

    return centers;
  };

  // Create connectors between matches
  const createConnectors = (round, centers, totalRounds) => {
    const connectorElements = []
    const matchCount = centers[round]?.length || 0;
    const vLeft = connectorHalf - 1;

    for (let i = 0; i < matchCount; i += 2) {
      const match1Index = i
      const match2Index = i + 1
      const match1Center = centers[round][match1Index] || 0
      let match2Center = match1Center
      let hasMatch2 = false
      if (match2Index < matchCount) {
        match2Center = centers[round][match2Index] || 0
        hasMatch2 = true
      }
      const connectionPoint = (match1Center + match2Center) / 2

      connectorElements.push(
        <div
          key={`h1-${round}-${i}`}
          style={{
            position: "absolute",
            width: `${connectorHalf}px`,
            height: "2px",
            background: "#d1d5db",
            left: "0px",
            top: `${match1Center + connectorOffset}px`,
          }}
        />,
      )

      if (hasMatch2) {
        connectorElements.push(
          <div
            key={`h2-${round}-${i}`}
            style={{
              position: "absolute",
              width: `${connectorHalf}px`,
              height: "2px",
              background: "#d1d5db",
              left: "0px",
              top: `${match2Center + connectorOffset}px`,
            }}
          />,
        )

        connectorElements.push(
          <div
            key={`v-${round}-${i}`}
            style={{
              position: "absolute",
              width: "2px",
              background: "#d1d5db",
              left: `${vLeft}px`,
              top: `${Math.min(match1Center, match2Center) + connectorOffset}px`,
              height: `${Math.abs(match2Center - match1Center) + 2}px`,
            }}
          />,
        )
      }

      connectorElements.push(
        <div
          key={`hr-${round}-${i}`}
          style={{
            position: "absolute",
            width: `${connectorHalf}px`,
            height: "2px",
            background: "#d1d5db",
            left: `${connectorHalf}px`,
            top: `${connectionPoint + connectorOffset}px`,
          }}
        />,
      )
    }

    return connectorElements
  }

  const getRoundName = (roundIndex, totalRounds) => {
    const reverseNames = ['Final', 'Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32', 'Round of 64'];
    return reverseNames[totalRounds - roundIndex - 1] || `Round ${roundIndex + 1}`;
  }

  const rounds = isValidPlayerCount ? Math.log2(playerCount) : 0
  const centers = getCenters()
  const totalBracketWidth = rounds * roundWidth + (rounds - 1) * gap

  // Get winner for ended tournament
  const getTournamentWinner = () => {
    if (bracket && bracket.length > 0) {
      const finalMatch = bracket[bracket.length - 1][0]
      const winnerPlayer = getWinner(finalMatch)
      if (winnerPlayer.name !== "TBD" && winnerPlayer.name !== "TIE" && winnerPlayer.name !== "BYE") {
        return winnerPlayer.name
      }
    }
    return null
  }

  const winner = getTournamentWinner()
  const hasWinner = !!winner

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
          padding: containerPadding,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: "40px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <p style={{ color: "#6b7280" }}>Loading tournament...</p>
        </div>
      </div>
    )
  }

  // Error state (updated message for clarity)
  if (error || bracket.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
          padding: containerPadding,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: "40px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Tournament Not Found
          </h2>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "24px",
              lineHeight: "1.5",
            }}
          >
            {error || "This tournament doesn't exist, hasn't started, or no bracket available."}
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100vh",
        background: "#f9fafb",
        fontFamily: "Inter, sans-serif",
        padding: containerPadding,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "white",
            padding: isMobile ? "10px 15px" : "20px 30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={() => window.history.back()}
            style={{
              padding: isMobile ? "8px 12px" : "10px 16px",
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: "600",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            ← Back
          </button>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: isMobile ? "22px" : "28px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              🏆 Tournament Bracket
            </h1>
            <p
              style={{
                color: "#6b7280",
                margin: "4px 0 0 0",
                fontSize: isMobile ? "12px" : "14px",
              }}
            >
              {playerCount} players •{" "}
              {hasWinner
                ? "Tournament Complete"
                : status === "in-progress"
                  ? "Live Tournament"
                  : "Tournament Status: " + status}
            </p>
          </div>
          <div style={{ width: isMobile ? "60px" : "80px" }}></div> {/* Spacer for centering */}
        </div>

        {/* Winner Banner */}
        {winner && (
          <div
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "white",
              padding: isMobile ? "15px 20px" : "20px 30px",
              borderRadius: "12px",
              textAlign: "center",
              marginTop: "20px",
              boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
            }}
          >
            <h2
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: "700",
                margin: "0 0 8px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              🏆 Tournament Champion
            </h2>
            <p
              style={{
                fontSize: isMobile ? "18px" : "20px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              {winner}
            </p>
          </div>
        )}
      </div>

      {/* Bracket Container */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "auto",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb",
          padding: `${bracketPadding}px`,
          touchAction: "pan-x pan-y pinch-zoom", 
          WebkitOverflowScrolling: "touch"
        }}
      >
        {bracket.length > 0 && isValidPlayerCount ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: `${totalBracketWidth}px`,
            }}
          >
            {/* Round Headers */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: `${gap}px`,
                marginBottom: "20px",
                width: `${totalBracketWidth}px`,
              }}
            >
              {Array.from({ length: rounds }).map((_, round) => (
                <div
                  key={round}
                  style={{
                    width: `${roundWidth}px`,
                    textAlign: "center",
                    background: "#ccc",
                    padding: "5px",
                    borderRadius: "4px",
                    color: "#666",
                    flexShrink: 0,
                  }}
                >
                  {getRoundName(round, rounds)}
                </div>
              ))}
            </div>

            {/* Bracket Rounds */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: `${gap}px`,
                alignItems: "flex-start",
                position: "relative",
                width: `${totalBracketWidth}px`,
              }}
            >
              {bracket.map((roundMatches, round) => {
                const roundCenters = centers[round] || [];
                const maxHeight = Math.max(...roundCenters, 0) + initialOffset;
                return (
                  <div
                    key={round}
                    style={{
                      position: "relative",
                      height: `${maxHeight}px`,
                      width: `${roundWidth}px`,
                    }}
                  >
                    {roundMatches.map((match, matchIndex) => (
                      <div
                        key={`${round}-${matchIndex}`}
                        style={{
                          top: `${(roundCenters[matchIndex] ?? initialOffset) - initialOffset}px`,
                          position: "absolute",
                          width: `${roundWidth}px`,
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          background: "white",
                          overflow: "hidden",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          height: `${matchHeight}px`,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          left: 0,
                          margin: 0,
                          boxSizing: "border-box",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Player 1 */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: playerPadding,
                            fontSize: playerFontSize,
                            background: match.score1 > match.score2 ? "#f0f9ff" : "white",
                          }}
                        >
                          <span
                            style={{
                              color: "#111827",
                              fontWeight: match.score1 > match.score2 ? "600" : "500",
                              flex: 1,
                              minWidth: 0,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {match.player1.name === "TBD" ? "TBD" : match.player1.name}{" "}
                            {match.player1.name !== "TBD" && match.player1.name !== "BYE" && (
                              <span style={{ color: "#6b7280", fontSize: isMobile ? "11px" : "13px" }}>
                                ({match.player1.seed})
                              </span>
                            )}
                          </span>
                          <span
                            style={{
                              background: match.score1 > match.score2 ? "#3b82f6" : "#dbeafe",
                              color: match.score1 > match.score2 ? "white" : "#1d4ed8",
                              borderRadius: "6px",
                              width: scoreSize,
                              height: scoreHeight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: isMobile ? "11px" : "13px",
                              fontWeight: "bold",
                            }}
                          >
                            {match.score1}
                          </span>
                        </div>

                        {/* Player 2 */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: playerPadding,
                            fontSize: playerFontSize,
                            borderTop: "1px solid #f3f4f6",
                            background: match.score2 > match.score1 ? "#f0f9ff" : "white",
                          }}
                        >
                          <span
                            style={{
                              color: "#111827",
                              fontWeight: match.score2 > match.score1 ? "600" : "500",
                              flex: 1,
                              minWidth: 0,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {match.player2.name === "TBD" ? "TBD" : match.player2.name}{" "}
                            {match.player2.name !== "TBD" && match.player2.name !== "BYE" && (
                              <span style={{ color: "#6b7280", fontSize: isMobile ? "11px" : "13px" }}>
                                ({match.player2.seed})
                              </span>
                            )}
                          </span>
                          <span
                            style={{
                              background: match.score2 > match.score1 ? "#3b82f6" : "#dbeafe",
                              color: match.score2 > match.score1 ? "white" : "#1d4ed8",
                              borderRadius: "6px",
                              width: scoreSize,
                              height: scoreHeight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: isMobile ? "11px" : "13px",
                              fontWeight: "bold",
                            }}
                          >
                            {match.score2}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Connectors */}
              {Array.from({ length: rounds - 1 }, (_, connectorRound) => {
                const connectorLeft = isMobile
                  ? 210 + connectorRound * (roundWidth + gap) 
                  : (connectorRound + 1) * roundWidth + connectorRound * gap + (connectorOffset - (connectorRound > 0 ? 3 : 0));
                return (
                  <div
                    key={`connector-${connectorRound}`}
                    style={{
                      position: "absolute",
                      left: `${connectorLeft}px`,
                      width: `${gap}px`,
                      height: "100%",
                      top: "0px",
                      pointerEvents: "none",
                    }}
                  >
                    {createConnectors(connectorRound, centers, rounds)}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
            }}
          >
            No valid bracket available.
          </div>
        )}
      </div>
    </div>
  )
}

export default TournamentView