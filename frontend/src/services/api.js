import axios from 'axios';

const LOCAL_IP = '192.168.1.6'; // DETECTED MACHINE IP FOR PHYSICAL DEVICE
const API_URL = `http://${LOCAL_IP}:5000/api`;

const api = axios.create({
  baseURL: API_URL
});

export const addOrder = async (userId, foodItem) => {
  try {
    const res = await api.post('/add-order', { userId, foodItem });
    return res.data;
  } catch (e) {
    console.error('API addOrder failed', e);
    return null;
  }
};

export const getHeatmap = async (userId) => {
  try {
    const res = await api.get(`/get-heatmap?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getHeatmap failed', e);
    return null;
  }
};

export const getRiskScore = async (userId) => {
  try {
    const res = await api.get(`/get-risk-score?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getRiskScore failed', e);
    return 0;
  }
};

export const getProfile = async (userId) => {
  try {
    const res = await api.get(`/get-profile?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getProfile failed', e);
    return null;
  }
};

export const linkAccount = async (userId, appName) => {
  try {
    const res = await api.post('/link-account', { userId, appName });
    return res.data;
  } catch (e) {
    console.error('API linkAccount failed', e);
    return null;
  }
};

export const getBehavioralInsights = async (userId) => {
  try {
    const res = await api.get(`/get-behavioral-insights?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getBehavioralInsights failed', e);
    return null;
  }
};

export const getHomeData = async (userId) => {
  try {
    const res = await api.get(`/get-home-data?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getHomeData failed', e);
    return null;
  }
};

export const getAnalytics = async (userId) => {
  try {
    const res = await api.get(`/get-analytics?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getAnalytics failed', e);
    return null;
  }
};

export const getGoals = async (userId) => {
  try {
    const res = await api.get(`/get-goals?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getGoals failed', e);
    return null;
  }
};

export const aiChat = async (message) => {
  try {
    const res = await api.post('/ai-chat', { message });
    return res.data;
  } catch (e) {
    console.error('API aiChat failed', e);
    return null;
  }
};

export const getCommunity = async (userId) => {
  try {
    const res = await api.get(`/get-community?userId=${userId}`);
    return res.data;
  } catch (e) {
    console.error('API getCommunity failed', e);
    return null;
  }
};

export const getAllFood = async () => {
  try {
    const res = await api.get('/get-all-food');
    return res.data;
  } catch (e) {
    console.error('API getAllFood failed', e);
    return [];
  }
};

export const createGoal = async (userId, goalTitle) => {
  try {
    const res = await api.post('/create-goal', { userId, goalTitle });
    return res.data;
  } catch (e) {
    console.error('API createGoal failed', e);
    return null;
  }
};
