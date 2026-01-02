// frontend/src/components/FlightOptionsCard.jsx
import React, { useState } from "react";

export default function FlightOptionsCard({ flightData, budget }) {
  const { origin, destination, searchDate, allFlights, averagePrice, totalFlights } = flightData;
  const [showAll, setShowAll] = useState(false);

  // ✅ Parse duration PT18H5M → {hours: 18, minutes: 5}
  const parseDuration = (ptDuration) => {
    if (!ptDuration) return { hours: 0, minutes: 0 };
    const hours = parseInt(ptDuration.match(/PT(\d+)H/)?.[1] || '0');
    const minutes = parseInt(ptDuration.match(/(\d+)M/)?.[1] || '0');
    return { hours, minutes };
  };

  // ✅ Calculate arrival = departure + duration
  const calculateArrival = (departureIso, durationIso) => {
    try {
      const depDate = new Date(departureIso);
      const { hours, minutes } = parseDuration(durationIso);
      
      // Add duration to departure
      const arrivalDate = new Date(depDate.getTime() + 
        (hours * 60 * 60 * 1000) + (minutes * 60 * 1000));
      
      return arrivalDate.toISOString();
    } catch {
      return departureIso; // Fallback
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "—";
    try {
      const date = new Date(isoString);
      const day = date.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' });
      const time = date.toLocaleTimeString("en-IN", { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${day}, ${time}`;
    } catch {
      return isoString.slice(-8);
    }
  };

  const formatDurationDisplay = (ptDuration) => {
    const { hours, minutes } = parseDuration(ptDuration);
    return `${hours}h ${minutes}m`;
  };

  const displayFlights = allFlights?.slice(0, showAll ? allFlights.length : 8) || [];

  return (
    <div className="flights-dashboard">
      <div className="stats-bar">
        <div className="stat">
          <div className="stat-number">{totalFlights}</div>
          <div className="stat-label">Flights Found</div>
        </div>
        <div className="stat highlight">
          <div className="stat-price">₹{averagePrice?.toLocaleString()}</div>
          <div className="stat-label">Avg Price</div>
        </div>
        <div className="route-badge">{origin} → {destination} • {searchDate}</div>
      </div>

      <div className="flights-table-container">
        <div className="table-header">
          <h3>✈️ Best Flight Options</h3>
          <div className="table-legend">
            <span className="legend-item">👜 Cabin</span>
            <span className="legend-item">🧳 Checked</span>
          </div>
        </div>

        <div className="flights-table">
          <div className="table-head">
            <div className="col airline">Airline</div>
            <div className="col timing">Timing</div>
            <div className="col duration">Duration</div>
            <div className="col baggage">Baggage</div>
            <div className="col price">Price</div>
          </div>

          {displayFlights.map((f, idx) => {
            const bag = f.baggage || {};
            const isOverBudget = budget && f.price > Number(budget);
            
            // ✅ Calculate CORRECT arrival time
            const calculatedArrival = calculateArrival(f.departure, f.duration);
            
            return (
              <div key={f.id || idx} className={`flight-card ${isOverBudget ? 'over-budget' : ''}`}>
                <div className="col airline">
                  <div className="airline-logo">✈️</div>
                  <div>
                    <div className="airline-name">{f.airlineName}</div>
                    <div className="flight-code">{f.carrierCode}{f.flightNumber}</div>
                  </div>
                </div>

                <div className="col timing">
                  <div className="time-depart">{formatDateTime(f.departure)}</div>
                  <div className="flight-arrow">→</div>
                  <div className="time-arrive">{formatDateTime(calculatedArrival)}</div>
                </div>

                <div className="col duration">
                  <div className="duration-time">{formatDurationDisplay(f.duration)}</div>
                  <div className={`stop-badge ${f.stops === 0 ? 'nonstop' : ''}`}>
                    {f.stops === 0 ? 'Non-stop' : `${f.stops} stops`}
                  </div>
                </div>

                <div className="col baggage">
                  <div className="baggage-cabin">👜 {bag.carryOn || '7kg'}</div>
                  <div className="baggage-checked">🧳 {bag.checked || '23kg'}</div>
                </div>

                <div className="col price">
                  <div className="price-main">₹{Math.round(f.price || 0).toLocaleString()}</div>
                  {isOverBudget && <div className="budget-alert">💰 Over budget</div>}
                  <button className="select-btn">Select</button>
                </div>
              </div>
            );
          })}

          {allFlights?.length > 8 && !showAll && (
            <div className="show-more">
              <button onClick={() => setShowAll(true)} className="show-more-btn">
                +{allFlights.length - 8} more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
