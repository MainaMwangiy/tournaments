
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

const TournamentView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { players, bracket, status } = useSelector((state) => state.tournament)

  // For now, we'll show the current tournament if it exists and is in progress
  // In a real app, you'd fetch tournament data by ID from a backend
  const currentTournament = {
    players,
    bracket,
    status,
    id,
  }

  if (!currentTournament || !bracket || bracket.length === 0) {
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
            This tournament doesn't exist or hasn't started yet.
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

  const playerCount = currentTournament.players.length
  const rounds = Math.log2(playerCount)

  const getCenters = () => {
    const centers = Array.from({ length: rounds }, () => [])
    const baseInterval = 160
    const firstMatches = bracket[0]?.length || 0

    for (let j = 0; j < firstMatches; j++) {
      centers[0][j] = 40 + j * baseInterval
    }

    for (let r = 1; r < rounds; r++) {
      const numMatches = bracket[r]?.length || 0
      for (let k = 0; k < numMatches; k++) {
        const feeder1Center = centers[r - 1][2 * k]
        const feeder2Index = 2 * k + 1
        let feeder2Center = feeder1Center
        if (feeder2Index < centers[r - 1].length) {
          feeder2Center = centers[r - 1][feeder2Index]
        }
        centers[r][k] = (feeder1Center + feeder2Center) / 2
      }
    }

    return centers
  }

  const createConnectors = (round, centers, totalRounds) => {
    const connectorElements = []
    const matchCount = centers[round].length

    for (let i = 0; i < matchCount; i += 2) {
      const match1Index = i
      const match2Index = i + 1
      const match1Center = centers[round][match1Index]
      let match2Center = match1Center
      let hasMatch2 = false
      if (match2Index < matchCount) {
        match2Center = centers[round][match2Index]
        hasMatch2 = true
      }
      const connectionPoint = (match1Center + match2Center) / 2

      // Horizontal lines from matches
      connectorElements.push(
        <div
          key={`h1-${round}-${i}`}
          style={{
            position: "absolute",
            width: "30px",
            height: "2px",
            background: "#d1d5db",
            left: "240px",
            top: `${match1Center + 19}px`,
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
              left: "240px",
              top: `${match2Center + 19}px`,
            }}
          />,
        )

        // Vertical connecting line
        connectorElements.push(
          <div
            key={`v-${round}-${i}`}
            style={{
              position: "absolute",
              width: "2px",
              background: "#d1d5db",
              left: "269px",
              top: `${Math.min(match1Center, match2Center) + 19}px`,
              height: `${Math.abs(match2Center - match1Center) + 2}px`,
            }}
          />,
        )
      }

      // Horizontal line to next round
      connectorElements.push(
        <div
          key={`hr-${round}-${i}`}
          style={{
            position: "absolute",
            width: "30px",
            height: "2px",
            background: "#d1d5db",
            left: "270px",
            top: `${connectionPoint + 19}px`,
          }}
        />,
      )
    }

    return connectorElements
  }

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

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100vh",
        background: "#f9fafb",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
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
            onClick={() => navigate(`/tournament-details/${id}`)}
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
            ← Return dAad
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

      {/* Bracket */}
      <div
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "60px",
            alignItems: "flex-start",
            position: "relative",
            minWidth: "fit-content",
            padding: "20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #e5e7eb",
          }}
        >
          {bracket.map((roundMatches, round) => (
            <div key={round} style={{ position: "relative" }}>
              {/* Round Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
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

              {/* Round Container */}
              <div
                style={{
                  height: `${Math.max(...centers[round]) + 40}px`,
                  position: "relative",
                  width: "240px",
                }}
              >
                {roundMatches.map((match, matchIndex) => (
                  <div
                    key={`${round}-${matchIndex}`}
                    style={{
                      top: `${centers[round][matchIndex] - 40}px`,
                      position: "absolute",
                      width: "240px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      background: "white",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
                        {match.player1.name}{" "}
                        <span style={{ color: "#6b7280", fontSize: "12px" }}>({match.player1.seed})</span>
                      </span>
                      <span
                        style={{
                          background: match.score1 > match.score2 ? "#3b82f6" : "#e5e7eb",
                          color: match.score1 > match.score2 ? "white" : "#6b7280",
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
                        {match.player2.name}{" "}
                        <span style={{ color: "#6b7280", fontSize: "12px" }}>({match.player2.seed})</span>
                      </span>
                      <span
                        style={{
                          background: match.score2 > match.score1 ? "#3b82f6" : "#e5e7eb",
                          color: match.score2 > match.score1 ? "white" : "#6b7280",
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

              {/* Connectors */}
              {round < bracket.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: "240px",
                    width: "60px",
                    height: "100%",
                    top: "40px",
                    pointerEvents: "none",
                  }}
                >
                  {createConnectors(round, centers, rounds)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TournamentView
