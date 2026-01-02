// backend/src/agents/WeatherAgent.js
import axios from "axios";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

async function geocodeCity(city) {
  const res = await axios.get(GEOCODE_URL, {
    params: { name: city, count: 1 },
  });

  const loc = res.data?.results?.[0];
  if (!loc) {
    throw new Error(`Could not find location for city: ${city}`);
  }

  return {
    name: loc.name,
    country: loc.country,
    latitude: loc.latitude,
    longitude: loc.longitude,
    timezone: loc.timezone,
  };
}

export default async function weatherAgent(city, date) {
  if (!city || !date) {
    throw new Error("City and date are required");
  }

  const location = await geocodeCity(city);

  const res = await axios.get(WEATHER_URL, {
    params: {
      latitude: location.latitude,
      longitude: location.longitude,
      start_date: date,          // YYYY-MM-DD
      end_date: date,
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "windspeed_10m_max",
        "weathercode",
      ].join(","),
      timezone: location.timezone,
    },
  });

  const daily = res.data?.daily;
  if (!daily || !daily.time || !daily.time.length) {
    throw new Error("No weather data available for that date");
  }

  const i = 0;

  return {
    city: location.name,
    country: location.country,
    date: daily.time[i],
    timezone: location.timezone,
    maxTemp: daily.temperature_2m_max[i],
    minTemp: daily.temperature_2m_min[i],
    precipitationMm: daily.precipitation_sum[i],
    maxWindSpeed: daily.windspeed_10m_max[i],
    weatherCode: daily.weathercode[i],
  };
}
