import axios from "axios";

export const amadeusClient = axios.create({
  baseURL: "https://api.amadeus.com",
  headers: { Authorization: `Bearer ${process.env.AMADEUS_KEY}` }
});
