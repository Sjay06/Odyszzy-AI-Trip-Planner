import React from "react";
import FeatureCard from "../components/FeatureCard";
import WorkflowDiagram from "../components/WorkflowDiagram";

const Home = () => {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        
        <div className="hero-text">
          <h1>ODYSZZY - Vivre Le Monde!  </h1>
          <p>
    Experience AI-powered travel magic. Get personalized itineraries in seconds 
    with flights, visas, and packing perfectly planned by your intelligent travel companion.
  </p>
          <a href="#features" className="hero-cta">
            Start Planning
          </a>
        </div>

        <div className="hero-highlight">
  <h2>Plan. Optimize. Travel Smarter.</h2>
  <ul>
    <li>
      Turn a few preferences into a complete, AI-crafted itinerary that
      feels like it was designed by a human travel expert.
    </li>
    <li>
      See realistic costs before you book, with budget-aware suggestions,
      trade-offs, and automatic re-planning when prices or plans change.
    </li>
    <li>
      Let specialized agents handle the details—flights, baggage rules,
      visa checks, weather-aware packing, insightful city destination reviews, and on-trip adjustments—while
      you just choose what looks exciting.
    </li>
  </ul>
</div>

      </section>

      {/* How it works – includes Flights & Weather agents in the diagram */}
      <WorkflowDiagram />

      {/* Feature Grid */}
      <section id="features" className="features-section">
        <h2>What you can do here</h2>
        <div className="features-grid">
          <FeatureCard
            title="Quick Trip Planner"
            description="Generate a base day-wise itinerary from your destination and trip length."
            to="/plan-trip"
          />
          <FeatureCard
            title="Budget Optimiser"
            description="Plan trips that stay within a total budget using cost-aware optimization."
            to="/budget-plan"
          />
          <FeatureCard
            title="Comprehensive Travel Plan"
            description="Run the full multi-agent stack: flights, hotels, visa, weather, packing and more."
            to="/comprehensive"
          />
          <FeatureCard
            title="Daily Budget Constrained Planner"
            description="Simulate your daily spending limit and watch the AI reshape the plan."
            to="/travel-on-my-budget"
          />
          <FeatureCard
            title="Visa Checker"
            description="Check visa requirements, documents, and processing time for your nationality."
            to="/visa-checker"
          />
          <FeatureCard
            title="Packing List Considerations"
            description="Get a weather- and culture-aware packing list tailored to your trip."
            to="/packing-list"
          />
          <FeatureCard
            title="Flights & Baggage"
            description="Explore flight options, cabin classes, and baggage rules aligned with your trip."
            to="/flights"
          />
          <FeatureCard
            title="Weather Checker"
            description="See location-specific daily weather forecasts for your travel dates (up to 16 days ahead)."
            to="/weather"
          />
          <FeatureCard
            title="City Review Insights"
            description="See what recent travelers are saying about any city, summarized into pros,
            cons, and smart tips to decide if it fits your plans."
            to="/city-reviews"
          />
        </div>
      </section>
    </main>
  );
};

export default Home;
