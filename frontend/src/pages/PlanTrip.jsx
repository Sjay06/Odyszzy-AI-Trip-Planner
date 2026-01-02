// src/pages/PlanTrip.jsx
import React, { useState } from "react";
import { planTrip } from "../api/apiClient";
import { auth } from "../firebase";

// Normalize activity day numbers to start at 1 and be consecutive
function normalizeActivityDays(activities) {
  if (!Array.isArray(activities) || activities.length === 0) return activities;
  const usedDays = Array.from(
    new Set(
      activities
        .map((a) => a.day)
        .filter((d) => d != null && d !== 0)
    )
  ).sort((a, b) => a - b);
  if (usedDays.length === 0) return activities;
  const dayMap = new Map();
  usedDays.forEach((origDay, idx) => {
    dayMap.set(origDay, idx + 1); // 1,2,3,...
  });
  return activities.map((a) => {
    const original = a.day;
    const normalized =
      original != null && dayMap.has(original)
        ? dayMap.get(original)
        : original;
    return { ...a, day: normalized };
  });
}

const PlanTrip = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("You must be logged in to plan a trip.");
        setLoading(false);
        return;
      }

      const { data } = await planTrip({
        destination,
        days: Number(days),
        userId,
      });

      setResult(data.itinerary); // backend sends { success, itinerary, tripId }
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to generate itinerary"
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizedActivities = normalizeActivityDays(result?.activities);

  return (
    <main className="page">
      <section className="page-header">
        <h1>Quick Trip Itinerary</h1>
        <p>Generate a simple AI itinerary for your destination and days.</p>
      </section>

      <section className="page-content">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Destination
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </label>

          <label>
            Days
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Planning..." : "Generate Itinerary"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>Itinerary – {destination}</h2>

            {/* High-level summary */}
            <section className="mt-3 text-sm text-slate-100 space-y-1">
              <p>
                <span className="font-semibold">Trip length</span>: {days} days
              </p>
              {result.transportKm != null && (
                <p>
                  <span className="font-semibold">Approx. local travel</span>:{" "}
                  {result.transportKm} km
                </p>
              )}
            </section>

            {/* Hotels */}
            {Array.isArray(result.hotels) && result.hotels.length > 0 && (
              <section className="mt-5 text-sm text-slate-100">
                <h3>Hotels</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.hotels.map((h, i) => (
                    <li key={i}>
                      <span className="font-semibold">{h.name}</span> ·{" "}
                      {h.pricePerNight?.toLocaleString()} per night ·{" "}
                      {h.nights} nights
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Day-wise activities */}
            {Array.isArray(normalizedActivities) &&
              normalizedActivities.length > 0 && (
                <section className="mt-5 text-sm text-slate-100">
                  <h3>Day-wise activities</h3>
                  <div className="mt-2 space-y-2">
                    {Array.from(
                      new Set(
                        normalizedActivities
                          .map((a) => a.day)
                          .filter((d) => d != null)
                      )
                    )
                      .sort((a, b) => a - b)
                      .map((day) => (
                        <div key={day}>
                          <p className="font-semibold mb-1">Day {day}</p>
                          <ul className="list-disc list-inside space-y-1">
                            {normalizedActivities
                              .filter((a) => a.day === day)
                              .map((a, idx) => (
                                <li key={idx}>
                                  {a.name}
                                  {a.price
                                    ? ` · ${a.price.toLocaleString()}`
                                    : ""}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </section>
              )}
          </div>
        )}
      </section>
    </main>
  );
};

export default PlanTrip;
