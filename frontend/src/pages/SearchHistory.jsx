// src/pages/SearchHistory.jsx
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { fetchSearchHistory } from "../api/apiClient";

const Card = ({ title, subtitle, count, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        about-card about-card-primary
        relative flex flex-col justify-between
        cursor-pointer
      "
      onClick={() => setOpen(!open)}
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        <p className="mt-1 text-[11px] text-slate-300">{subtitle}</p>
      </div>

      <div className="mt-3 text-[11px] text-slate-300">
        <div>
          {count} {count === 1 ? "item" : "items"}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="mt-1 inline-flex items-center rounded-full bg-slate-100/90 px-3 py-[2px] text-[11px] font-medium text-slate-900 hover:bg-white"
        >
          {open ? "Hide all ▾" : "View all ▸"}
        </button>
      </div>

      {open && (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-md bg-slate-900/60 px-3 py-2 text-[11px] text-slate-100">
          {children}
        </div>
      )}
    </div>
  );
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString() : "Unknown time";

const HistoryRow = ({ inputLabel, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <li className="list-none">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="mr-1">•</span>
          <span className="font-medium">{inputLabel}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="inline-flex items-center rounded-full border border-slate-500/70 px-2.5 py-[1px] text-[10px] text-slate-100 hover:bg-slate-700"
        >
          {open ? "Hide result ▾" : "View result ▸"}
        </button>
      </div>

      {open && (
        <div className="mt-2 pl-5 text-[11px] text-slate-200 space-y-2">
          {children}
        </div>
      )}

      <hr className="mt-3 border-slate-700/80" />
    </li>
  );
};

const SearchHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setError("You must be logged in to view search history.");
          setLoading(false);
          return;
        }
        const { data } = await fetchSearchHistory(userId);
        setHistory(data.history);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Failed to load search history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="page">
      <section className="page-header">
        <h1>Search History</h1>
        <p>
          View all your past searches grouped by feature. Each row shows your
          inputs; expand to see the full AI result.
        </p>
      </section>

      <section className="page-content">
        {loading && <p>Loading history...</p>}
        {error && <p className="error">{error}</p>}

        {history && (
          <div className="about-grid">
            {/* Plan Trip Itineraries */}
            <Card
              title="Plan Trip Itineraries"
              subtitle="Quick AI‑generated day‑wise plans you explored."
              count={history.quickTrips.length}
            >
              <ul className="space-y-4">
                {history.quickTrips.map((item) => (
                  <HistoryRow
                    key={item._id}
                    inputLabel={`${item.destination} · ${item.days} days · ${formatDate(
                      item.createdAt
                    )}`}
                  >
                    {item.itinerary && (
                      <>
                        {item.itinerary.summary && (
                          <p>Summary: {item.itinerary.summary}</p>
                        )}

                        {item.itinerary.transportKm != null && (
                          <p>
                            Approx. local travel: {item.itinerary.transportKm} km
                          </p>
                        )}

                        {Array.isArray(item.itinerary.hotels) &&
                          item.itinerary.hotels.length > 0 && (
                            <div>
                              <p className="font-semibold">Hotels</p>
                              <ul className="list-disc list-inside space-y-1 mt-1">
                                {item.itinerary.hotels.map((h, i) => (
                                  <li key={i}>
                                    {h.name} · {h.pricePerNight} per night ·{" "}
                                    {h.nights} nights
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {Array.isArray(item.itinerary.activities) &&
                          item.itinerary.activities.length > 0 && (
                            <div>
                              <p className="font-semibold">
                                Day‑wise activities
                              </p>
                              <div className="mt-1 space-y-1">
                                {Array.from(
                                  new Set(
                                    item.itinerary.activities
                                      .map((a) => a.day)
                                      .filter((d) => d != null)
                                  )
                                )
                                  .sort((a, b) => a - b)
                                  .map((day) => (
                                    <div key={day}>
                                      <p className="mt-1 font-medium">
                                        Day {day}
                                      </p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {item.itinerary.activities
                                          .filter((a) => a.day === day)
                                          .map((a, idx) => (
                                            <li key={idx}>
                                              {a.name}
                                              {a.time ? ` · ${a.time}` : ""}
                                              {a.price ? ` · ${a.price}` : ""}
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                  </HistoryRow>
                ))}
              </ul>
            </Card>

            {/* Budget Optimiser */}
<Card
  title="Budget Optimiser"
  subtitle="Trips where you re‑planned for a fixed total budget."
  count={history.budgetTrips.length}
>
  <ul className="space-y-4">
    {history.budgetTrips.map((item) => {
      const opt = item.optimizedItinerary || {};

      return (
        <HistoryRow
          key={item._id}
          inputLabel={`${item.destination} · ${item.days} days · Budget ₹${
            item.budget
          } · ${formatDate(item.createdAt)}`}
        >
          <div className="space-y-3">
            {item.initialCost != null && (
              <p>Base plan cost: ₹{item.initialCost}</p>
            )}
            {item.finalCost != null && (
              <p>Optimized final cost: ₹{item.finalCost}</p>
            )}

            {/* Optimized hotels */}
            {Array.isArray(opt.hotels) && opt.hotels.length > 0 && (
              <div>
                <p className="font-semibold">Optimized hotels</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {opt.hotels.map((h, idx) => (
                    <li key={idx}>
                      {h.name}
                      {h.nights != null && ` · ${h.nights} night(s)`}
                      {h.pricePerNight != null &&
                        ` · ₹${h.pricePerNight} per night`}
                      {h.totalCost != null && ` · Total ₹${h.totalCost}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optimized key activities */}
            {Array.isArray(opt.activities) && opt.activities.length > 0 && (
              <div>
                <p className="font-semibold">Optimized key activities</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {opt.activities.map((a, idx) => (
                    <li key={idx}>
                      {a.name}
                      {a.price != null && ` · ₹${a.price}`}
                      {a.day != null && ` · Day ${a.day}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.warnings && (
              <p className="mt-1 text-[10px] text-amber-300">
                Warnings:{" "}
                {Array.isArray(item.warnings)
                  ? item.warnings.join("; ")
                  : String(item.warnings)}
              </p>
            )}
          </div>
        </HistoryRow>
      );
    })}
  </ul>
</Card>


            {/* Comprehensive Full Plan */}
<Card
  title="Comprehensive Full Plan"
  subtitle="End-to-end itineraries with flights, visa, packing, and costs."
  count={history.comprehensiveTrips.length}
>
  <ul className="space-y-4">
    {history.comprehensiveTrips.map((trip) => {
      const base = trip.baseItinerary || {};
      const comp = trip.optimizedItinerary || {}; // same structure used in ComprehensivePlan.jsx
      const hotels = comp.hotels || base.hotels || [];
      const flights = comp.flights || [];
      const visa = comp.visa || {};
      const packing = comp.packingList || {};
      const summary = comp.summary || {};
      const totals = comp.totals || {};

      return (
        <HistoryRow
          key={trip._id}
          inputLabel={`${trip.destination} · ${trip.days} days · ${formatDate(
            trip.createdAt
          )}`}
        >
          <div className="space-y-4 text-sm">
            {/* Summary text (top of your Milan screenshot) */}
            {(summary.title || summary.overview || summary.mustSee) && (
              <section>
                <p className="font-semibold">Summary</p>
                <div className="text-xs mt-1 whitespace-pre-line">
                  {summary.overview}
                </div>

                {Array.isArray(summary.mustSee) &&
                  summary.mustSee.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-xs">
                        Must-see highlights
                      </p>
                      <ul className="list-disc list-inside text-xs">
                        {summary.mustSee.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {Array.isArray(summary.tips) && summary.tips.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-xs">Travel tips</p>
                    <ul className="list-disc list-inside text-xs">
                      {summary.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Visa section (like your Milan visa screenshot) */}
            {Object.keys(visa).length > 0 && (
              <section>
                <p className="font-semibold">Visa</p>
                <p className="text-xs mt-1">
                  Visa required: {String(visa.visaRequired)}
                  <br />
                  Visa type: {visa.visaType || "—"}
                  <br />
                  Processing time: {visa.processingTime || "—"}
                  <br />
                  Fees: {visa.fees || "—"}
                </p>

                {Array.isArray(visa.requiredDocuments) &&
                  visa.requiredDocuments.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-xs">
                        Required documents
                      </p>
                      <ul className="list-disc list-inside text-xs">
                        {visa.requiredDocuments.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </section>
            )}

            {/* Flight tips / options (matches “Flight booking tips”) */}
            {(Array.isArray(comp.flightTips) && comp.flightTips.length > 0) ||
            (Array.isArray(flights) && flights.length > 0) ? (
              <section>
                <p className="font-semibold">Flight booking tips</p>
                {Array.isArray(comp.flightTips) &&
                  comp.flightTips.length > 0 && (
                    <ul className="list-disc list-inside text-xs mt-1">
                      {comp.flightTips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  )}

                {Array.isArray(flights) && flights.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-xs">
                      Sample flight options
                    </p>
                    <ul className="list-disc list-inside text-xs">
                      {flights.slice(0, 3).map((f, i) => (
                        <li key={i}>
                          {f.airline || "Flight"} · {f.origin} →{" "}
                          {f.destination} ·{" "}
                          {f.departureTime || f.departure || ""} · ₹
                          {f.price?.toLocaleString?.() || f.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ) : null}

            {/* Hotels (what you already see) */}
            {hotels.length > 0 && (
              <section>
                <p className="font-semibold">Hotel options</p>
                <ul className="list-disc list-inside text-xs mt-1">
                  {hotels.map((h, i) => (
                    <li key={i}>
                      {h.name} – ₹
                      {h.pricePerNight?.toLocaleString?.() ||
                        h.pricePerNight}{" "}
                      per night · {h.nights} nights
                      {h.area ? ` · ${h.area}` : ""}
                      {h.type || h.category ? ` · ${h.type || h.category}` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Packing list (Essentials, Clothing, Electronics, Documents, Extras) */}
            {Object.keys(packing).length > 0 && (
              <section>
                <p className="font-semibold">Packing List</p>
                <div className="grid grid-cols-2 gap-3 text-xs mt-1">
                  {["essentials", "clothing", "electronics", "documents", "extras"].map(
                    (key) =>
                      Array.isArray(packing[key]) &&
                      packing[key].length > 0 && (
                        <div key={key}>
                          <p className="font-semibold">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </p>
                          <ul className="list-disc list-inside">
                            {packing[key].map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      )
                  )}
                </div>
              </section>
            )}

            {/* Cost breakdown (bottom of your screenshot) */}
            {(totals.total ||
              totals.flights ||
              totals.hotels ||
              totals.activities ||
              totals.transport) && (
              <section>
                <p className="font-semibold">Cost breakdown</p>
                <p className="text-xs mt-1">
                  {totals.total != null && (
                    <>
                      Total estimated cost: ₹
                      {totals.total.toLocaleString()}
                      <br />
                    </>
                  )}
                  {totals.flights != null && (
                    <>
                      Flights: ₹{totals.flights.toLocaleString()}
                      <br />
                    </>
                  )}
                  {totals.hotels != null && (
                    <>
                      Hotels: ₹{totals.hotels.toLocaleString()}
                      <br />
                    </>
                  )}
                  {totals.activities != null && (
                    <>
                      Activities: ₹{totals.activities.toLocaleString()}
                      <br />
                    </>
                  )}
                  {totals.transport != null && (
                    <>
                      Transport: ₹{totals.transport.toLocaleString()}
                    </>
                  )}
                </p>
              </section>
            )}
          </div>
        </HistoryRow>
      );
    })}
  </ul>
</Card>




            {/* Daily Budget */}
<Card
  title="Daily Budget"
  subtitle="Dynamic plans constrained by daily spending limit."
  count={history.dailyBudgetTrips.length}
>
  <ul className="space-y-4">
    {history.dailyBudgetTrips.map((item) => {
      const hotels = item.optimizedItinerary?.hotels || [];
      const activities = item.optimizedItinerary?.activities || [];
      const totals = item.optimizedItinerary?.totals || {};
      const dailyLimit =
        typeof item.budget === "number" && item.days
          ? item.budget / item.days
          : null;

      return (
        <HistoryRow
          key={item._id}
          inputLabel={`${item.destination} · ${item.days} days · ${formatDate(
            item.createdAt
          )}`}
        >
          <div className="space-y-3 text-sm">
            {/* High‑level numbers */}
            <p>
              {dailyLimit != null && (
                <>
                  <span className="font-semibold">Daily budget limit:</span>{" "}
                  ₹{dailyLimit.toLocaleString()}
                  <br />
                </>
              )}
              {item.finalCost != null && (
                <>
                  <span className="font-semibold">Total spend in plan:</span>{" "}
                  ₹{item.finalCost.toLocaleString()}
                </>
              )}
            </p>

            {/* Hotels */}
            <div>
              <p className="font-semibold">Available hotels in your budget</p>
              {hotels.length === 0 ? (
                <p className="text-xs mt-1">No hotels stored.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
                  {hotels.map((h, idx) => (
                    <li key={idx}>
                      {h.name} – ₹{h.pricePerNight?.toLocaleString()} per night
                      {" · "}
                      {h.nights} nights
                      {h.area ? ` · ${h.area}` : ""}
                      {h.type ? ` · ${h.type}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Activities */}
            <div>
              <p className="font-semibold">Activities within your budget</p>
              {activities.length === 0 ? (
                <p className="text-xs mt-1">No activities stored.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
                  {activities.map((a, idx) => (
                    <li key={idx}>
                      {a.name} – ₹{a.price?.toLocaleString()}{" "}
                      {a.day != null && `(day ${a.day})`}
                      {a.category ? ` · ${a.category}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cost analysis */}
            <div>
              <p className="font-semibold">Cost analysis</p>
              <p className="text-xs mt-1">
                Hotels: ₹
                {(
                  totals.hotels ??
                  hotels.reduce(
                    (sum, h) =>
                      sum + (h.pricePerNight || 0) * (h.nights || 0),
                    0
                  )
                ).toLocaleString()}
                <br />
                Activities: ₹
                {(
                  totals.activities ??
                  activities.reduce((sum, a) => sum + (a.price || 0), 0)
                ).toLocaleString()}
                <br />
                Transport: ₹{(totals.transport ?? 0).toLocaleString()}
                <br />
                Total trip cost: ₹
                {(item.finalCost ?? 0).toLocaleString()}
                {dailyLimit != null && (
                  <>
                    <br />
                    Daily average: ₹
                    {Math.round(
                      (item.finalCost ?? 0) / item.days
                    ).toLocaleString()}{" "}
                    (your limit: ₹{dailyLimit.toLocaleString()})
                  </>
                )}
              </p>
            </div>

            {/* Recommendations */}
            {Array.isArray(item.warnings) && item.warnings.length > 0 && (
              <div>
                <p className="font-semibold">Recommendations</p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
                  {item.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </HistoryRow>
      );
    })}
  </ul>
</Card>


            {/* Visa Checker */}
<Card
  title="Visa Checker"
  subtitle="Visa eligibility and document checks you ran."
  count={history.visaQueries.length}
>
  <ul className="space-y-4">
    {history.visaQueries.map((item) => {
      const visa = item.visa || {};

      return (
        <HistoryRow
          key={item._id}
          inputLabel={`${item.nationality} → ${
            item.destinationCountry
          } · ${formatDate(item.createdAt)}`}
        >
          {visa && (
            <div className="space-y-2">
              {/* High‑level summary */}
              {visa.summary && <p>Summary: {visa.summary}</p>}

              {/* Core visa details if present */}
              {(visa.visaType ||
                visa.validity ||
                visa.maxStayDays != null ||
                visa.processingTime ||
                visa.feeRange) && (
                <div>
                  <p className="font-semibold">Visa details</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {visa.visaType && <li>Type: {visa.visaType}</li>}
                    {visa.validity && <li>Validity: {visa.validity}</li>}
                    {visa.maxStayDays != null && (
                      <li>Maximum stay: {visa.maxStayDays} days</li>
                    )}
                    {visa.processingTime && (
                      <li>Processing time: {visa.processingTime}</li>
                    )}
                    {visa.feeRange && <li>Approx. fee: {visa.feeRange}</li>}
                  </ul>
                </div>
              )}

              {/* Flat requirements array (your current field) */}
              {Array.isArray(visa.requirements) && visa.requirements.length > 0 && (
                <div>
                  <p className="font-semibold">Requirements</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {visa.requirements.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Structured requirements object (if VisaAgent returns it) */}
              {visa.requirementsDetail &&
                typeof visa.requirementsDetail === "object" && (
                  <div>
                    <p className="font-semibold">Detailed requirements</p>
                    <div className="mt-1 space-y-1">
                      {Object.entries(visa.requirementsDetail).map(
                        ([section, items]) =>
                          Array.isArray(items) && items.length > 0 ? (
                            <div key={section}>
                              <p className="font-medium capitalize">
                                {section.replace(/([A-Z])/g, " $1")}
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                {items.map((text, idx) => (
                                  <li key={idx}>{text}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null
                      )}
                    </div>
                  </div>
                )}

              {/* Conditions / restrictions */}
              {Array.isArray(visa.conditions) && visa.conditions.length > 0 && (
                <div>
                  <p className="font-semibold">Conditions</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {visa.conditions.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(visa.restrictions) &&
                visa.restrictions.length > 0 && (
                  <div>
                    <p className="font-semibold">Restrictions</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {visa.restrictions.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Extra notes / tips */}
              {Array.isArray(visa.notes) && visa.notes.length > 0 && (
                <div>
                  <p className="font-semibold">Additional notes</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {visa.notes.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </HistoryRow>
      );
    })}
  </ul>
</Card>


            {/* Packing Considerations */}
<Card
  title="Packing Considerations"
  subtitle="Packing lists generated for your trip dates."
  count={history.packingQueries.length}
>
  <ul className="space-y-4">
    {history.packingQueries.map((item) => {
      const list = item.packingList || {};

      return (
        <HistoryRow
          key={item._id}
          inputLabel={`${item.destination} · ${item.startDate} → ${
            item.endDate
          } · ${formatDate(item.createdAt)}`}
        >
          {list && (
            <div className="space-y-3">
              {/* Optional summary / intro */}
              {list.summary && <p>Summary: {list.summary}</p>}

              {/* Essentials */}
              {Array.isArray(list.essentialItems) &&
                list.essentialItems.length > 0 && (
                  <div>
                    <p className="font-semibold">Essentials</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {list.essentialItems.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Clothing */}
              {Array.isArray(list.clothing) && list.clothing.length > 0 && (
                <div>
                  <p className="font-semibold">Clothing</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {list.clothing.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Electronics */}
              {Array.isArray(list.electronics) &&
                list.electronics.length > 0 && (
                  <div>
                    <p className="font-semibold">Electronics</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {list.electronics.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Documents */}
              {Array.isArray(list.documents) && list.documents.length > 0 && (
                <div>
                  <p className="font-semibold">Documents</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {list.documents.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extras / misc */}
              {Array.isArray(list.extras) && list.extras.length > 0 && (
                <div>
                  <p className="font-semibold">Extras</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {list.extras.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Any other dynamic sections your agent may add,
                  e.g. toiletries, winterGear, beachGear, etc. */}
              {list.sections &&
                typeof list.sections === "object" && (
                  <div className="space-y-2 mt-1">
                    {Object.entries(list.sections).map(
                      ([sectionName, items]) =>
                        Array.isArray(items) && items.length > 0 ? (
                          <div key={sectionName}>
                            <p className="font-semibold capitalize">
                              {sectionName.replace(/([A-Z])/g, " $1")}
                            </p>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                              {items.map((p, idx) => (
                                <li key={idx}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null
                    )}
                  </div>
                )}
            </div>
          )}
        </HistoryRow>
      );
    })}
  </ul>
</Card>


            {/* Flights & Baggage – cheapest + all flights, safe even if flights[] missing */}
            <Card
              title="Flights & Baggage"
              subtitle="Real flight searches with dates and routes."
              count={history.flightSearches.length}
            >
              <ul className="space-y-4">
                {history.flightSearches.map((item) => {
                  const r = item.result || {};
                  const cheapest = r.cheapestFlight || {};
                  const raw = cheapest.rawOffer || {};
                  const cheapestItin =
                    Array.isArray(raw.itineraries) && raw.itineraries[0]
                      ? raw.itineraries[0]
                      : null;

                  // Safe default: always an array
                  const flights = Array.isArray(r.flights) ? r.flights : [];

                  return (
                    <HistoryRow
                      key={item._id}
                      inputLabel={`${item.origin} → ${item.destination} · ${
                        item.date
                      } · ${formatDate(item.createdAt)}`}
                    >
                      {/* Cheapest flight summary */}
                      {cheapestItin && (
                        <div className="space-y-2">
                          <p>
                            <span className="font-semibold">
                              Cheapest flight
                            </span>
                            : {r.originIata || item.origin} →{" "}
                            {r.destIata || item.destination} · duration{" "}
                            {cheapestItin.duration}
                          </p>

                          <div>
                            <p className="font-semibold">Segments</p>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                              {Array.isArray(cheapestItin.segments) &&
                                cheapestItin.segments.map((seg, idx) => (
                                  <li key={idx}>
                                    {seg.departure?.iataCode} →{" "}
                                    {seg.arrival?.iataCode} ·{" "}
                                    {seg.carrierCode} {seg.number} · depart{" "}
                                    {seg.departure?.at} · arrive{" "}
                                    {seg.arrival?.at}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* All options (simplified cards) */}
                      {flights.length > 0 ? (
                        <div className="space-y-2 mt-3">
                          <p className="font-semibold">
                            All options (Total: {r.totalFlights || flights.length}
                            )
                          </p>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {flights.map((f, idx) => (
                              <li key={idx}>
                                {f.airline && <span>{f.airline} </span>}
                                {f.flightNumber && `(${f.flightNumber}) · `}
                                {f.origin} → {f.destination} ·{" "}
                                {f.departureLocalTime} → {f.arrivalLocalTime} ·
                                duration {f.duration} ·{" "}
                                {typeof f.stops === "number"
                                  ? f.stops === 0
                                    ? "non‑stop"
                                    : `${f.stops} stop(s)`
                                  : ""}
                                {" · "}
                                Cabin: {f.cabin} · Checked:{" "}
                                {f.checkedBaggage} · Extra:{" "}
                                {f.extraBaggageFee} · ₹{f.price} INR
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        !cheapestItin && (
                          <p>No flights were stored for this search.</p>
                        )
                      )}
                    </HistoryRow>
                  );
                })}
              </ul>
            </Card>

            {/* Weather Look‑up */}
            <Card
              title="Weather Look‑up"
              subtitle="Forecast checks you made for trip planning."
              count={history.weatherLogs.length}
            >
              <ul className="space-y-4">
                {history.weatherLogs.map((item) => (
                  <HistoryRow
                    key={item._id}
                    inputLabel={`${item.city} · ${item.date} · ${formatDate(
                      item.createdAt
                    )}`}
                  >
                    {item.weather && (
                      <div className="space-y-2">
                        {item.weather.city &&
                          item.weather.country &&
                          item.weather.date && (
                            <p>
                              <span className="font-semibold">Location</span>:{" "}
                              {item.weather.city}, {item.weather.country} on{" "}
                              {item.weather.date}
                            </p>
                          )}

                        {item.weather.minTemp != null &&
                          item.weather.maxTemp != null && (
                            <p>
                              <span className="font-semibold">
                                Temperature
                              </span>
                              :{" "}
                              {item.weather.minTemp.toFixed
                                ? item.weather.minTemp.toFixed(1)
                                : item.weather.minTemp}
                              {" – "}
                              {item.weather.maxTemp.toFixed
                                ? item.weather.maxTemp.toFixed(1)
                                : item.weather.maxTemp}
                              {" °C"}
                            </p>
                          )}

                        {item.weather.precipitationMm != null && (
                          <p>
                            <span className="font-semibold">
                              Precipitation
                            </span>
                            : {item.weather.precipitationMm} mm
                          </p>
                        )}

                        {item.weather.maxWindSpeed != null && (
                          <p>
                            <span className="font-semibold">
                              Max wind
                            </span>
                            : {item.weather.maxWindSpeed} km/h
                          </p>
                        )}

                        {item.weather.timezone && (
                          <p>
                            <span className="font-semibold">Timezone</span>:{" "}
                            {item.weather.timezone}
                          </p>
                        )}

                        {item.weather.summary && (
                          <p>
                            <span className="font-semibold">Summary</span>:{" "}
                            {item.weather.summary}
                          </p>
                        )}
                      </div>
                    )}
                  </HistoryRow>
                ))}
              </ul>
            </Card>

            {/* City Reviews */}
<Card
  title="City Reviews"
  subtitle="Blog‑based review summaries you viewed."
  count={history.cityReviews.length}
>
  <ul className="space-y-4">
    {history.cityReviews.map((item) => {
      const insights = item.insights || {};

      return (
        <HistoryRow
          key={item._id}
          inputLabel={`${item.city} · ${formatDate(item.createdAt)}`}
        >
          {insights && (
            <div className="space-y-3">
              {/* Main summary */}
              {insights.summary && <p>Summary: {insights.summary}</p>}

              {/* What people love */}
              {Array.isArray(insights.love) && insights.love.length > 0 && (
                <div>
                  <p className="font-semibold">What people love</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {insights.love.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complaints / what people dislike */}
              {Array.isArray(insights.complaints) &&
                insights.complaints.length > 0 && (
                  <div>
                    <p className="font-semibold">Complaints</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {insights.complaints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Highlights (must‑see / must‑do) */}
              {Array.isArray(insights.highlights) &&
                insights.highlights.length > 0 && (
                  <div>
                    <p className="font-semibold">Highlights</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {insights.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Warnings (safety / gotchas) */}
              {Array.isArray(insights.warnings) &&
                insights.warnings.length > 0 && (
                  <div>
                    <p className="font-semibold">Warnings</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {insights.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Practical tips */}
              {Array.isArray(insights.tips) && insights.tips.length > 0 && (
                <div>
                  <p className="font-semibold">Practical tips</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {insights.tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fallback: render ANY other array fields from insights */}
              {Object.entries(insights)
                .filter(
                  ([key, value]) =>
                    ![
                      "summary",
                      "love",
                      "complaints",
                      "highlights",
                      "warnings",
                      "tips",
                    ].includes(key) &&
                    Array.isArray(value) &&
                    value.length > 0
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="font-semibold capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {value.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </HistoryRow>
      );
    })}
  </ul>
</Card>


          </div>
        )}
      </section>
    </main>
  );
};

export default SearchHistory;
