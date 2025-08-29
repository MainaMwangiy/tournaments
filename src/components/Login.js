import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginSuccess } from "../redux/actions"
import { Navigate, useNavigate } from "react-router-dom"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../utils/firebase"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      const userData = {
        user_id: uuidv4(),
        email: user.email,
        name: user.displayName,
        image_url: user.photoURL,
        role: "user",
        provider: "google",
      }
      // Send to backend SSO endpoint
      const response = await axios.post("http://localhost:5000/api/v1/auth/sso", userData)

      if (response.data.success) {
        const { user: dbUser, token } = response.data

        // Store in localStorage
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(dbUser))

        // Update Redux state
        dispatch(loginSuccess(dbUser))
        navigate("/tournaments")
      }
    } catch (error) {
      console.error("Google sign-in failed:", error)
      alert("Sign in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoggedIn) {
    return <Navigate to="/tournaments" />
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

  const googleButtonStyle = {
    width: "100%",
    padding: "16px 20px",
    fontSize: "16px",
    fontWeight: "600",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    background: "white",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    opacity: isLoading ? 0.7 : 1,
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</div>

        <h2 style={titleStyle}>Tournament Manager</h2>
        <p style={subtitleStyle}>Sign in with Google to manage your tournaments</p>

        <button onClick={handleGoogleSignIn} disabled={isLoading} style={googleButtonStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </div>
  )
}

export default Login
