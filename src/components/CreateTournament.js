

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createTournament } from "../redux/actions"
import { Navigate, useNavigate } from "react-router-dom"

const CreateTournament = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const [tournamentName, setTournamentName] = useState("")
  const [competitionType, setCompetitionType] = useState("Pool (Billiards)")
  const [competitionFormat, setCompetitionFormat] = useState("Knockout")

  const competitionTypes = ["Pool (Billiards)", "Darts", "Cars", "Bikes"]
  const competitionFormats = ["Knockout", "Round Robin"]

  const handleCreate = () => {
    if (tournamentName.trim()) {
      dispatch(
        createTournament({
          name: tournamentName.trim(),
          type: competitionType,
          format: competitionFormat,
        }),
      )
      navigate("/player-entry")
    }
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const contentStyle = {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    padding: "40px",
    maxWidth: "500px",
    width: "100%",
    position: "relative",
  }

  const sectionStyle = {
    marginBottom: "24px",
  }

  const labelStyle = {
    display: "block",
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  }

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    background: "white",
  }

  const returnBtnStyle = {
    position: "absolute",
    top: "-10px",
    left: "-10px",
    background: "transparent",
    border: "2px solid #6b7280",
    color: "#6b7280",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  }

  const createBtnStyle = {
    width: "100%",
    padding: "16px",
    fontSize: "18px",
    fontWeight: "700",
    border: "none",
    borderRadius: "10px",
    cursor: tournamentName.trim() ? "pointer" : "not-allowed",
    transition: "all 0.3s ease",
    marginTop: "32px",
    marginBottom: "24px",
    background: tournamentName.trim() ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#d1d5db",
    color: "white",
    boxShadow: tournamentName.trim() ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "none",
  }

  const footerStyle = {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  }

  const linkStyle = {
    color: "#6366f1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "color 0.3s ease",
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <button
          style={returnBtnStyle}
          onClick={() => navigate("/login")}
          onMouseEnter={(e) => {
            e.target.style.background = "#6b7280"
            e.target.style.color = "white"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent"
            e.target.style.color = "#6b7280"
          }}
        >
          ← Return
        </button>

        <h2
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "32px",
          }}
        >
          🏆 Create Tournament
        </h2>

        <div style={sectionStyle}>
          <label style={labelStyle}>Tournament Name</label>
          <input
            type="text"
            placeholder="Enter Tournament Name"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: tournamentName.trim() ? "#10b981" : "#e5e7eb",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = tournamentName.trim() ? "#10b981" : "#e5e7eb")}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Competition Type</label>
          <select
            value={competitionType}
            onChange={(e) => setCompetitionType(e.target.value)}
            style={selectStyle}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          >
            {competitionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Competition Format</label>
          <select
            value={competitionFormat}
            onChange={(e) => setCompetitionFormat(e.target.value)}
            style={selectStyle}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          >
            {competitionFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </div>

        <button
          style={createBtnStyle}
          onClick={handleCreate}
          disabled={!tournamentName.trim()}
          onMouseEnter={(e) => {
            if (tournamentName.trim()) {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)"
            }
          }}
          onMouseLeave={(e) => {
            if (tournamentName.trim()) {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)"
            }
          }}
        >
          🚀 Create Tournament
        </button>

        <div style={footerStyle}>
          <a
            href="#"
            style={linkStyle}
            onMouseEnter={(e) => (e.target.style.color = "#4f46e5")}
            onMouseLeave={(e) => (e.target.style.color = "#6366f1")}
          >
            📋 Your Event List
          </a>
          <a
            href="#"
            style={linkStyle}
            onMouseEnter={(e) => (e.target.style.color = "#4f46e5")}
            onMouseLeave={(e) => (e.target.style.color = "#6366f1")}
          >
            📞 Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}

export default CreateTournament
