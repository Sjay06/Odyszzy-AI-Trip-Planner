// src/pages/PackingList.jsx
import React, { useState } from "react";
import { getPackingList } from "../api/apiClient";
import { auth } from "../firebase";


const PackingList = () => {
  const [destination, setDestination] = useState("");
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
        startDate,
        endDate,
        tripType,
        preferences,
        userId,
      };

      const res = await getPackingList(payload); // axios response[file:35]
      setResult(res.data.packingList);           // { success, packingList }[file:18]
    } catch (err) {
      console.error("Packing list error:", err);
      setError(
        err?.response?.data?.error ||
          "Failed to generate packing list. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRow = (label, items) => {
    if (!items || items.length === 0) return null;

    return (
      <tr key={label}>
        <td
          style={{
            fontWeight: 600,
            verticalAlign: "top",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            width: "180px",
          }}
        >
          {label}
        </td>
        <td
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </td>
      </tr>
    );
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Packing List Considerations</h1>
        <p>Get a smart packing checklist tailored to your destination and dates.</p>
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
              required
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>

          <label className="wide">
            Special Preferences (comma-separated)
            <input
              type="text"
              placeholder="Hiking, Sight seeing, Fun activities, Vegetarian"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Packing List"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>Packing List</h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "1rem",
              }}
            >
              <tbody>
                {renderRow("Essentials", result.essentials)}
                {renderRow("Clothing", result.clothing)}
                {renderRow("Electronics", result.electronics)}
                {renderRow("Documents", result.documents)}
                {renderRow("Extras", result.extras)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default PackingList;
