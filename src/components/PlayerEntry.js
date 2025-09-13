"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { tournamentApi } from "../utils/tournamentApi"

const PlayerEntry = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [players, setPlayers] = useState([]) 
  const [tournamentDetails, setTournamentDetails] = useState(null)

  useEffect(() => {
    const fetchTournamentData = async () => {
      debugger
      if (id) {
        try {
          setLoading(true)
          const details = await tournamentApi.getTournamentDetails(id)
          setTournamentDetails(details)

          const existingPlayers =
            details?.data.entries?.map((entry) => ({
              id: entry.id,
              name: entry.player_name,
              seed: entry.seed_number || 0,
            })) || []
          setPlayers(existingPlayers)

          console.log("[v0] Loaded tournament details:", details)
          console.log("[v0] Loaded existing players:", existingPlayers)
        } catch (error) {
          console.error("Failed to fetch tournament details:", error)
          setError("Failed to load tournament details")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchTournamentData()
  }, [id])

  const handleAddPlayer = async () => {
    if (name.trim()) {
      try {
        setLoading(true)
        setError(null)
        debugger
        if (id) {
          const playerData = {
            name: name.trim(),
            seed: players.length + 1,
            tournament_id: id, 
          }

          console.log("[v0] Adding player with data:", playerData)
          const result = await tournamentApi.addPlayer(id, playerData)
          console.log("[v0] Player added successfully:", result)

          const newPlayer = {
            id: result.id || Date.now() + Math.random(),
            name: name.trim(),
            seed: players.length + 1,
          }
          setPlayers((prev) => [...prev, newPlayer])

          setTimeout(async () => {
            try {
              const updatedDetails = await tournamentApi.getTournamentDetails(id)
              const updatedPlayers =
                updatedDetails.entries?.map((entry) => ({
                  id: entry.id,
                  name: entry.player_name,
                  seed: entry.seed_number || 0,
                })) || []
              setPlayers(updatedPlayers)
              console.log("[v0] Refreshed player list:", updatedPlayers)
            } catch (refreshError) {
              console.error("Failed to refresh player list:", refreshError)
            }
          }, 500)
        }

        setName("")
      } catch (err) {
        console.error("Error adding player:", err)
        setError(`Failed to add player: ${err.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleNext = () => {
    navigate(`/bracket/${id || tournamentDetails?.data.id}`)
  }

  const handleKeyPress = (e) => {
    debugger
    if (e.key === "Enter" && !loading) {
      handleAddPlayer()
    }
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  const isFormValid = name.trim() && !loading

  // ===== Styles =====
  const containerStyle = {
    minHeight: "100vh",
    background: "white",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
  }

  const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    padding: "28px",
    marginBottom: "28px",
    width: "100%",
    maxWidth: "600px",
    position: "relative",
  }

  const returnBtnStyle = {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "white",
    border: "1px solid #d1d5db",
    color: "#374151",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  }

  const inputContainerStyle = {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
    alignItems: "flex-end",
  }

  const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    minWidth: "150px",
  }

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "4px",
  }

  const inputStyle = {
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    opacity: loading ? 0.6 : 1,
  }

  const buttonStyle = {
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }

  const addBtnStyle = {
    ...buttonStyle,
    background: isFormValid ? "#111827" : "#d1d5db",
    color: "white",
    cursor: isFormValid ? "pointer" : "not-allowed",
  }

  const nextBtnStyle = {
    ...buttonStyle,
    background: players.length >= 4 ? "#111827" : "#d1d5db",
    color: "white",
    cursor: players.length >= 4 ? "pointer" : "not-allowed",
    marginLeft: "10px",
  }

  const tableContainerStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "600px",
    overflow: "hidden",
  }

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  }

  const thStyle = {
    padding: "14px 18px",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
  }

  const tdStyle = {
    padding: "14px 18px",
    fontSize: "15px",
    borderBottom: "1px solid #f3f4f6",
    color: "#111827",
  }

  const emptyRowStyle = {
    ...tdStyle,
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
  }

  const statusStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    padding: "12px 16px",
    background: "#f9fafb",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#374151",
    border: "1px solid #e5e7eb",
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button style={returnBtnStyle} onClick={() => navigate(`/tournament-detail/${id}`)}>
          ← Return
        </button>

        <h2
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "24px",
          }}
        >
          👥 Add Players {tournamentDetails?.name && `- ${tournamentDetails.name}`}
        </h2>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "10px",
                padding: "4px 8px",
                background: "transparent",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={statusStyle}>
          <span>
            <strong>{players.length}</strong> players added
          </span>
          <span style={{ color: players.length >= 4 ? "#059669" : "#dc2626" }}>
            {players.length >= 4 ? "✓ Ready to proceed" : "Minimum 4 players required"}
          </span>
        </div>

        <div style={inputContainerStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Player Name</label>
            <input
              type="text"
              placeholder="Enter player name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
            <button onClick={handleAddPlayer} disabled={!isFormValid} style={addBtnStyle}>
              {loading ? "Adding..." : "➕ Add Player"}
            </button>

            <button onClick={handleNext} disabled={players.length < 4} style={nextBtnStyle}>
              🏆 Next
            </button>
          </div>
        </div>
      </div>

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>🏅 Player Name</th>
              <th style={thStyle}>Seed</th>
            </tr>
          </thead>
          <tbody>
            {players.length > 0 ? (
              players.map((player, index) => (
                <tr key={player.id || index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                  <td style={tdStyle}>{player.name}</td>
                  <td style={tdStyle}>{player.seed}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={emptyRowStyle} colSpan={2}>
                  🎯 No players added yet. Add your first player above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PlayerEntry
