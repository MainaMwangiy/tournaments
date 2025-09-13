import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { generateTournamentUrl } from "../redux/actions"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { tournamentApi } from "../utils/tournamentApi"

const TournamentDetails = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const isAdmin = useSelector((state) => state.auth.isAdmin)
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTournamentData = async () => {
      if (id) {
        try {
          setLoading(true)
          const details = await tournamentApi.getTournamentDetails(id)
          setTournament(details?.data)
          console.log("[v0] Loaded tournament details:", details)
        } catch (err) {
          console.error("Failed to fetch tournament details:", err)
          setError("Failed to load tournament details")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchTournamentData()
  }, [id])

  const handleGenerateLink = () => {
    dispatch(generateTournamentUrl())
    const shareUrl = `/bracket/${tournament?.id}`
    navigator.clipboard.writeText(window.location.origin + shareUrl)
    alert("Tournament link copied to clipboard!")
  }

  const handleAddEntries = () => {
    navigate(`/player-entry/${tournament?.id}`)
  }

  const handleViewBracket = () => {
    navigate(`/bracket/${tournament?.id}`)
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <p>Loading tournament...</p>
      </div>
    )
  }

  if (!tournament || error) {
    return <Navigate to="/tournaments" />
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

  const containerStyle = {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
  }

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "32px",
    padding: "24px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  }

  const backBtnStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "16px",
    transition: "all 0.2s ease",
  }

  const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "32px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }

  const buttonStyle = {
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginRight: "12px",
  }

  const primaryBtnStyle = {
    ...buttonStyle,
    background: "#3b82f6",
    color: "white",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  }

  const secondaryBtnStyle = {
    ...buttonStyle,
    background: "#10b981",
    color: "white",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  }

  const outlineBtnStyle = {
    ...buttonStyle,
    background: "transparent",
    color: "#6b7280",
    border: "2px solid #e5e7eb",
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
          style={backBtnStyle}
          onClick={() => navigate("/tournaments")}
          onMouseEnter={(e) => {
            e.target.style.background = "#d1d5db"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#e5e7eb"
          }}
        >
          ← Back to Tournaments
        </button>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0 }}>Tournament Details</h1>
      </div>

      <div style={cardStyle}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}
        >
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
              🏆 {tournament.name}
            </h2>
            <p style={{ fontSize: "18px", color: "#6b7280", margin: 0 }}>
              {tournament.type} • {tournament.format}
            </p>
          </div>
          <div
            style={{
              padding: "12px 16px",
              background: "#f3f4f6",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              color: getStatusColor(tournament.status),
            }}
          >
            Status: {tournament.status?.charAt(0).toUpperCase() + tournament.status?.slice(1)}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#3b82f6" }}>{tournament.entries?.length || 0}</div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>Players</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}>{tournament.created_on}</div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>Created</div>
          </div>
          {tournament.winner && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#dc2626" }}>🏆 {tournament.winner}</div>
              <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>Winner</div>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
            Tournament Actions
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              style={primaryBtnStyle}
              onClick={handleAddEntries}
              onMouseEnter={(e) => {
                e.target.style.background = "#2563eb"
                e.target.style.transform = "translateY(-1px)"
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#3b82f6"
                e.target.style.transform = "translateY(0)"
              }}
            >
              👥 Add/Manage Entries
            </button>

            <button
              style={secondaryBtnStyle}
              onClick={handleViewBracket}
              onMouseEnter={(e) => {
                e.target.style.background = "#059669"
                e.target.style.transform = "translateY(-1px)"
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#10b981"
                e.target.style.transform = "translateY(0)"
              }}
            >
              🏆 {isAdmin ? "Update Bracket" : "View Bracket"}
            </button>

            <button
              style={outlineBtnStyle}
              onClick={handleGenerateLink}
              onMouseEnter={(e) => {
                e.target.style.background = "#f3f4f6"
                e.target.style.borderColor = "#d1d5db"
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent"
                e.target.style.borderColor = "#e5e7eb"
              }}
            >
              🔗 Generate Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentDetails
