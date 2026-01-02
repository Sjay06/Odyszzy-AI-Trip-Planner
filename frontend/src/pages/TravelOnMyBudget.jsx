// src/pages/TravelOnMyBudget.jsx
import React, { useState } from "react";
import { travelOnMyBudget } from "../api/apiClient";
import { auth } from "../firebase";

const TravelOnMyBudget = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState(3000);

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
      const { data } = await travelOnMyBudget({
        destination,
        days: Number(days),
        dailyBudgetLimit: Number(dailyBudgetLimit),
        userId,
      });

      setResult(data.budgetPlan || data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to generate budget-aware itinerary"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Daily Budget Constrained Planner</h1>
        <p>Optimize your trip against a daily budget in INR.</p>
      </section>

      <section className="page-content">
        {/* FORM – same structure as BudgetPlan */}
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

          <label>
            Daily Budget (INR)
            <input
              type="number"
              min="1"
              value={dailyBudgetLimit}
              onChange={(e) => setDailyBudgetLimit(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Optimizing..." : "Generate Budget-Aware Plan"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {/* RESULT – uses new shape */}
        {result && (
          <div className="result">
            <h2>Optimized Daily-Budget Trip</h2>

            {/* High-level info */}
            <section className="mt-4 text-sm text-slate-100 space-y-1">
              <p>
                <span className="font-semibold">Destination:</span>{" "}
                {result.destination}
              </p>
              <p>
                <span className="font-semibold">Days:</span> {result.days}
              </p>
              <p>
                <span className="font-semibold">Daily budget limit:</span>{" "}
                ₹{result.dailyBudgetLimit?.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Total budget used:</span>{" "}
                ₹{result.totals.total?.toLocaleString()}
              </p>
            </section>

            {/* Hotels */}
            {Array.isArray(result.hotels) && result.hotels.length > 0 && (
  <section className="mt-5 text-sm text-slate-100">
    <h3>Available hotels in your budget</h3>
    <ul className="list-disc list-inside space-y-1 mt-1">
      {result.hotels.slice(0, 3).map((h, i) => (
        <li key={i}>
          <span className="font-semibold">{h.name}</span> – ₹
          {h.pricePerNight?.toLocaleString()} per night · {h.nights} nights
          {h.area ? ` · ${h.area}` : ""}
          {h.type ? ` · ${h.type}` : ""}
        </li>
      ))}
    </ul>
    {result.hotels.length > 3 && (
      <p className="mt-1 text-xs text-slate-300">
        Showing top 3 budget‑friendly options out of {result.hotels.length}.
      </p>
    )}
  </section>
)}

            {/* Activities */}
            {Array.isArray(result.activities) &&
              result.activities.length > 0 && (
                <section className="mt-4 text-sm text-slate-100">
                  <h3>Activities within your budget</h3>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {result.activities.map((a, i) => (
                      <li key={i}>
                        <span className="font-semibold">{a.name}</span> – ₹
                        {a.price?.toLocaleString()}{" "}
                        {a.day != null && `(day ${a.day})`}
                        {a.category ? ` · ${a.category}` : ""}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            {/* Cost analysis */}
            <section className="mt-5 text-sm text-slate-100 space-y-1">
              <h3>Cost analysis</h3>
              <p>
                <span className="font-semibold">Hotels:</span>{" "}
                ₹{result.totals.hotels?.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Activities:</span>{" "}
                ₹{result.totals.activities?.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Transport:</span>{" "}
                ₹{result.totals.transport?.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Total trip cost:</span>{" "}
                ₹{result.totals.total?.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Daily average:</span>{" "}
                ₹{result.totals.dailyAverage?.toLocaleString()} (your limit: ₹
                {result.dailyBudgetLimit?.toLocaleString()})
              </p>

              {result.status === "within-budget" ? (
                <p className="mt-2">
                  <span className="font-semibold">Status:</span> This plan fits
                  within your daily budget.
                </p>
              ) : (
                <p className="mt-2">
                  <span className="font-semibold">Status:</span> This plan still
                  exceeds your daily budget. Review the recommendations below.
                </p>
              )}
            </section>

            {/* Recommendations */}
            {Array.isArray(result.recommendations) &&
              result.recommendations.length > 0 && (
                <section className="mt-4 text-sm text-slate-100">
                  <h3>Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {result.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </section>
              )}
          </div>
        )}
      </section>
    </main>
  );
};

export default TravelOnMyBudget;
