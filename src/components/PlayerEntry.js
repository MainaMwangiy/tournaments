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
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState("")
  const [editingSeed, setEditingSeed] = useState(0)

  const fetchTournamentData = async () => {
    if (id) {
      try {
        setLoading(true)
        const details = await tournamentApi.getTournamentDetails(id)
        setTournamentDetails(details?.data)

        const existingPlayers =
          details?.data.entries?.map((entry) => ({
            id: entry.id,
            name: entry.player_name,
            seed: entry.seed_number || 0,
          })) || []
        setPlayers(existingPlayers)
      } catch (error) {
        console.error("Failed to fetch tournament details:", error)
        setError("Failed to load tournament details")
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchTournamentData()
  }, [id])

  const handleAddPlayer = async () => {
    if (name.trim()) {
      try {
        setLoading(true)
        setError(null)
        if (id) {
          const playerData = {
            name: name.trim(),
            seed: Math.floor(Math.random() * 100) + 1,
            tournament_id: id, 
          }

          await tournamentApi.addPlayer(id, playerData)
          await fetchTournamentData()
          setName("")
        }
      } catch (err) {
        console.error("Error adding player:", err)
        setError(`Failed to add player: ${err.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpdatePlayer = async (entryId) => {
    try {
      setLoading(true)
      setError(null)
      const playerData = {
        name: editingName.trim(),
        seed: editingSeed,
      }
      await tournamentApi.updatePlayer(id, entryId, playerData) 
      await fetchTournamentData()
      setEditingId(null)
    } catch (err) {
      console.error("Error updating player:", err)
      setError(`Failed to update player: ${err.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlayer = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        setLoading(true)
        setError(null)
        await tournamentApi.deletePlayer(id, entryId)
        await fetchTournamentData()
      } catch (err) {
        console.error("Error deleting player:", err)
        setError(`Failed to delete player: ${err.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const startEditing = (player) => {
    setEditingId(player.id)
    setEditingName(player.name)
    setEditingSeed(player.seed)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName("")
    setEditingSeed(0)
  }

  const isPowerOfTwo = (n) => n > 0 && Number.isInteger(Math.log2(n));

  const handleNext = () => {
    navigate(`/bracket/${id || tournamentDetails?.data.id}`)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleAddPlayer()
    }
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  const isFormValid = name.trim() && !loading
  const isReadyToProceed = players.length >= 4 && isPowerOfTwo(players.length);

  // ===== Styles =====
  const containerStyle = {
    minHeight: "100vh",
    background: "#f9f9f9",
    padding: "60px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
  }

  const cardStyle = {
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "32px",
    marginBottom: "32px",
    width: "100%",
    maxWidth: "700px",
    position: "relative",
  }

  const returnBtnStyle = {
    position: "absolute",
    top: "16px",
    left: "16px",
    background: "#f0f0f0",
    border: "1px solid #ccc",
    color: "#333",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.2s",
  }

  const inputContainerStyle = {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
    alignItems: "flex-end",
  }

  const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    minWidth: "200px",
  }

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "6px",
  }

  const inputStyle = {
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    outline: "none",
    boxSizing: "border-box",
    opacity: loading ? 0.6 : 1,
    background: "white",
  }

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.2s",
  }

  const addBtnStyle = {
    ...buttonStyle,
    background: isFormValid ? "#333" : "#ddd",
    color: "white",
    cursor: isFormValid ? "pointer" : "not-allowed",
  }

  const nextBtnStyle = {
    ...buttonStyle,
    background: isReadyToProceed ? "#333" : "#ddd",
    color: "white",
    cursor: isReadyToProceed ? "pointer" : "not-allowed",
    marginLeft: "12px",
  }

  const tableContainerStyle = {
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px",
    overflow: "hidden",
  }

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  }

  const thStyle = {
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    background: "#f0f0f0",
  }

  const tdStyle = {
    padding: "16px 20px",
    fontSize: "15px",
    borderBottom: "1px solid #eee",
    color: "#333",
  }

  const actionTdStyle = {
    ...tdStyle,
    display: "flex",
    gap: "12px",
  }

  const iconStyle = {
    cursor: "pointer",
    fontSize: "18px",
    color: "#666",
    transition: "color 0.2s",
  }

  const emptyRowStyle = {
    ...tdStyle,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  }

  const statusStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    padding: "14px 18px",
    background: "#f0f0f0",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#333",
    border: "1px solid #ddd",
  }

  const errorStyle = {
    background: "#f0f0f0",
    border: "1px solid #ccc",
    color: "#333",
    padding: "14px",
    borderRadius: "4px",
    marginBottom: "24px",
    fontSize: "14px",
  }

  const smallButtonStyle = {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.2s",
    marginRight: "8px",
  }

  const saveBtnStyle = {
    ...smallButtonStyle,
    background: "#333",
    color: "white",
  }

  const cancelBtnStyle = {
    ...smallButtonStyle,
    background: "#ddd",
    color: "#333",
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button style={returnBtnStyle} onClick={() => navigate(`/tournament-details/${id}`)}>
          ← Return
        </button>

        <h2
          style={{
            textAlign: "center",
            fontSize: "26px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "28px",
          }}
        >
          👥 Add Players {tournamentDetails?.name && `- ${tournamentDetails.name}`}
        </h2>

        {error && (
          <div style={errorStyle}>
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "12px",
                padding: "4px 8px",
                background: "transparent",
                border: "none",
                color: "#666",
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
          <span style={{ color: isReadyToProceed ? "#059669" : "#dc2626" }}>
            {isReadyToProceed ? "✓ Ready to proceed" : "Need power of 2 players (4,8,16,...) minimum 4"}
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

          <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
            <button onClick={handleAddPlayer} disabled={!isFormValid} style={addBtnStyle}>
              {loading ? "Adding..." : "➕ Add Player"}
            </button>

            <button onClick={handleNext} disabled={!isReadyToProceed} style={nextBtnStyle}>
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
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length > 0 ? (
              players.map((player, index) => (
                <tr key={player.id || index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                  <td style={tdStyle}>
                    {editingId === player.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                    ) : (
                      player.name
                    )}
                  </td>
                  <td style={tdStyle}>
                    {editingId === player.id ? (
                      <input
                        type="number"
                        value={editingSeed}
                        onChange={(e) => setEditingSeed(parseInt(e.target.value) || 0)}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                    ) : (
                      player.seed
                    )}
                  </td>
                  <td style={actionTdStyle}>
                    {editingId === player.id ? (
                      <>
                        <button onClick={() => handleUpdatePlayer(player.id)} style={saveBtnStyle}>
                          Save
                        </button>
                        <button onClick={cancelEditing} style={cancelBtnStyle}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={iconStyle} onClick={() => startEditing(player)}>✏️</span>
                        <span style={iconStyle} onClick={() => handleDeletePlayer(player.id)}>🗑️</span>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={emptyRowStyle} colSpan={3}>
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