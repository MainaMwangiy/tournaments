import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL, headers: { Authorization: `Bearer ${localStorage.getItem("rabbit_farm_token")}` },
});

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
    return Promise.reject(error);
  }
);

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
    const response = await apiClient.get(`${API_BASE_URL}/tournaments/details/${id}`);
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
  saveBracket: async (tournamentId, bracket, players) => {
    const response = await apiClient.post(`${API_BASE_URL}/tournaments/${tournamentId}/bracket`, { bracket, players });
    return response.data;
  },

  // New: for adding player from PlayerEntry
  addPlayer: async (tournamentId, playerData) => {
    const response = await apiClient.post(`${API_BASE_URL}/tournaments/${tournamentId}/player`, playerData);
    return response.data;
  },
};