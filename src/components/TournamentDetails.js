import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateTournamentUrl } from "../redux/actions";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { tournamentApi } from "../utils/tournamentApi";
import dayjs from "dayjs";

const TournamentDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTournamentData = async () => {
      if (id) {
        try {
          setLoading(true);
          const details = await tournamentApi.getTournamentDetails(id);
          setTournament(details?.data);
          console.log("[v0] Loaded tournament details:", details);
        } catch (err) {
          console.error("Failed to fetch tournament details:", err);
          setError("Failed to load tournament details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTournamentData();
  }, [id]);

  const handleGenerateLink = async () => {
    if (!tournament?.id) return;
    try {
      const shareUrl = `/view/${tournament.id}`;
      const fullUrl = `${window.location.origin}${shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setToast("Link copied to clipboard!");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = `${window.location.origin}/view/${tournament.id}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setToast("Link copied to clipboard!");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddEntries = () => {
    navigate(`/player-entry/${tournament?.id}`);
  };

  const handleViewBracket = () => {
    navigate(`/bracket/${tournament?.id}`);
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <p>Loading tournament...</p>
      </div>
    );
  }

  if (!tournament || error) {
    return <Navigate to="/tournaments" />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#059669";
      case "in-progress":
        return "#d97706";
      case "ended":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: isMobile ? "10px" : "20px",
    fontFamily: "Inter, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    marginBottom: "32px",
    padding: isMobile ? "16px" : "24px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    gap: isMobile ? "12px" : "0",
  };

  const backBtnStyle = {
    padding: isMobile ? "6px 12px" : "8px 16px",
    fontSize: isMobile ? "12px" : "14px",
    fontWeight: "500",
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: isMobile ? "0" : "16px",
    transition: "all 0.2s ease",
  };

  const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: isMobile ? "20px" : "32px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const buttonStyle = {
    padding: isMobile ? "10px 16px" : "12px 20px",
    fontSize: isMobile ? "14px" : "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginRight: isMobile ? "0" : "12px",
    marginBottom: isMobile ? "12px" : "0",
    width: isMobile ? "100%" : "auto",
  };

  const primaryBtnStyle = {
    ...buttonStyle,
    background: "#3b82f6",
    color: "white",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  };

  const secondaryBtnStyle = {
    ...buttonStyle,
    background: "#10b981",
    color: "white",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  };

  const outlineBtnStyle = {
    ...buttonStyle,
    background: "transparent",
    color: "#6b7280",
    border: "2px solid #e5e7eb",
  };

  const toastStyle = {
    position: "fixed",
    top: "20px",
    left: isMobile ? "50%" : "100px",
    transform: isMobile ? "translateX(-50%)" : "none",
    background: "#10b981",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: 1000,
    opacity: toast ? 1 : 0,
    transition: "opacity 0.3s ease",
    textAlign: "center",
    maxWidth: isMobile ? "90%" : "auto",
  };

  return (
    <div style={containerStyle}>
      {/* Toast Notification */}
      {toast && <div style={toastStyle}>{toast}</div>}

      <div style={headerStyle}>
        <button
          style={backBtnStyle}
          onClick={() => navigate("/tournaments")}
          onMouseEnter={(e) => {
            e.target.style.background = "#d1d5db";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#e5e7eb";
          }}
        >
          ← Back to Tournaments
        </button>
        <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "700", color: "#111827", margin: 0 }}>Tournament Details</h1>
      </div>

      <div style={cardStyle}>
        <div
          style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-start", marginBottom: "24px", gap: isMobile ? "16px" : "0" }}
        >
          <div>
            <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
              🏆 {tournament.name}
            </h2>
            <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#6b7280", margin: 0 }}>
              {tournament.type} • {tournament.format}
            </p>
          </div>
          <div
            style={{
              padding: isMobile ? "10px 14px" : "12px 16px",
              background: "#f3f4f6",
              borderRadius: "8px",
              fontSize: isMobile ? "14px" : "16px",
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
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isMobile ? "28px" : "32px", fontWeight: "700", color: "#3b82f6" }}>{tournament.entries?.length || 0}</div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>Players</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isMobile ? "28px" : "32px", fontWeight: "700", color: "#10b981" }}>{dayjs(tournament.created_on).format('MM-DD-YYYY')}</div>
            <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>Created</div>
          </div>
          {tournament.winner && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", color: "#dc2626" }}>🏆 {tournament.winner}</div>
              <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>Winner</div>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}>
          <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
            Tournament Actions
          </h3>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", gap: "12px" }}>
            <button
              style={primaryBtnStyle}
              onClick={handleAddEntries}
              onMouseEnter={(e) => {
                e.target.style.background = "#2563eb";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#3b82f6";
                e.target.style.transform = "translateY(0)";
              }}
            >
              👥 Add/Manage Entries
            </button>

            <button
              style={secondaryBtnStyle}
              onClick={handleViewBracket}
              onMouseEnter={(e) => {
                e.target.style.background = "#059669";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#10b981";
                e.target.style.transform = "translateY(0)";
              }}
            >
              🏆 {isAdmin ? "Update Bracket" : "View Bracket"}
            </button>

            <button
              style={outlineBtnStyle}
              onClick={handleGenerateLink}
              onMouseEnter={(e) => {
                e.target.style.background = "#f3f4f6";
                e.target.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "#e5e7eb";
              }}
            >
              🔗 Generate Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;