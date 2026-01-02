// src/pages/BudgetPlan.jsx
import React, { useState } from "react";
import { planWithBudget } from "../api/apiClient";
import { auth } from "../firebase";

const BudgetPlan = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(150000);
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
      const { data } = await planWithBudget({
        destination,
        days: Number(days),
        budget: Number(budget),
        userId,
      });
      setResult(data.trip); // trip includes initialCost, finalCost, etc.
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to plan with budget"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Budget Optimiser</h1>
        <p>Optimize your trip against a total budget in INR.</p>
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

          <label>
            Total Budget (INR)
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Optimizing..." : "Optimize Trip"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>Optimized Trip</h2>

            {/* High-level info */}
            <section className="mt-4 text-sm text-slate-100 space-y-1">
              <p>
                <span className="font-semibold">Destination:</span>{" "}
                {result.destination}
              </p>
              <p>
                <span className="font-semibold">Days:</span>{" "}
                {result.days}
              </p>
              <p>
                <span className="font-semibold">Budget:</span>{" "}
                ₹{result.budget?.toLocaleString()}
              </p>
            </section>

            {/* Base hotels */}
            {result.baseItinerary?.hotels && (
              <section className="mt-5 text-sm text-slate-100">
                <h3>Base hotels</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.baseItinerary.hotels.map((h, i) => (
                    <li key={i}>
                      <span className="font-semibold">{h.name}</span> – ₹
                      {h.pricePerNight?.toLocaleString()} per night ·{" "}
                      {h.nights} nights
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Base activities */}
            {result.baseItinerary?.activities && (
              <section className="mt-4 text-sm text-slate-100">
                <h3>Base activities</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.baseItinerary.activities.map((a, i) => (
                    <li key={i}>
                      <span className="font-semibold">{a.name}</span> – ₹
                      {a.price?.toLocaleString()}{" "}
                      {a.day != null && `(day ${a.day})`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Optimized hotels */}
            {result.optimizedItinerary?.hotels && (
              <section className="mt-5 text-sm text-slate-100">
                <h3>Optimized hotels</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.optimizedItinerary.hotels.map((h, i) => (
                    <li key={i}>
                      <span className="font-semibold">{h.name}</span> – ₹
                      {h.pricePerNight?.toLocaleString()} per night ·{" "}
                      {h.nights} nights
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Optimized activities */}
            {result.optimizedItinerary?.activities && (
              <section className="mt-4 text-sm text-slate-100">
                <h3>Optimized activities</h3>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.optimizedItinerary.activities.map((a, i) => (
                    <li key={i}>
                      <span className="font-semibold">{a.name}</span> – ₹
                      {a.price?.toLocaleString()}{" "}
                      {a.day != null && `(day ${a.day})`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Cost summary */}
            <section className="mt-5 text-sm text-slate-100 space-y-1">
  <h3>Cost summary</h3>

  {/* Base / initial costs from base itinerary */}
  {result.baseCostBreakdown && (
    <>
      <p>
        <span className="font-semibold">Base hotel cost:</span>{" "}
        ₹{result.baseCostBreakdown.hotels.toLocaleString()}
      </p>
      <p>
        <span className="font-semibold">Base activities cost:</span>{" "}
        ₹{result.baseCostBreakdown.activities.toLocaleString()}
      </p>
      <p>
        <span className="font-semibold">Base total cost:</span>{" "}
        ₹{result.baseCostBreakdown.total.toLocaleString()}
      </p>
    </>
  )}

  {/* Optimized / final costs */}
  {result.optimizedCostBreakdown && (
    <>
      <p className="mt-2">
        <span className="font-semibold">Optimized hotel cost:</span>{" "}
        ₹{result.optimizedCostBreakdown.hotels.toLocaleString()}
      </p>
      <p>
        <span className="font-semibold">Optimized activities cost:</span>{" "}
        ₹{result.optimizedCostBreakdown.activities.toLocaleString()}
      </p>
      <p>
        <span className="font-semibold">Final optimized cost:</span>{" "}
        ₹{result.optimizedCostBreakdown.total.toLocaleString()}
      </p>
    </>
  )}

  {/* Fallback for old fields if breakdown is missing */}
  {!result.optimizedCostBreakdown && result.finalCost != null && (
    <p>
      <span className="font-semibold">Final optimized cost:</span>{" "}
      ₹{result.finalCost.toLocaleString()}
    </p>
  )}

  {result.warnings && result.warnings.length > 0 && (
    <div className="mt-2">
      <p className="font-semibold mb-1">Warnings</p>
      <ul className="list-disc list-inside space-y-1">
        {result.warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  )}
</section>
          </div>
        )}
      </section>
    </main>
  );
};

export default BudgetPlan;
