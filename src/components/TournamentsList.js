import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createTournament, selectTournament } from "../redux/actions"
import { Navigate, useNavigate } from "react-router-dom"

const TournamentsList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const tournaments = useSelector((state) => state.tournaments)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [tournamentName, setTournamentName] = useState("")
  const [competitionType, setCompetitionType] = useState("Pool (Billiards)")
  const [competitionFormat, setCompetitionFormat] = useState("Knockout")

  const competitionTypes = ["Pool (Billiards)", "Darts", "Cars", "Bikes"]
  const competitionFormats = ["Knockout", "Round Robin"]

  const handleCreateTournament = () => {
    if (tournamentName.trim()) {
      dispatch(
        createTournament({
          name: tournamentName.trim(),
          type: competitionType,
          format: competitionFormat,
        }),
      )
      setTournamentName("")
      setShowCreateForm(false)
    }
  }

  const handleTournamentClick = (tournament) => {
    dispatch(selectTournament(tournament))
    navigate(`/tournament-details/${tournament.id}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#059669"
      case "in-progress":
        return "#d97706"
      case "ended":
        return "#dc2626"
      default:
        return "#6b7280"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅"
      case "in-progress":
        return "⏳"
      case "ended":
        return "🏆"
      default:
        return "📋"
    }
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  const containerStyle = {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
  }

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    padding: "24px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  }

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  }

  const buttonStyle = {
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }

  const createBtnStyle = {
    ...buttonStyle,
    background: "#3b82f6",
    color: "white",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  }

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  }

  const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  }

  const formStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "500px",
    margin: "20px",
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🏆 Tournament Dashboard</h1>
        <button
          style={createBtnStyle}
          onClick={() => setShowCreateForm(true)}
          onMouseEnter={(e) => {
            e.target.style.background = "#2563eb"
            e.target.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#3b82f6"
            e.target.style.transform = "translateY(0)"
          }}
        >
          ➕ Create Tournament
        </button>
      </div>

      <div style={gridStyle}>
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            style={cardStyle}
            onClick={() => handleTournamentClick(tournament)}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: 0 }}>{tournament.name}</h3>
              <span
                style={{
                  color: getStatusColor(tournament.status),
                  fontSize: "20px",
                }}
              >
                {getStatusIcon(tournament.status)}
              </span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>
                {tournament.type} • {tournament.format}
              </span>
            </div>

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}
            >
              <span style={{ fontSize: "14px", color: "#374151" }}>👥 {tournament.players} players</span>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>📅 {tournament.createdDate}</span>
            </div>

            <div
              style={{
                padding: "8px 12px",
                background: "#f3f4f6",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: getStatusColor(tournament.status),
              }}
            >
              Status: {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
              {tournament.winner && ` • Winner: ${tournament.winner}`}
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div style={modalStyle}>
          <div style={formStyle}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              🏆 Create New Tournament
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}
              >
                Tournament Name
              </label>
              <input
                type="text"
                placeholder="Enter tournament name"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}
              >
                Competition Type
              </label>
              <select
                value={competitionType}
                onChange={(e) => setCompetitionType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "white",
                }}
              >
                {competitionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}
              >
                Competition Format
              </label>
              <select
                value={competitionFormat}
                onChange={(e) => setCompetitionFormat(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "white",
                }}
              >
                {competitionFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  ...buttonStyle,
                  background: "#e5e7eb",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                disabled={!tournamentName.trim()}
                style={{
                  ...buttonStyle,
                  background: tournamentName.trim() ? "#3b82f6" : "#d1d5db",
                  color: "white",
                  cursor: tournamentName.trim() ? "pointer" : "not-allowed",
                }}
              >
                Create Tournament
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TournamentsList
