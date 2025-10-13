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

  const [tournament, setTournament] = useState(null)
  const [players, setPlayers] = useState([])
  const [bracket, setBracket] = useState([])
  const [status, setStatus] = useState("pending")
  const [shareUrl, setShareUrl] = useState(null)
  const [editingMatch, setEditingMatch] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")
  const [loading, setLoading] = useState(false)
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

  // Fetch tournament data on component mount
  useEffect(() => {
    if (id) {
      fetchTournamentData()
    }
  }, [id])

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await tournamentApi.getTournamentDetails(id);
      setTournament(details);
      dispatch(selectTournament(details));
      setStatus(details.status || "pending");

      if (details.data?.entries) {
        const mappedPlayers = details.data.entries.map((entry) => ({
          id: entry.id,
          name: entry.player_name,
          seed: entry.seed_number || 0,
        }));
        setPlayers(mappedPlayers);
      }

      const bracketData = await tournamentApi.getTournamentBracket(id);

      const effectivePlayersLocal = details?.data?.entries?.map((entry) => ({
        id: entry.id,
        name: entry.player_name,
        seed: entry.seed_number || 0,
      })) || [];
      const playerCountLocal = effectivePlayersLocal.length;
      const numRounds = Number.isInteger(Math.log2(playerCountLocal)) ? Math.log2(playerCountLocal) : 0;

      let initialBracket = bracketData?.data.bracket || null;
      if (initialBracket) {
        const expectedFirstRoundMatches = playerCountLocal / 2;
        if (initialBracket[0]?.length !== expectedFirstRoundMatches) {
          initialBracket = null;
        } else if (initialBracket.length < numRounds) {
          const fullBracket = createBracketStructure(effectivePlayersLocal);
          for (let r = 0; r < initialBracket.length; r++) {
            for (let m = 0; m < initialBracket[r].length; m++) {
              fullBracket[r][m].score1 = initialBracket[r][m].score1;
              fullBracket[r][m].score2 = initialBracket[r][m].score2;
            }
          }
          initialBracket = fullBracket;
        }
      }

      if (initialBracket) {
        const propagatedBracket = propagateWinners(initialBracket);
        setBracket(propagatedBracket);
        dispatch(updateBracket(propagatedBracket));
      } else if (playerCountLocal >= 4 && Number.isInteger(Math.log2(playerCountLocal))) {
        // Generate if no valid bracket was loaded and player count is valid
        const newBracket = createBracketStructure(effectivePlayersLocal);
        if (newBracket.length > 0) {
          const propagatedBracket = propagateWinners(newBracket);
          setBracket(propagatedBracket);
          dispatch(updateBracket(propagatedBracket));
        }
      }

      console.log("[v0] Loaded tournament details:", details);
      console.log("[v0] Loaded bracket:", bracketData?.data.bracket);
    } catch (err) {
      setError("Failed to fetch tournament data");
      console.error("Error fetching tournament data:", err);
    } finally {
      setLoading(false);
    }
  };

  const effectivePlayers = players.length > 0 ? players : tournament?.data?.entries?.map((entry) => ({
    id: entry.id,
    name: entry.player_name,
    seed: entry.seed_number || 0,
  })) || []
  const playerCount = effectivePlayers.length > 0 ? effectivePlayers.length : bracket[0]?.length ? bracket[0].length * 2 : 0
  const isValidPlayerCount = playerCount > 0 && Number.isInteger(Math.log2(playerCount))

  useEffect(() => {
    if (playerCount >= 4 && bracket.length === 0 && isValidPlayerCount) {
      generateBracket()
    }
  }, [])

  const generateBracket = () => {
    const newBracket = createBracketStructure(effectivePlayers)
    if (newBracket.length === 0) return
    const propagatedBracket = propagateWinners(newBracket)
    setBracket(propagatedBracket)
    dispatch(updateBracket(propagatedBracket))
  }

  const getWinner = (match) => {
    if (match.score1 > match.score2) {
      return match.player1
    } else if (match.score1 < match.score2) {
      return match.player2
    } else {
      return { name: "TBD", seed: 0 }
    }
  }

  const propagateWinners = (currentBracket) => {
    if (!currentBracket || currentBracket.length === 0) return currentBracket

    const updatedBracket = JSON.parse(JSON.stringify(currentBracket))
    for (let r = 0; r < updatedBracket.length - 1; r++) {
      const currentRound = updatedBracket[r]
      const nextRound = updatedBracket[r + 1]
      for (let m = 0; m < nextRound.length; m++) {
        const match1 = currentRound[2 * m]
        const match2 = currentRound[2 * m + 1] || null
        const winner1 = getWinner(match1) || { name: "TBD", seed: 0 }
        const winner2 = match2 ? getWinner(match2) || { name: "TBD", seed: 0 } : { name: "BYE", seed: 0 }
        nextRound[m].player1 = winner1
        nextRound[m].player2 = winner2
      }
    }
    return updatedBracket
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

  const handleEditResult = (round, matchIndex) => {
    if (!isLoggedIn) return
    setEditingMatch({ round, matchIndex })
    setScore1(bracket[round][matchIndex].score1.toString())
    setScore2(bracket[round][matchIndex].score2.toString())
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

        const updatedBracket = JSON.parse(JSON.stringify(bracket))
        updatedBracket[editingMatch.round][editingMatch.matchIndex] = {
          ...updatedBracket[editingMatch.round][editingMatch.matchIndex],
          score1: matchData.score1,
          score2: matchData.score2,
        }

        const finalBracket = propagateWinners(updatedBracket)
        setBracket(finalBracket)

        dispatch(updateBracket(finalBracket))

        if (id) {
          await tournamentApi.saveBracket(id, {
            bracket: finalBracket,
            players: effectivePlayers,
          })
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

      if (id) {
        await tournamentApi.saveBracket(id, {
          bracket,
          players: effectivePlayers,
        })
        await tournamentApi.startTournament(id)
        const urlData = await tournamentApi.generateTournamentUrl(id)

        setStatus("in-progress")
        setShareUrl(urlData.shareUrl || `/bracket/${id}`)

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
          className="connector horizontal-line"
          style={{
            width: `${connectorHalf}px`,
            left: "0px",
            top: `${match1Center + connectorOffset}px`,
          }}
        />
      )

      if (hasMatch2) {
        connectorElements.push(
          <div
            key={`h2-${round}-${i}`}
            className="connector horizontal-line"
            style={{
              width: `${connectorHalf}px`,
              left: "0px",
              top: `${match2Center + connectorOffset}px`,
            }}
          />
        )

        connectorElements.push(
          <div
            key={`v-${round}-${i}`}
            className="connector vertical-line"
            style={{
              left: `${vLeft}px`,
              top: `${Math.min(match1Center, match2Center) + connectorOffset}px`,
              height: `${Math.abs(match2Center - match1Center) + 2}px`,
            }}
          />
        )
      }

      connectorElements.push(
        <div
          key={`hr-${round}-${i}`}
          className="connector horizontal-line"
          style={{
            width: `${connectorHalf}px`,
            left: `${connectorHalf}px`,
            top: `${connectionPoint + connectorOffset}px`,
          }}
        />
      )
    }

    return connectorElements
  }

  const getRoundName = (roundIndex, totalRounds) => {
    const reverseNames = ['Final', 'Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32', 'Round of 64'];
    return reverseNames[totalRounds - roundIndex - 1] || `Round ${roundIndex + 1}`;
  }

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
        padding: containerPadding,
      }}
    >
      <div className="container" style={{ width: "100%" }}>
        <div className="controls">
          {isLoggedIn && (
            <button className="return-btn" onClick={() => navigate(`/tournament-details/${id}`)}>
              &larr; Back
            </button>
          )}
          <h2>Tournament Bracket</h2>
          <div style={{ textAlign: "center", color: "#666", marginBottom: "10px" }}>
            {playerCount} players - Tournament Status: {status}
          </div>

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
              <div style={{ display: "flex", gap: isMobile ? "5px" : "10px", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={window.location.origin + shareUrl}
                  readOnly
                  style={{ 
                    width: isMobile ? "70%" : "300px", 
                    padding: "5px",
                    flex: isMobile ? 1 : "unset",
                    minWidth: 0
                  }}
                />
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.origin + shareUrl)}
                  style={{ 
                    padding: "6px 12px", 
                    background: "#2563eb", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "8px",
                    whiteSpace: "nowrap"
                  }}
                >
                  Copy Link
                </button>
              </div>
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
          <>
            <div
              className="round-headers"
              style={{
                display: "flex",
                gap: `${gap}px`,
                padding: `${bracketPadding}px ${bracketPadding}px 0`,
                justifyContent: "flex-start",
                width: "100%",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
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
            <div
              className="bracket"
              style={{
                display: "flex",
                gap: `${gap}px`,
                alignItems: "flex-start",
                position: "relative",
                overflowX: "auto",
                padding: `${bracketPadding}px`,
                width: "100%",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {bracket.map((roundMatches, round) => {
                const roundCenters = centers[round] || [];
                const maxCenter = Math.max(...roundCenters, 0);
                return (
                  <div
                    key={round}
                    className="round"
                    style={{
                      height: `${maxCenter + initialOffset}px`,
                      position: "relative",
                      width: `${roundWidth}px`,
                      flexShrink: 0,
                      // border: '1px solid red'
                    }}
                  >
                    {roundMatches.map((match, matchIndex) => {
                      const matchTop = (roundCenters[matchIndex] ?? initialOffset) - initialOffset;
                      return (
                        <div
                          key={`${round}-${matchIndex}`}
                          className="match"
                          style={{
                            top: `${matchTop}px`,
                            position: "absolute",
                            width: `${roundWidth}px`,
                            // border: "1px solid #ddd",
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
                            cursor: isLoggedIn ? "pointer" : "default",
                            // border: '1px solid blue'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditResult(round, matchIndex);
                          }}
                        >
                          <div
                            className="player"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: playerPadding,
                              fontSize: playerFontSize,
                            }}
                          >
                            <span style={{ color: "#111827", fontWeight: "500", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {match.player1.name === "TBD" ? "TBD" : match.player1.name}{" "}
                              {match.player1.name !== "TBD" && match.player1.name !== "BYE" && (
                                <span style={{ color: "#6b7280", fontSize: isMobile ? "11px" : "13px" }}>
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
                          <div
                            className="player"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: playerPadding,
                              fontSize: playerFontSize,
                              borderTop: "1px solid #ddd",
                            }}
                          >
                            <span style={{ color: "#111827", fontWeight: "500", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {match.player2.name === "TBD" ? "TBD" : match.player2.name}{" "}
                              {match.player2.name !== "TBD" && match.player2.name !== "BYE" && (
                                <span style={{ color: "#6b7280", fontSize: isMobile ? "11px" : "13px" }}>
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
                      );
                    })}
                  </div>
                );
              })}
              {Array.from({ length: rounds - 1 }, (_, round) => {
                const adjustment = isMobile 
                  ? -round * connectorOffset 
                  : connectorOffset - (round > 0 ? 3 : 0);
                return (
                  <div
                    key={`connector-${round}`}
                    style={{
                      position: "absolute",
                      left: `${(round + 1) * roundWidth + round * gap + adjustment}px`,
                      width: `${gap}px`,
                      height: "100%",
                      top: "0px",
                      pointerEvents: "none",
                    }}
                  >
                    {createConnectors(round, centers, rounds)}
                  </div>
                );
              })}
            </div>
          </>
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
                padding: isMobile ? "15px" : "20px",
                width: isMobile ? "90vw" : "320px",
                maxWidth: "400px",
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

export default TournamentBracket;