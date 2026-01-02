// src/pages/Weather.jsx
import React, { useState } from "react";
import { fetchWeather } from "../api/apiClient";
import { auth } from "../firebase";

const Weather = () => {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Calculate 16-day forecast limit
  const today = new Date(); // Current date
  const maxForecastDate = new Date(today);
  maxForecastDate.setDate(today.getDate() + 16); // Jan 9, 2026
  
  const selectedDate = date ? new Date(date) : null;
  const isBeyondForecast = selectedDate && selectedDate > maxForecastDate;
  
  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWeather(null);
    setError("");
    setLoading(true);

    try {
      // ensure YYYY-MM-DD
      const isoDate = new Date(date).toISOString().slice(0, 10);
      const userId = auth.currentUser?.uid;
      const { data } = await fetchWeather(city, isoDate, userId);
      setWeather(data.weather);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch weather information"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Weather checker</h1>
        <p>Get daily weather for any city on a specific date.</p>
      </section>

      <section className="page-content">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              City
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={today.toISOString().split('T')[0]} // Today minimum
                max={maxForecastDate.toISOString().split('T')[0]} // 16 days max
              />
            </label>
          </div>

          {/* Dynamic Disclaimer */}
          <div className={`weather-disclaimer ${isBeyondForecast ? 'warning' : 'info'} mt-4 p-4 rounded-lg`}>
            <span className="text-lg mr-2">
              {isBeyondForecast ? '⚠️' : 'ℹ️'}
            </span>
            {isBeyondForecast ? (
              <>
                <strong>Weather forecasts available up to {formatDate(maxForecastDate)}</strong><br/>
                Selected date exceeds 16-day limit. Long-term trends shown—actual weather may vary significantly.
              </>
            ) : (
              <>
                Detailed weather forecasts available up to <strong>{formatDate(maxForecastDate)}</strong> 
                (16 days ahead from today).
              </>
            )}
          </div>

          <button type="submit" disabled={loading || isBeyondForecast}>
            {loading ? "Fetching..." : "Get Weather"}
          </button>
        </form>

        {error && <p className="error mt-4">{error}</p>}

        {weather && (
          <section className="mt-6 text-sm text-slate-100">
            <h3>
              Weather in {weather.city}, {weather.country} on {weather.date}
            </h3>
            <ul className="list-disc list-inside">
              <li>
                Temperature: {weather.minTemp.toFixed(1)} –{" "}
                {weather.maxTemp.toFixed(1)} °C
              </li>
              <li>Precipitation: {weather.precipitationMm} mm</li>
              <li>Max wind speed: {weather.maxWindSpeed} km/h</li>
              <li>Timezone: {weather.timezone}</li>
            </ul>
          </section>
        )}
      </section>

      <style jsx>{`
        .weather-disclaimer.info {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          color: #1976d2;
        }
        
        .weather-disclaimer.warning {
          background: #fff3e0;
          border: 1px solid #ff9800;
          color: #e65100;
        }
      `}</style>
    </main>
  );
};

export default Weather;
