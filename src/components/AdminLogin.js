

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { adminLogin } from "../redux/actions"
import { Navigate, useNavigate } from "react-router-dom"

const AdminLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    if (password === "admin") {
      dispatch(adminLogin())
      navigate("/admin-bracket")
    } else {
      alert("Invalid password")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  if (isLoggedIn) {
    return <Navigate to="/admin-bracket" />
  }

  // ===== Styles =====
  const containerStyle = {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
    position: "relative",
  }

  const returnBtnStyle = {
    position: "absolute",
    top: "24px",
    left: "24px",
    background: "white",
    border: "1px solid #d1d5db",
    color: "#374151",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  }

  const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  }

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  }

  const subtitleStyle = {
    fontSize: "15px",
    color: "#6b7280",
    marginBottom: "32px",
  }

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    fontSize: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
    boxSizing: "border-box",
    textAlign: "center",
    marginBottom: "24px",
    transition: "all 0.2s ease",
    fontWeight: "500",
  }

  const inputFocusStyle = {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
  }

  const buttonStyle = {
    width: "100%",
    padding: "16px 20px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: password ? "pointer" : "not-allowed",
    transition: "all 0.2s ease",
    background: password ? "#3b82f6" : "#d1d5db",
    color: "white",
    boxShadow: password ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
  }

  const lockIconStyle = {
    fontSize: "48px",
    marginBottom: "16px",
  }

  return (
    <div style={containerStyle}>
      {/* Return button */}
      <button
        style={returnBtnStyle}
        onClick={() => navigate("/bracket")}
        onMouseEnter={(e) => {
          e.target.style.background = "#f3f4f6"
          e.target.style.transform = "translateY(-1px)"
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "white"
          e.target.style.transform = "translateY(0)"
        }}
      >
        ← Return
      </button>

      {/* Login Card */}
      <div style={cardStyle}>
        <div style={lockIconStyle}>🔐</div>

        <h2 style={titleStyle}>Admin Login</h2>
        <p style={subtitleStyle}>Enter your admin password to continue</p>

        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle)
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb"
            e.target.style.boxShadow = "none"
          }}
        />

        <button
          onClick={handleLogin}
          disabled={!password}
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (password) {
              e.target.style.background = "#2563eb"
              e.target.style.transform = "translateY(-1px)"
              e.target.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)"
            }
          }}
          onMouseLeave={(e) => {
            if (password) {
              e.target.style.background = "#3b82f6"
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)"
            }
          }}
        >
          🚀 Login to Admin Panel
        </button>
      </div>
    </div>
  )
}

export default AdminLogin
