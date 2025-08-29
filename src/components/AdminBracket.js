

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateMatchResult } from "../redux/actions"
import { Navigate, useNavigate } from "react-router-dom"

const AdminBracket = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoggedIn, isAdmin } = useSelector((state) => state.auth)
  const { bracket, players, status } = useSelector((state) => state.tournament)
  const [editingMatch, setEditingMatch] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")

  const playerCount = players.length
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

  const centers = getCenters()

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

      connectorElements.push(
        <div
          key={`h1-${round}-${i}`}
          className="connector horizontal-line"
          style={{
            width: "30px",
            left: "0px",
            top: `${match1Center + 19}px`,
            borderTop: "2px solid #e5e7eb",
          }}
        />,
      )

      if (hasMatch2) {
        connectorElements.push(
          <div
            key={`h2-${round}-${i}`}
            className="connector horizontal-line"
            style={{
              width: "30px",
              left: "0px",
              top: `${match2Center + 19}px`,
              borderTop: "2px solid #e5e7eb",
            }}
          />,
        )

        connectorElements.push(
          <div
            key={`v-${round}-${i}`}
            className="connector vertical-line"
            style={{
              left: "29px",
              top: `${Math.min(match1Center, match2Center) + 19}px`,
              height: `${Math.abs(match2Center - match1Center) + 2}px`,
              borderLeft: "2px solid #e5e7eb",
            }}
          />,
        )
      }

      connectorElements.push(
        <div
          key={`hr-${round}-${i}`}
          className="connector horizontal-line"
          style={{
            width: "30px",
            left: "30px",
            top: `${connectionPoint + 19}px`,
            borderTop: "2px solid #e5e7eb",
          }}
        />,
      )
    }

    return connectorElements
  }

  const handleEditResult = (round, matchIndex) => {
    setEditingMatch({ round, matchIndex })
    setScore1(bracket[round][matchIndex].score1)
    setScore2(bracket[round][matchIndex].score2)
  }

  const handleSaveResult = () => {
    if (editingMatch) {
      dispatch(
        updateMatchResult({
          round: editingMatch.round,
          matchIndex: editingMatch.matchIndex,
          score1: Number.parseInt(score1),
          score2: Number.parseInt(score2),
        }),
      )
      setEditingMatch(null)
      setScore1("")
      setScore2("")
    }
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/login" />
  }

  return (
    <div
      className="tournament-container"
      style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div className="container" style={{ width: "100%", maxWidth: "1400px" }}>
        <div
          className="controls"
          style={{
            background: "#f9fafb",
            color: "#111827",
            padding: "16px 20px",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            ← Return
          </button>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Admin Bracket Editor</h2>
        </div>

        {status === "ended" && (
          <div
            style={{
              background: "#fef2f2",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              color: "#991b1b",
              fontWeight: "500",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ marginBottom: "6px" }}>🏆 Tournament Ended!</h2>
            <p>
              Winner:{" "}
              {bracket[bracket.length - 1][0].score1 > bracket[bracket.length - 1][0].score2
                ? bracket[bracket.length - 1][0].player1.name
                : bracket[bracket.length - 1][0].player2.name}
            </p>
          </div>
        )}

        <div
          className="bracket"
          style={{
            display: "flex",
            gap: "80px",
            alignItems: "flex-start",
            position: "relative",
            overflowX: "auto",
            padding: "20px",
          }}
        >
          {bracket.map((roundMatches, round) => (
            <div
              key={round}
              className="round"
              style={{
                height: `${Math.max(...centers[round]) + 40}px`,
                position: "relative",
                width: "260px",
              }}
            >
              {roundMatches.map((match, matchIndex) => (
                <div
                  key={`${round}-${matchIndex}`}
                  className="match"
                  style={{
                    top: `${centers[round][matchIndex] - 40}px`,
                    position: "absolute",
                    width: "260px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#fff",
                    color: "#111827",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    height: "84px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onClick={() => handleEditResult(round, matchIndex)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    <span>
                      {match.player1.name}{" "}
                      <span style={{ color: "#6b7280", fontSize: "13px" }}>({match.player1.seed})</span>
                    </span>
                    <span
                      style={{
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        borderRadius: "6px",
                        minWidth: "28px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {match.score1}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      fontSize: "14px",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <span>
                      {match.player2.name}{" "}
                      <span style={{ color: "#6b7280", fontSize: "13px" }}>({match.player2.seed})</span>
                    </span>
                    <span
                      style={{
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        borderRadius: "6px",
                        minWidth: "28px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "600",
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
                position: "absolute",
                left: `${(round + 1) * 260 + round * 80 + 20}px`,
                width: "60px",
                height: "100%",
                top: "0px",
                pointerEvents: "none",
              }}
            >
              {createConnectors(round, centers, rounds)}
            </div>
          ))}
        </div>

        {editingMatch && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#f9fafb",
                color: "#111827",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                width: "320px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>Edit Result</h3>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "14px" }}>
                  {bracket[editingMatch.round][editingMatch.matchIndex].player1.name} Score:
                </label>
                <input
                  type="number"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    marginTop: "4px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px" }}>
                  {bracket[editingMatch.round][editingMatch.matchIndex].player2.name} Score:
                </label>
                <input
                  type="number"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    marginTop: "4px",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={handleSaveResult}
                  style={{
                    padding: "6px 12px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingMatch(null)}
                  style={{
                    padding: "6px 12px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBracket
