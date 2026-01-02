// src/components/WorkflowDiagram.jsx
import React from "react";

const steps = [
  {
    title: "1. User Inputs",
    body: "Destination, dates, budget, preferences, and nationality."
  },
  {
    title: "2. Travel Planner Agent",
    body: "Builds a day‑wise itinerary, activities, and routing for your trip."
  },
  {
    title: "3. Hotel & Flight Agents",
    body: "Suggests hotels & flights with realistic pricing, cabin options, and airline combinations that match your constraints."
  },
  {
    title: "4. Visa Checker Agent",
    body: "Summarizes visa eligibility, required documents, fees, and timelines."
  },
  {
    title: "5. Packing List Agent",
    body: "Generates a packing list using culture cues, baggage rules, and destination weather for your travel dates."
  },
  {
    title: "6. Cost Optimization Agent",
    body: "Recalculates total trip cost and finds cheaper but reasonable options."
  },
  {
    title: "7. “Travel on My Budget” Agent",
    body: "Dynamically reshapes the itinerary based on your daily spending limit, switching to cheaper flights, stays, or activities, and surfacing alerts when you exceed constraints."
  },
  {
    title: "8. Weather Agent",
    body: "Checks daily forecasts (up to 16 days ahead) for each stop so your itinerary and packing list are aligned with expected conditions."
  },
  {
    title: "9. City Review Insights Agent",
    body: "Scrapes recent travel blogs and reviews about your chosen city and uses AI to summarize what people love, common complaints, and practical tips."
  },
  {
    title: "10. Final AI Itinerary",
    body: "Produces an optimized, cost‑aware, weather‑informed, and ready‑to‑book trip plan you can export or refine further."
  }
];

const WorkflowDiagram = () => {
  return (
    <section className="workflow-section">
      <h2 className="workflow-title">How the Autonomous AI Travel Agent Works</h2>
      <p className="workflow-subtitle">
        Your inputs flow through a network of specialized AI agents that collaborate to design,
        optimize, and personalize your trip.
      </p>

      <div className="workflow-grid">
        {steps.map((step) => (
          <div
            key={step.title}
            className={
              "workflow-card" +
              (step.title.startsWith("7.") ? " workflow-card-accent" : "")
            }
          >
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkflowDiagram;
