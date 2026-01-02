// src/api/apiClient.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const planTrip = (payload) => api.post("/trip/plan", payload);
export const planWithBudget = (payload) => api.post("/trip/budget", payload);
export const comprehensivePlan = (payload) =>
  api.post("/trip/comprehensive", payload);
export const travelOnMyBudget = (payload) =>
  api.post("/trip/travel-on-my-budget", payload);
export const getVisaInfo = (payload) => api.post("/trip/visa", payload);
export const getPackingList = (payload) =>
  api.post("/trip/packing-list", payload);
export const getFlightOptions = (payload) =>
  api.post("/trip/flights", payload);
export const getRealFlightOptions = (payload) =>
  api.post("/trip/real-flights", payload);
export const fetchWeather = (city, date, userId) =>
  api.get("/trip/weather", { params: { userId, city, date } });

export const fetchCityReviews = (city, userId) =>
  api.get("/city-reviews", { params: { userId, city } });

export const fetchSearchHistory = (userId) =>
  api.get("/trip/search-history", { params: { userId } });

export default api;
