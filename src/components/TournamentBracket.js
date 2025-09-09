"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  updateBracket,
  startTournament,
  generateTournamentUrl,
  updateMatchResult,
  selectTournament,
} from "../redux/actions"
import { useNavigate, useParams } from "react-router-dom"
import { tournamentApi } from "../utils/tournamentApi"

const TournamentBracket = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { isLoggedIn, isAdmin } = useSelector((state) => state.auth)
  const tournaments = useSelector((state) => state.tournaments)
  const { players, bracket, status, shareUrl } = useSelector((state) => state.tournament)
  const currentTournament = useSelector((state) => state.tournament)
  const effectivePlayers = players.length > 0 ? players : currentTournament.entryList || []
  const playerCount = effectivePlayers.length > 0 
    ? effectivePlayers.length 
    : bracket[0]?.length ? bracket[0].length * 2 : 0;
  const isValidPlayerCount = playerCount > 0 && Number.isInteger(Math.log2(playerCount));

  const [editingMatch, setEditingMatch] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch tournament bracket on component mount
  useEffect(() => {
    if (id) {
      fetchTournamentBracket()
    }
  }, [id])

  const fetchTournamentBracket = async () => {
    try {
      setLoading(true)
      setError(null)
      const bracketData = await tournamentApi.getTournamentBracket(id)
      if (bracketData.bracket) {
        dispatch(updateBracket(bracketData.bracket))
      }

      // Fetch tournament details if not in local state
      const tournament = tournaments.find((t) => t.id.toString() === id)
      if (!tournament) {
        const tournamentDetails = await tournamentApi.getTournamentDetails(id)
        dispatch(selectTournament(tournamentDetails))
      }
    } catch (err) {
      setError("Failed to fetch tournament bracket")
      console.error("Error fetching tournament bracket:", err)
    } finally {
      setLoading(false)
    }
  }

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
      if (newBracket.length === 0) return // Exit if bracket creation failed
      dispatch(updateBracket(newBracket))

      // Update bracket on backend
      if (id) {
        // await tournamentApi.updateTournament(id, {
        //   bracket: newBracket,
        //   players: effectivePlayers,
        // })
      }
    } catch (err) {
      console.error("Error updating bracket:", err)
      setError("Failed to update bracket")
    }
  }

  const handleEditResult = (round, matchIndex) => {
    if (!isLoggedIn) return
    setEditingMatch({ round, matchIndex })
    setScore1(bracket[round][matchIndex].score1)
    setScore2(bracket[round][matchIndex].score2)
  }

  const handleSaveResult = async () => {
    if (editingMatch) {
      try {
        setLoading(true)
        setError(null)

        const matchData = {
          round: editingMatch.round,
          matchIndex: editingMatch.matchIndex,
          score1: Number.parseInt(score1) || 0,
          score2: Number.parseInt(score2) || 0,
        }

        // Update local state
        dispatch(updateMatchResult(matchData))

        if (id) {
          await tournamentApi.updateMatchResult(id, matchData)
        }

        setEditingMatch(null)
        setScore1("")
        setScore2("")
      } catch (err) {
        console.error("Error updating match result:", err)
        setError("Failed to update match result")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleStartTournament = async () => {
    try {
      setLoading(true)
      setError(null)

      // Start tournament on backend
      if (id) {
        await tournamentApi.startTournament(id)
        const urlData = await tournamentApi.generateTournamentUrl(id)

        // Update local state
        dispatch(startTournament())
        dispatch(generateTournamentUrl())
      }
    } catch (err) {
      console.error("Error starting tournament:", err)
      setError("Failed to start tournament")
    } finally {
      setLoading(false)
    }
  }

  const getCenters = () => {
    // Return an empty array if bracket is invalid or playerCount is invalid
    if (!bracket || !Array.isArray(bracket) || bracket.length === 0 || !isValidPlayerCount) {
      return [];
    }

    const rounds = Math.log2(playerCount);
    const centers = Array.from({ length: rounds }, () => []);
    const baseInterval = 160;
    const firstMatches = bracket[0]?.length || 0;

    // Populate centers for the first round
    for (let j = 0; j < firstMatches; j++) {
      centers[0][j] = 40 + j * baseInterval;
    }

    // Populate centers for subsequent rounds
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
          className="connector horizontal-line"
          style={{
            width: "30px",
            left: "0px",
            top: `${match1Center + 19}px`,
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
          }}
        />,
      )
    }

    return connectorElements
  }

  useEffect(() => {
    if (id) {
      const tournament = tournaments.find((t) => t.id.toString() === id)
      if (tournament) {
        dispatch(selectTournament(tournament))
      }
    }
  }, [id, tournaments, dispatch])

  useEffect(() => {
    if (effectivePlayers.length >= 4 && bracket.length === 0 && isValidPlayerCount) {
      generateBracket()
    }
  }, [effectivePlayers, bracket, isValidPlayerCount])

  const rounds = isValidPlayerCount ? Math.log2(playerCount) : 0;
  const centers = getCenters()

  return (
    <div
      className="tournament-container"
      style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div className="container">
        <div className="controls">
          {isLoggedIn && (
            <button className="return-btn" onClick={() => navigate(`/tournaments`)}>
              Return
            </button>
          )}
          <h2>Tournament Bracket</h2>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {!isValidPlayerCount && bracket.length > 0 && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              Invalid tournament structure: Number of players must be a power of 2.
            </div>
          )}

          {isLoggedIn && isAdmin && status === "pending" && (
            <button
              onClick={handleStartTournament}
              disabled={loading || !isValidPlayerCount}
              style={{
                opacity: loading || !isValidPlayerCount ? 0.6 : 1,
                cursor: loading || !isValidPlayerCount ? "not-allowed" : "pointer",
                padding: "6px 12px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
              }}
            >
              {loading ? "Starting..." : "Start Tournament"}
            </button>
          )}
          {isLoggedIn && status === "in-progress" && shareUrl && (
            <div>
              <p>Share this link with everyone to view the tournament:</p>
              <input
                type="text"
                value={window.location.origin + shareUrl}
                readOnly
                style={{ width: "300px", padding: "5px" }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(window.location.origin + shareUrl)}
                style={{ marginLeft: "10px", padding: "6px 12px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px" }}
              >
                Copy Link
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Loading bracket...
          </div>
        )}

        {status === "ended" && bracket.length > 0 && bracket[bracket.length - 1]?.[0] && (
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h2>Tournament Ended!</h2>
            <p>
              Winner:{" "}
              {bracket[bracket.length - 1][0].score1 > bracket[bracket.length - 1][0].score2
                ? bracket[bracket.length - 1][0].player1.name
                : bracket[bracket.length - 1][0].player2.name}
            </p>
          </div>
        )}

      {bracket.length === 0 && !loading && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          No bracket available. Please ensure there are enough players and try again.
        </div>
      )}

      {bracket.length > 0 && isValidPlayerCount && (
        <div
          className="bracket"
          style={{
            display: "flex",
            gap: "60px",
            alignItems: "flex-start",
            position: "relative",
            overflowX: "auto",
            padding: "20px",
          }}
        >
          {bracket.map((roundMatches, round) => {
            const roundCenters = centers[round] || [];
            return (
              <div
                key={round}
                className="round"
                style={{
                  height: `${Math.max(...roundCenters, 0) + 40}px`,
                  position: "relative",
                  width: "240px",
                }}
              >
                {roundMatches.map((match, matchIndex) => (
                  <div
                    key={`${round}-${matchIndex}`}
                    className="match"
                    style={{
                      top: `${(roundCenters[matchIndex] ?? 40) - 40}px`,
                      position: "absolute",
                      width: "240px",
                      border: "1px solid #ddd",
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
                      cursor: isLoggedIn ? "pointer" : "default",
                    }}
                    onClick={() => isLoggedIn && handleEditResult(round, matchIndex)}
                  >
                    <div
                      className="player"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 8px",
                        fontSize: "14px",
                      }}
                    >
                      <span style={{ color: "#111827", fontWeight: "500" }}>
                        {match.player1.name === "TBD" ? "TBD" : match.player1.name}{" "}
                        {match.player1.name !== "TBD" && match.player1.name !== "BYE" && (
                          <span style={{ color: "#6b7280", fontSize: "13px" }}>
                            ({match.player1.seed})
                          </span>
                        )}
                      </span>
                      <span
                        className="score"
                        style={{
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          borderRadius: "6px",
                          width: "24px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {match.score1}
                      </span>
                    </div>
                    <div
                      className="player"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 8px",
                        fontSize: "14px",
                        borderTop: "1px solid #ddd",
                      }}
                    >
                      <span style={{ color: "#111827", fontWeight: "500" }}>
                        {match.player2.name === "TBD" ? "TBD" : match.player2.name}{" "}
                        {match.player2.name !== "TBD" && match.player2.name !== "BYE" && (
                          <span style={{ color: "#6b7280", fontSize: "13px" }}>
                            ({match.player2.seed})
                          </span>
                        )}
                      </span>
                      <span
                        className="score"
                        style={{
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          borderRadius: "6px",
                          width: "24px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
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
          {Array.from({ length: rounds - 1 }, (_, round) => (
            <div
              key={`connector-${round}`}
              style={{
                position: "absolute",
                left: `${(round + 1) * 240 + round * 60 + 20}px`,
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
      )}
        {editingMatch && isLoggedIn && (
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

              {error && (
                <div
                  style={{
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    padding: "8px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    fontSize: "12px",
                  }}
                >
                  {error}
                </div>
              )}

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
                  disabled={loading}
                  style={{
                    padding: "6px 12px",
                    background: loading ? "#9ca3af" : "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "500",
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditingMatch(null)
                    setError(null)
                  }}
                  disabled={loading}
                  style={{
                    padding: "6px 12px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
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

export default TournamentBracket
