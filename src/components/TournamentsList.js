import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTournament, selectTournament, setTournaments, setLoading, setError, clearError } from "../redux/actions";
import { Navigate, useNavigate } from "react-router-dom";
import { tournamentApi } from "../utils/tournamentApi";

const TournamentsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  // Ensure tournaments is always an array
  const tournaments = useSelector((state) => Array.isArray(state.tournaments) ? state.tournaments : []);
  const loading = useSelector((state) => state.app?.loading || false);
  const error = useSelector((state) => state.app?.error || null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tournamentName, setTournamentName] = useState("");
  const [competitionType, setCompetitionType] = useState("Pool (Billiards)");
  const [competitionFormat, setCompetitionFormat] = useState("Knockout");

  const competitionTypes = ["Pool (Billiards)", "Darts", "Cars", "Bikes"];
  const competitionFormats = ["Knockout", "Round Robin"];

  useEffect(() => {
      fetchTournaments();
  }, []);

  // Transform API data to match component expectations
  const transformTournamentData = (apiTournament) => {
    return {
      id: apiTournament.id,
      name: apiTournament.name,
      type: apiTournament.tournament_type || competitionType, // Use tournament_type from API or default
      format: competitionFormat, // You might want to add this field to your API
      status: apiTournament.status,
      players: 0, // You'll need to get this from players/entries API
      playerCount: 0, // Same as above
      createdDate: new Date(apiTournament.created_on).toLocaleDateString(),
      createdAt: apiTournament.created_on,
      description: apiTournament.description,
      maxPlayers: apiTournament.max_players,
      entryFee: apiTournament.entry_fee,
      prizePool: apiTournament.prize_pool,
      shareUrl: apiTournament.share_url,
      createdBy: apiTournament.created_by_username,
      // Add any other fields your components need
    };
  };

  const fetchTournaments = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const tournamentsData = await tournamentApi.getAllTournaments();
      const rawTournaments = tournamentsData.data || [];
      
      // Transform the data to match component expectations
      const formattedTournaments = rawTournaments.map(transformTournamentData);
      
      dispatch(setTournaments(formattedTournaments));
    } catch (err) {
      dispatch(setError("Failed to fetch tournaments"));
      console.error("Error fetching tournaments:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreateTournament = async () => {
    if (tournamentName.trim()) {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        const tournamentData = {
          name: tournamentName.trim(),
          type: competitionType,
          format: competitionFormat,
        };

        // Create tournament on backend
        const newTournament = await tournamentApi.createTournament(tournamentData);

        // Transform and update Redux state
        const transformedTournament = transformTournamentData(newTournament);
        dispatch(createTournament(transformedTournament));

        setTournamentName("");
        setShowCreateForm(false);

        // Refresh tournaments list
        await fetchTournaments();
      } catch (err) {
        dispatch(setError("Failed to create tournament"));
        console.error("Error creating tournament:", err);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const handleTournamentClick = async (tournament) => {
    try {
      dispatch(setLoading(true));
      
      // First, select the tournament in Redux so TournamentDetails can access it
      dispatch(selectTournament(tournament));
      
      // Try to fetch more detailed tournament data
      try {
        const tournamentDetails = await tournamentApi.getTournamentDetails(tournament.id);
        if (tournamentDetails && tournamentDetails.data) {
          const transformedDetails = transformTournamentData(tournamentDetails.data);
          dispatch(selectTournament(transformedDetails));
        }
      } catch (detailsErr) {
        console.log("Could not fetch tournament details, using list data:", detailsErr);
        // Continue with the tournament data we have
      }
      
      navigate(`/tournament-details/${tournament.id}`);
    } catch (err) {
      console.error("Error handling tournament click:", err);
      // Still navigate even if there's an error
      dispatch(selectTournament(tournament));
      navigate(`/tournament-details/${tournament.id}`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "finished":
        return "#059669";
      case "in-progress":
      case "active":
        return "#d97706";
      case "ended":
        return "#dc2626";
      case "draft":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "finished":
        return "✅";
      case "in-progress":
      case "active":
        return "⏳";
      case "ended":
        return "🏆";
      case "draft":
        return "📝";
      default:
        return "📋";
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const containerStyle = {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    padding: "24px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  };

  const buttonStyle = {
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    disabled: loading,
  };

  const createBtnStyle = {
    ...buttonStyle,
    background: loading ? "#9ca3af" : "#3b82f6",
    color: "white",
    boxShadow: loading ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)",
    cursor: loading ? "not-allowed" : "pointer",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  };

  const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

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
  };

  const formStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "500px",
    margin: "20px",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🏆 Tournament Dashboard</h1>
        <button
          style={createBtnStyle}
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "translateY(0)";
            }
          }}
        >
          {loading ? "Loading..." : "➕ Create Tournament"}
        </button>
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
          <button
            onClick={() => dispatch(clearError())}
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
          Loading tournaments...
        </div>
      )}

      {!loading && (!Array.isArray(tournaments) || tournaments.length === 0) && (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "20px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ color: "#6b7280", marginBottom: "10px" }}>No tournaments found</h3>
          <p style={{ color: "#9ca3af" }}>Create your first tournament to get started!</p>
        </div>
      )}

      <div style={gridStyle}>
        {Array.isArray(tournaments) &&
          tournaments.map((tournament) => (
            <div
              key={tournament.id}
              style={cardStyle}
              onClick={() => handleTournamentClick(tournament)}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
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
                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: 0 }}>
                  {tournament.name}
                </h3>
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
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  👥 {tournament.players || tournament.playerCount || 0} players
                </span>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  📅 {tournament.createdDate}
                </span>
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
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: loading ? 0.6 : 1,
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
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "white",
                  opacity: loading ? 0.6 : 1,
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
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "white",
                  opacity: loading ? 0.6 : 1,
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
                onClick={() => {
                  setShowCreateForm(false);
                  dispatch(clearError());
                }}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  background: "#e5e7eb",
                  color: "#374151",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                disabled={!tournamentName.trim() || loading}
                style={{
                  ...buttonStyle,
                  background: tournamentName.trim() && !loading ? "#3b82f6" : "#d1d5db",
                  color: "white",
                  cursor: tournamentName.trim() && !loading ? "pointer" : "not-allowed",
                }}
              >
                {loading ? "Creating..." : "Create Tournament"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsList;