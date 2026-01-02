// src/pages/CityReviews.jsx
import React, { useState } from "react";
import { fetchCityReviews } from "../api/apiClient";
import { auth } from "../firebase";

const CityReviews = () => {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setData(null);
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      const { data } = await fetchCityReviews(city, userId);
      setData(data.insights);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to fetch recent city reviews. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>City Review Insights</h1>
        <p>
          See what recent travel blogs are saying about a city—summarized into
          pros, cons, and tips for smarter planning.
        </p>
      </section>

      <section className="page-content">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            City
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Brussels, Tokyo, Lisbon"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Get Insights"}
          </button>
        </form>

        {error && <p className="error mt-4">{error}</p>}

        {data && (
          <section className="mt-6">
            <div className="about-card about-card-primary">
              <h2>Recent vibe in {data.city}</h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                {data.summary}
              </p>
            </div>

            <div className="about-card about-card-features mt-4">
              <div className="about-features-grid">
                <div className="about-feature-pill">
                  <h3>What people love</h3>
                  <ul className="list-disc list-inside text-xs">
                    {data.love.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="about-feature-pill">
                  <h3>Common complaints</h3>
                  <ul className="list-disc list-inside text-xs">
                    {data.complaints.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="about-feature-pill">
                  <h3>Tips from recent visitors</h3>
                  <ul className="list-disc list-inside text-xs">
                    {data.tips.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
};

export default CityReviews;
