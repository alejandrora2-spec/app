import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const healthApi = {
  // Create daily log
  createLog: async (logData) => {
    const response = await axios.post(`${API}/health/log`, logData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Update daily log
  updateLog: async (date, logData) => {
    const response = await axios.put(`${API}/health/log/${date}`, logData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get logs (last 30 days by default)
  getLogs: async (limit = 30) => {
    const response = await axios.get(`${API}/health/logs?limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get log for specific date
  getLogByDate: async (date) => {
    const response = await axios.get(`${API}/health/log/${date}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get monthly analysis
  getMonthlyAnalysis: async (year, month) => {
    const response = await axios.get(`${API}/health/monthly-analysis/${year}/${month}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
