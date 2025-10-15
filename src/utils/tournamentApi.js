import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_BACKEND_URL : process.env.REACT_APP_DEV_BACKEND_URL;

export const API_BASE_URL =  `${baseURL}/api/v1`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error)
  },
)

const getToken = () => {
  return Cookies.get("token") || localStorage.getItem("token")
}

export const tournamentApi = {
  // Create tournament
  createTournament: async (tournamentData) => {
    const response = await apiClient.post(`${API_BASE_URL}/tournaments/create`, tournamentData);
    return response.data;
  },

  // Get all tournaments
  getAllTournaments: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/tournaments/list`);
    return response.data;
  },

  // Get tournament details
  getTournamentDetails: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/tournaments/details/${id}`);
    return response.data;
  },

  // Get tournament by ID (public)
  getTournamentById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/tournaments/view/${id}`);
    return response.data;
  },

  // Get tournament bracket (public)
  getTournamentBracket: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/tournaments/bracket/${id}`);
    return response.data;
  },

  // Update tournament
  updateTournament: async (id, tournamentData) => {
    const response = await apiClient.put(`${API_BASE_URL}/tournaments/update/${id}`, tournamentData);
    return response.data;
  },

  // Delete tournament
  deleteTournament: async (id) => {
    const response = await apiClient.delete(`${API_BASE_URL}/tournaments/delete/${id}`);
    return response.data;
  },

  // Start tournament
  startTournament: async (id) => {
    const response = await apiClient.post(`${API_BASE_URL}/tournaments/start/${id}`);
    return response.data;
  },

  // End tournament
  endTournament: async (id) => {
    const response = await apiClient.post(`${API_BASE_URL}/tournaments/end/${id}`);
    return response.data;
  },

  // Generate tournament URL
 generateTournamentUrl: async (id) => {
    const response = await apiClient.post(`${API_BASE_URL}/tournaments/generate-url/${id}`);
    return response.data;
  },

  // Fixed: use apiClient, API_BASE_URL
  updateMatchResult: async (tournamentId, matchData) => {
    const response = await apiClient.put(`${API_BASE_URL}/tournaments/${tournamentId}/match-result`, matchData);
    return response.data;
  },

  // New: for saving bracket
  saveBracket: async (tournamentId, bracketData) => {
    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/save-bracket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(bracketData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to save bracket")
    }

    return response.json()
  },

  addPlayer: async (tournamentId, playerData) => {
    const response = await apiClient.post(`${API_BASE_URL}/tournaments/${tournamentId}/player`, playerData)
    return response.data
  },

  updatePlayer: async (tournamentId, entryId, playerData) => {
    const response = await apiClient.put(`${API_BASE_URL}/tournaments/${tournamentId}/player/${entryId}`, playerData);
    return response.data;
  },

  deletePlayer: async (tournamentId, entryId) => {
    const response = await apiClient.delete(`${API_BASE_URL}/tournaments/${tournamentId}/player/${entryId}`);
    return response.data;
  },
};