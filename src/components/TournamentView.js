
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

  // Fetch tournament data on component mount (mirrors TournamentBracket)
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
      setStatus(details.status || "pending")

      if (details.data?.entries) {
        const mappedPlayers = details.data.entries.map((entry) => ({
          id: entry.id,
          name: entry.player_name,
          seed: entry.seed_number || 0,
        }))
        setPlayers(mappedPlayers)
      }

      const bracketData = await tournamentApi.getTournamentBracket(id)
      if (bracketData.bracket) {
        setBracket(bracketData.bracket)
      }

      console.log("[Public View] Loaded tournament details:", details)
      console.log("[Public View] Loaded bracket:", bracketData.bracket)
    } catch (err) {
      setError("Failed to fetch tournament data")
      console.error("Error fetching tournament data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Copy from TournamentBracket: Generate bracket if needed
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
        const winner1 =
          match1.score1 > match1.score2
            ? match1.player1
            : match1.score1 === 0 && match1.score2 === 0
              ? { name: "TBD", seed: 0 }
              : match1.player2
        let winner2 = { name: "TBD", seed: 0 }
        if (match2) {
          winner2 =
            match2.score1 > match2.score2
              ? match2.player1
              : match2.score1 === 0 && match2.score2 === 0
                ? { name: "TBD", seed: 0 }
                : match2.player2
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
      setBracket(newBracket)
    } catch (err) {
      console.error("Error generating bracket:", err)
      setError("Failed to generate bracket")
    }
  }

  // Auto-generate if no bracket but valid players (copy from TournamentBracket)
  useEffect(() => {
    if (effectivePlayers.length >= 4 && bracket.length === 0 && isValidPlayerCount) {
      generateBracket()
    }
  }, [effectivePlayers, bracket, isValidPlayerCount])

  // Copy getCenters from TournamentBracket (public version doesn't need auth checks)
  const getCenters = () => {
    if (!bracket || !Array.isArray(bracket) || bracket.length === 0 || !isValidPlayerCount) {
      return [];
    }

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

  // Copy createConnectors from TournamentBracket (adjusted for inline styles to match)
  const createConnectors = (round, centers, totalRounds) => {
    const connectorElements = []
    const matchCount = centers[round]?.length || 0;

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
            width: "30px",
            height: "2px",
            background: "#d1d5db",
            left: "0px",
            top: `${match1Center - 1}px`,
          }}
        />,
      )

      if (hasMatch2) {
        connectorElements.push(
          <div
            key={`h2-${round}-${i}`}
            style={{
              position: "absolute",
              width: "30px",
              height: "2px",
              background: "#d1d5db",
              left: "0px",
              top: `${match2Center - 1}px`,
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
              left: "29px",
              top: `${Math.min(match1Center, match2Center) - 1}px`,
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
            width: "30px",
            height: "2px",
            background: "#d1d5db",
            left: "30px",
            top: `${connectionPoint - 1}px`,
          }}
        />,
      )
    }

    return connectorElements
  }

  const rounds = isValidPlayerCount ? Math.log2(playerCount) : 0;
  const centers = getCenters()

  // Get winner for ended tournament
  const getWinner = () => {
    if (status === "ended" && bracket && bracket.length > 0) {
      const finalMatch = bracket[bracket.length - 1][0]
      return finalMatch.score1 > finalMatch.score2 ? finalMatch.player1.name : finalMatch.player2.name
    }
    return null
  }

  const winner = getWinner()

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
          padding: "40px 20px",
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
          padding: "40px 20px",
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
        padding: "20px",
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
            padding: "20px 30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "10px 16px",
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
            ← Back
          </button>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "28px",
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
                fontSize: "14px",
              }}
            >
              {playerCount} players •{" "}
              {status === "in-progress"
                ? "Live Tournament"
                : status === "ended"
                  ? "Tournament Complete"
                  : "Tournament Status: " + status}
            </p>
          </div>
          <div style={{ width: "80px" }}></div> {/* Spacer for centering */}
        </div>

        {/* Winner Banner */}
        {winner && (
          <div
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "white",
              padding: "20px 30px",
              borderRadius: "12px",
              textAlign: "center",
              marginTop: "20px",
              boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
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
                fontSize: "20px",
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
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "visible",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb",
          padding: "20px",
          width: "fit-content",
        }}
      >
        {bracket.length > 0 && isValidPlayerCount ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {/* Round Headers */}
            <div
              style={{
                display: "flex",
                gap: "60px",
                marginBottom: "20px",
                minWidth: "fit-content",
              }}
            >
              {bracket.map((_, round) => (
                <div
                  key={`header-${round}`}
                  style={{
                    width: "240px",
                    textAlign: "center",
                    padding: "8px 16px",
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    {round === bracket.length - 1
                      ? "Final"
                      : round === bracket.length - 2
                        ? "Semi-Final"
                        : round === bracket.length - 3
                          ? "Quarter-Final"
                          : `Round ${round + 1}`}
                  </h3>
                </div>
              ))}
            </div>

            {/* Bracket Rounds */}
            <div
              style={{
                display: "flex",
                gap: "60px",
                alignItems: "flex-start",
                position: "relative",
                minWidth: "fit-content",
              }}
            >
              {bracket.map((roundMatches, round) => {
                const roundCenters = centers[round] || [];
                const maxHeight = Math.max(...roundCenters, 0) + 40;
                return (
                  <div
                    key={round}
                    style={{
                      position: "relative",
                      height: `${maxHeight}px`,
                      width: "240px",
                    }}
                  >
                    {roundMatches.map((match, matchIndex) => (
                      <div
                        key={`${round}-${matchIndex}`}
                        style={{
                          top: `${(roundCenters[matchIndex] ?? 40) - 40}px`,
                          position: "absolute",
                          width: "240px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          background: "white",
                          overflow: "hidden",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          height: "80px",
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
                            padding: "8px 12px",
                            fontSize: "14px",
                            background: match.score1 > match.score2 ? "#f0f9ff" : "white",
                          }}
                        >
                          <span
                            style={{
                              color: "#111827",
                              fontWeight: match.score1 > match.score2 ? "600" : "500",
                              flex: 1,
                            }}
                          >
                            {match.player1.name === "TBD" ? "TBD" : match.player1.name}{" "}
                            {match.player1.name !== "TBD" && match.player1.name !== "BYE" && (
                              <span style={{ color: "#6b7280", fontSize: "12px" }}>
                                ({match.player1.seed})
                              </span>
                            )}
                          </span>
                          <span
                            style={{
                              background: match.score1 > match.score2 ? "#3b82f6" : "#dbeafe",
                              color: match.score1 > match.score2 ? "white" : "#1d4ed8",
                              borderRadius: "6px",
                              width: "28px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px",
                              fontWeight: "700",
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
                            padding: "8px 12px",
                            fontSize: "14px",
                            borderTop: "1px solid #f3f4f6",
                            background: match.score2 > match.score1 ? "#f0f9ff" : "white",
                          }}
                        >
                          <span
                            style={{
                              color: "#111827",
                              fontWeight: match.score2 > match.score1 ? "600" : "500",
                              flex: 1,
                            }}
                          >
                            {match.player2.name === "TBD" ? "TBD" : match.player2.name}{" "}
                            {match.player2.name !== "TBD" && match.player2.name !== "BYE" && (
                              <span style={{ color: "#6b7280", fontSize: "12px" }}>
                                ({match.player2.seed})
                              </span>
                            )}
                          </span>
                          <span
                            style={{
                              background: match.score2 > match.score1 ? "#3b82f6" : "#dbeafe",
                              color: match.score2 > match.score1 ? "white" : "#1d4ed8",
                              borderRadius: "6px",
                              width: "28px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px",
                              fontWeight: "700",
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
              {Array.from({ length: rounds - 1 }, (_, connectorRound) => (
                <div
                  key={`connector-${connectorRound}`}
                  style={{
                    position: "absolute",
                    left: `${(connectorRound + 1) * 240 + connectorRound * 60}px`,
                    width: "60px",
                    height: "100%",
                    top: "0px",
                    pointerEvents: "none",
                  }}
                >
                  {createConnectors(connectorRound, centers, rounds)}
                </div>
              ))}
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
