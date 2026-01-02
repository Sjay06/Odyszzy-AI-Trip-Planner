// backend/src/agents/TravelAgentOrchestrator.js

import itineraryAgent from "./ItineraryAgent.js";
import budgetAgent from "./BudgetAgent.js";
import placesAgent from "./PlacesAgent.js";
import budgetConstraintAgent from "./BudgetConstraintAgent.js";
import hotelAgent from "./HotelAgent.js";
import activityAgent from "./ActivityAgent.js";
import flightAgent from "./FlightAgent.js";
import visaAgent from "./VisaAgent.js";
import packingListAgent from "./PackingListAgent.js";
import costEstimator from "../utils/costEstimator.js";

// helper: compute costs from an itinerary object
function computeItineraryCosts(itinerary) {
  if (!itinerary || typeof itinerary !== "object") {
    return { hotels: 0, activities: 0, transport: 0, total: 0 };
  }

  const hotelCost = costEstimator.estimateHotelCost(itinerary.hotels || []);
  const activityCost = costEstimator.estimateActivityCost(
    itinerary.activities || []
  );
  const transportCost = costEstimator.estimateTransportCost(
    itinerary.transportKm || 0
  );

  const total = hotelCost + activityCost + transportCost;

  return {
    hotels: hotelCost,
    activities: activityCost,
    transport: transportCost,
    total,
  };
}

// Coordinates all agents to create comprehensive travel plans.
export default class TravelAgentOrchestrator {
  constructor() {
    this.agents = {
      itinerary: itineraryAgent,
      budget: budgetAgent,
      places: placesAgent,
      budgetConstraint: budgetConstraintAgent,
      hotel: hotelAgent,
      activity: activityAgent,
      flight: flightAgent,
      visa: visaAgent,
      packing: packingListAgent,
    };
  }

  async callAgent(agentName, ...args) {
    const agent = this.agents[agentName];
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    return await agent(...args);
  }

  /**
   * destination: string
   * days: number
   * budget: number | null
   * nationality: string | null
   * tripType, startDate, endDate, gender, preferences: from meta
   */
  async createComprehensivePlan(
    destination,
    days,
    budget = null,
    nationality = null,
    tripType = "leisure",
    startDate = null,
    endDate = null,
    gender = "unspecified",
    preferences = []
  ) {
    try {
      console.log(
        "Creating comprehensive plan for",
        destination,
        "days",
        days,
        "budget",
        budget
      );

      // Step 1: Flights via Gemini FlightAgent
      const origin = "Mumbai"; // later can come from frontend
      const flightInfo = await this.callAgent("flight", destination, origin);

      // Step 2: Places – day-wise plan, cheap facilities, etc.
      const placesData = await this.callAgent("places", destination, days);

      // Step 3: Budget constrained recommendations (generic)
      const budgetRecommendations = await this.callAgent(
        "budgetConstraint",
        destination,
        days,
        budget || 0
      );

      // Step 4: AI-generated base itinerary (with hotels & activities)
      const aiItinerary = await this.callAgent("itinerary", destination, days);

      // Step 5: Optimize itinerary with budget if given
      let optimizedItinerary = null;
      let optimizationResult = null;

      if (budget) {
        optimizationResult = await this.callAgent(
          "budget",
          aiItinerary,
          budget
        );
        optimizedItinerary = optimizationResult.optimizedItinerary;
      } else {
        optimizedItinerary = aiItinerary;
      }

      // Step 6: Visa info if nationality is provided
      let visaInfo = null;
      if (nationality) {
        visaInfo = await this.callAgent("visa", nationality, destination);
      }

      // Step 7: Packing list – expects a single object
      const packingList = await this.callAgent("packing", {
        destination,
        startDate,
        endDate,
        tripType,
        preferences,
      });

      // Step 8: Calculate final costs based on hotels/activities/transport + flights

      // Costs from optimized itinerary (what is actually recommended)
      const optimizedCosts = computeItineraryCosts(optimizedItinerary);

      // flight cost: prefer numeric price
      const flightCost =
        typeof flightInfo?.price === "number"
          ? flightInfo.price
          : typeof flightInfo?.averagePrice === "number"
          ? flightInfo.averagePrice
          : typeof flightInfo?.cheapestFlight?.price === "number"
          ? flightInfo.cheapestFlight.price
          : 0;

      const totalWithFlight = optimizedCosts.total + flightCost;

      const budgetAnalysis = {
        flights: flightCost,
        hotels: optimizedCosts.hotels,
        activities: optimizedCosts.activities,
        transport: optimizedCosts.transport,
        total: totalWithFlight,
      };

      // Step 9: Compile response
      return {
        destination,
        days,
        budget: budget ?? null,

        flights: flightInfo, // includes flight quotes / details

        itinerary: {
          base: aiItinerary,
          optimized: optimizedItinerary,
        },

        places: placesData,

        budgetAnalysis, // <- used by frontend Costs section

        recommendations: budgetRecommendations.recommendations,
        dayWisePlan: placesData.dayWisePlan,
        cheapFacilities: placesData.cheapFacilities,
        warnings: optimizationResult?.warnings || [],
        visa: visaInfo,
        packingList,

        summary: this.generateSummary(
          destination,
          days,
          budget,
          budgetAnalysis,
          placesData,
          visaInfo
        ),
      };
    } catch (err) {
      console.error("Error in TravelAgentOrchestrator:", err);
      throw new Error(`Failed to create travel plan: ${err.message}`);
    }
  }

  generateSummary(destination, days, budget, costs, placesData, visaInfo) {
    const totalPlaces = placesData.placesToVisit?.length || 0;
    const mustSeePlaces =
      placesData.placesToVisit?.filter((p) => p.priority === "must-see")
        .length || 0;

    const visaLine = visaInfo
      ? `Visa requirement: ${visaInfo.visaRequired} (${visaInfo.visaType}).`
      : "Visa information not provided.";

    const budgetLine = budget
      ? `Total estimated cost is ₹${costs.total} vs your budget ₹${budget} (this ${
          costs.total <= budget ? "fits within" : "exceeds"
        } your budget).`
      : `Total estimated cost is ₹${costs.total}.`;

    return {
      overview: `Your ${days}-day trip to ${destination} includes ${totalPlaces} places to visit, with ${mustSeePlaces} must-see attractions.`,
      costSummary: budgetLine,
      visaSummary: visaLine,
      highlights: placesData.placesToVisit
        ?.filter((p) => p.priority === "must-see")
        .slice(0, 3)
        .map((p) => p.name),
      tips: [
        "Book accommodations in advance for better rates.",
        "Use public transport to save on travel costs.",
        "Try local street food for authentic experiences.",
        "Visit free attractions to maximize your budget.",
      ],
    };
  }
}
