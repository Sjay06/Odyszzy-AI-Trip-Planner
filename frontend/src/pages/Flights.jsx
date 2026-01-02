// frontend/src/pages/Flights.jsx
import React, { useState } from "react";
import { getRealFlightOptions } from "../api/apiClient";
import FlightOptionsCard from "../components/FlightOptionsCard";
import { auth } from "../firebase";

export default function Flights() {
  const [origin, setOrigin] = useState("MAA");   // Chennai
  const [destination, setDestination] = useState("DXB"); // Dubai
  const [date, setDate] = useState("");          // YYYY-MM-DD
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flights, setFlights] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFlights(null);
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      const payload = { origin, destination, date, userId };
      console.log("DEBUG frontend payload:", payload);

      const res = await getRealFlightOptions(payload);
      setFlights(res.data.flights);
    } catch (err) {
      console.error("Flights.jsx error:", err);
      setError(
        err?.response?.data?.error || "Failed to fetch flight options."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Flight Finder & Baggage Constraints</h1>
        <p>Compare airline options, prices and baggage for your date.</p>
      </section>

      <section className="page-content">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            From (IATA, e.g. MAA)
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
          </label>

          <label>
            To (IATA, e.g. DXB)
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </label>

          <label>
            Flight date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)} // YYYY-MM-DD
              required
            />
          </label>

          <label>
            Trip budget (₹, optional)
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Show flight options"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {flights && flights.totalFlights > 0 && (
          <FlightOptionsCard
            flightData={{ ...flights, searchDate: date }}
            budget={budget}
          />
        )}

        {flights && flights.totalFlights === 0 && (
          <p>No flights found for this route/date.</p>
        )}
      </section>
    </main>
  );
}
