// src/pages/ComprehensivePlan.jsx
import React, { useState } from "react";
import { comprehensivePlan } from "../api/apiClient";
import { auth } from "../firebase";

const ComprehensivePlan = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(60000);
  const [nationality, setNationality] = useState("Indian");
  const [tripType, setTripType] = useState("leisure");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [preferences, setPreferences] = useState("");
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
      const payload = {
        destination,
        days: Number(days),
        budget: budget ? Number(budget) : undefined,
        nationality,
        tripType,
        startDate: startDate || null,
        endDate: endDate || null,
        gender: "unspecified",
        preferences: preferences
          ? preferences.split(",").map((s) => s.trim())
          : [],
        userId,
      };

      const { data } = await comprehensivePlan(payload);
      setResult(data.plan);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to create comprehensive plan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Comprehensive Travel Plan</h1>
        <p>
          Run the full multi-agent pipeline: flights, hotels, places, budget,
          visa, and packing—generated in a single call.
        </p>
      </section>

      <section className="page-content">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
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
              Budget (INR, optional)
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </label>

            <label>
              Nationality
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </label>

            <label>
              Trip Type
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
              >
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
                <option value="adventure">Adventure</option>
                <option value="beach">Beach</option>
                <option value="family">Family</option>
              </select>
            </label>

            <label>
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <label className="wide">
              Preferences (comma-separated)
              <input
                type="text"
                placeholder="vegetarian, loves museums, avoids nightlife"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Generating Plan..." : "Generate Full Plan"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>Comprehensive Plan (summary view)</h2>

            {/* SUMMARY */}
            {result.summary && (
              <section className="mt-4 space-y-2 text-sm text-slate-100">
                <h3>Summary</h3>
                <p>{result.summary.overview}</p>
                <p>{result.summary.costSummary}</p>

                {Array.isArray(result.summary.highlights) &&
                  result.summary.highlights.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">Must‑see highlights</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.summary.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {Array.isArray(result.summary.tips) &&
                  result.summary.tips.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">Travel tips</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.summary.tips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </section>
            )}

            {/* VISA */}
            <section className="mt-6 text-sm text-slate-100">
              <h3>Visa</h3>
              {result.visa ? (
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Visa required:</span>{" "}
                    {result.visa.visaRequired}
                  </p>
                  <p>
                    <span className="font-semibold">Visa type:</span>{" "}
                    {result.visa.visaType}
                  </p>
                  <p>
                    <span className="font-semibold">Processing time:</span>{" "}
                    {result.visa.processingTime}
                  </p>
                  <p>
                    <span className="font-semibold">Fees:</span>{" "}
                    {result.visa.fees}
                  </p>

                  {Array.isArray(result.visa.documents) && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">Required documents</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.visa.documents.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.visa.summary && (
                    <p className="mt-2">{result.visa.summary}</p>
                  )}

                  {result.visa.disclaimer && (
                    <p className="mt-1 text-xs text-slate-400">
                      {result.visa.disclaimer}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">Visa information not provided.</p>
              )}
            </section>

            {/* FLIGHT BOOKING TIPS ONLY (no detailed options) */}
            {result.flights && Array.isArray(result.flights.tips) && (
              <section className="mt-6 text-sm text-slate-100">
                <h3>Flight booking tips</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.flights.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* HOTEL OPTIONS */}
            {result.itinerary?.base?.hotels &&
              result.itinerary.base.hotels.length > 0 && (
                <section className="mt-6 text-sm text-slate-100">
                  <h3>Hotel options</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.itinerary.base.hotels.slice(0, 3).map((h, i) => (
                      <li key={i}>
                        <strong>{h.name}</strong> – ₹
                        {h.pricePerNight?.toLocaleString()} per night ·{" "}
                        {h.nights} nights
                        {h.area ? ` · ${h.area}` : ""}
                        {h.category ? ` · ${h.category}` : ""}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            {/* PACKING LIST */}
{result.packingList && (
  <section className="mt-6 text-sm text-slate-100">
    <h3>Packing List</h3>

    {/* Essentials */}
    {Array.isArray(result.packingList.essentials) &&
      result.packingList.essentials.length > 0 && (
        <>
          <h4>Essentials</h4>
          <ul className="list-disc list-inside space-y-1">
            {result.packingList.essentials.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}

    {/* Clothing */}
    {Array.isArray(result.packingList.clothing) &&
      result.packingList.clothing.length > 0 && (
        <>
          <h4>Clothing</h4>
          <ul className="list-disc list-inside space-y-1">
            {result.packingList.clothing.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}

    {/* Electronics */}
    {Array.isArray(result.packingList.electronics) &&
      result.packingList.electronics.length > 0 && (
        <>
          <h4>Electronics</h4>
          <ul className="list-disc list-inside space-y-1">
            {result.packingList.electronics.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}

    {/* Documents */}
    {Array.isArray(result.packingList.documents) &&
      result.packingList.documents.length > 0 && (
        <>
          <h4>Documents</h4>
          <ul className="list-disc list-inside space-y-1">
            {result.packingList.documents.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}

    {/* Extras */}
    {Array.isArray(result.packingList.extras) &&
      result.packingList.extras.length > 0 && (
        <>
          <h4>Extras</h4>
          <ul className="list-disc list-inside space-y-1">
            {result.packingList.extras.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}
  </section>
)}

{/* COST BREAKDOWN */}
{(() => {
  const costs = result.budgetAnalysis || {};
  const flights = costs.flights ?? 0;
  const hotels = costs.hotels ?? 0;
  const activities = costs.activities ?? 0;
  const transport = costs.transport ?? 0;
  const total =
    costs.total ?? flights + hotels + activities + transport;

  return (
    <div className="costs-block">
      <div>
        Total estimated cost: ₹{total.toLocaleString()}
      </div>
      {flights > 0 && (
        <div>Flights: ₹{flights.toLocaleString()}</div>
      )}
      {hotels > 0 && (
        <div>Hotels: ₹{hotels.toLocaleString()}</div>
      )}
      {activities > 0 && (
        <div>Activities: ₹{activities.toLocaleString()}</div>
      )}
      {transport > 0 && (
        <div>Transport: ₹{transport.toLocaleString()}</div>
      )}
    </div>
  );
})()}
          </div>
        )}
      </section>
    </main>
  );
};

export default ComprehensivePlan;
