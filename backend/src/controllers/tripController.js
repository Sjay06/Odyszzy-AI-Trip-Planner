// backend/src/controllers/tripController.js
import itineraryAgent from "../agents/ItineraryAgent.js";
import budgetAgent from "../agents/BudgetAgent.js";
import dynamicBudgetAgent from "../agents/DynamicBudgetAgent.js";
import TravelAgentOrchestrator from "../agents/TravelAgentOrchestrator.js";
import Trip from "../models/Trip.js";
import flightAgent from "../agents/FlightAgent.js";
import visaAgent from "../agents/VisaAgent.js";
import flightSearchAgent from "../agents/FlightSearchAgent.js";
import packingListAgent from "../agents/PackingListAgent.js";
import { computeTotalsFromItinerary } from "../utils/itineraryCostUtils.js";
import FlightSearch from "../models/FlightSearch.js";
import QuickTrip from "../models/QuickTrip.js";
import VisaQuery from "../models/VisaQuery.js";
import PackingQuery from "../models/PackingQuery.js";
import WeatherLog from "../models/WeatherLog.js";
import CityReview from "../models/CityReview.js";

const orchestrator = new TravelAgentOrchestrator();

// Quick trip
export const planTrip = async (req, res) => {
  try {
    const { destination, days, userId } = req.body;

    if (!destination || !days || !userId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: destination and days are required" });
    }

    if (typeof days !== "number" || days < 1) {
      return res
        .status(400)
        .json({ error: "Invalid days: must be a number greater than 0" });
    }

    const itinerary = await itineraryAgent(destination, days);

    const doc = await QuickTrip.create({
      userId,
      destination,
      days,
      itinerary,
    });

    return res.json({ success: true, itinerary, tripId: doc._id });
  } catch (err) {
    console.error("Error in planTrip:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Budget-constrained planner
export const planWithBudget = async (req, res) => {
  try {
    const { destination, days, budget, userId } = req.body;

    if (!destination || !days || budget == null || !userId) {
      return res.status(400).json({
        error:
          "Missing required fields: destination, days, and budget are required"
      });
    }

    if (typeof days !== "number" || days < 1) {
      return res
        .status(400)
        .json({ error: "Invalid days: must be a number greater than 0" });
    }

    if (typeof budget !== "number" || budget < 0) {
      return res.status(400).json({
        error:
          "Invalid budget: must be a number greater than or equal to 0"
      });
    }

    const baseItinerary = await itineraryAgent(destination, days);
    const optimized = await budgetAgent(baseItinerary, budget);

    const baseCostBreakdown = computeTotalsFromItinerary(baseItinerary);
    const optimizedCostBreakdown = computeTotalsFromItinerary(
      optimized.optimizedItinerary
    );

    const tripData = await Trip.create({
      userId,
      destination,
      days,
      budget,
      type: "BUDGET_OPTIMISER",          // <<< NEW
      baseItinerary,
      optimizedItinerary: optimized.optimizedItinerary,
      finalCost: optimized.finalCost,
      initialCost: optimized.initialCost,
      warnings: optimized.warnings
    });

    return res.json({
      success: true,
      trip: {
        ...tripData.toObject(),
        baseCostBreakdown,
        optimizedCostBreakdown
      }
    });
  } catch (err) {
    console.error("Error in planWithBudget:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Comprehensive plan
export const comprehensivePlan = async (req, res) => {
  try {
    const {
      destination,
      days,
      budget,
      nationality,
      tripType,
      startDate,
      endDate,
      gender,
      preferences,
      userId,
    } = req.body;

    if (!destination || !days || !userId) {
      return res.status(400).json({
        error:
          "Missing required fields destination and days are required",
      });
    }

    if (typeof days !== "number" || days < 1) {
      return res.status(400).json({
        error: "Invalid days must be a number greater than 0",
      });
    }

    if (
      budget !== undefined &&
      (typeof budget !== "number" || budget < 0)
    ) {
      return res.status(400).json({
        error:
          "Invalid budget must be a number greater than or equal to 0",
      });
    }

    const plan = await orchestrator.createComprehensivePlan(
      destination,
      days,
      budget ?? null,
      nationality || null,
      {
        tripType: tripType || "leisure",
        startDate: startDate || null,
        endDate: endDate || null,
        gender: gender || "unspecified",
        preferences: preferences || [],
        origin: "Chennai",
      }
    );

    // Normalize summary so history can always read mustSee + tips etc.
    const rawSummary = plan.summary || {};
    const normalizedSummary = {
      overview: rawSummary.overview || null,
      costSummary: rawSummary.costSummary || null,
      // highlights from ComprehensivePlan UI are stored as mustSee for history
      mustSee: rawSummary.highlights || rawSummary.mustSee || [],
      tips: rawSummary.tips || [],
    };

    let tripData = null;
    if (budget) {
      try {
        tripData = await Trip.create({
          userId,
          destination,
          days,
          budget,
          type: "COMPREHENSIVE",
          baseItinerary: plan.itinerary.base,
          optimizedItinerary: {
            ...(plan.itinerary.optimized || {}),
            summary: normalizedSummary,
            visa: plan.visa || null,
            flights: plan.flights || null,
            packingList: plan.packingList || null,
            totals: plan.budgetAnalysis || null,
          },
          finalCost: plan.budgetAnalysis?.totalWithFlight,
          warnings: plan.warnings,
        });
      } catch (dbError) {
        console.error(
          "Database save error (non-critical):",
          dbError.message
        );
      }
    }

    return res.json({
      success: true,
      plan,
      saved: !!tripData,
      tripId: tripData?.id || null,
    });
  } catch (err) {
    console.error("Error in comprehensivePlan:", err);
    return res.status(500).json({ error: err.message });
  }
};


// Dynamic Budget – Travel on My Budget
export const travelOnMyBudget = async (req, res) => {
  try {
    const { destination, days, dailyBudgetLimit, userId } = req.body;

    if (!destination || !days || dailyBudgetLimit == null || !userId) {
      return res.status(400).json({
        error:
          "Missing required fields: destination, days, and dailyBudgetLimit are required"
      });
    }

    if (typeof days !== "number" || days < 1) {
      return res
        .status(400)
        .json({ error: "Invalid days: must be a number greater than 0" });
    }

    if (typeof dailyBudgetLimit !== "number" || dailyBudgetLimit <= 0) {
      return res.status(400).json({
        error: "Invalid dailyBudgetLimit: must be a number greater than 0"
      });
    }

    const baseItinerary = await itineraryAgent(destination, days);

    const budgetPlan = await dynamicBudgetAgent(
      destination,
      days,
      dailyBudgetLimit,
      baseItinerary
    );

    let tripData = null;
    try {
      tripData = await Trip.create({
        userId,
        destination,
        days,
        budget: dailyBudgetLimit * days,
        type: "DAILY_BUDGET",             // <<< NEW
        baseItinerary: baseItinerary,
        optimizedItinerary: {
          hotels: budgetPlan.hotels,
          activities: budgetPlan.activities,
          transportKm: budgetPlan.transport
        },
        finalCost: budgetPlan.totals.total,
        warnings:
          budgetPlan.status === "over-budget"
            ? budgetPlan.recommendations
            : []
      });
    } catch (dbError) {
      console.error("Database save error (non-critical):", dbError.message);
    }

    return res.json({
      success: true,
      budgetPlan,
      saved: !!tripData,
      tripId: tripData?.id || null
    });
  } catch (err) {
    console.error("Error in travelOnMyBudget:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Flights-only endpoint
export const getFlightOptions = async (req, res) => {
  try {
    const { origin = "Chennai", destination, date} = req.body;

    if (!destination) {
      return res
        .status(400)
        .json({ error: "Missing required field: destination" });
    }

    const flightInfo = await flightAgent(destination, origin);

    return res.json({
      success: true,
      flight: { ...flightInfo, date: date || null },
    });
  } catch (err) {
    console.error("Error in getFlightOptions:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getRealFlightOptions = async (req, res) => {
  try {
    const { origin, destination, date, userId } = req.body;
    console.log("DEBUG controller payload:", { origin, destination, date });

    if (!origin || !destination || !date || !userId) {
      return res.status(400).json({
        error: "origin, destination and date are required",
      });
    }

    const flights = await flightSearchAgent(origin, destination, date);

    const doc = await FlightSearch.create({
      userId,
      origin,
      destination,
      date,
      result: flights,
    });

    return res.json({ success: true, flights, searchId: doc._id });
  } catch (err) {
    console.error("Error in getRealFlightOptions:", err.response?.data || err.message);
    return res.status(500).json({
      error:
        err.response?.data?.errors?.[0]?.detail ||
        err.message ||
        "Failed to fetch flight options",
    });
  }
};


// Visa info only
export const getVisaInfo = async (req, res) => {
  try {
    const { nationality, destinationCountry, userId } = req.body;

    if (!nationality || !destinationCountry || !userId) {
      return res.status(400).json({
        error:
          "Missing required fields nationality and destinationCountry are required",
      });
    }

    const visa = await visaAgent(nationality, destinationCountry);

    const doc = await VisaQuery.create({
      userId,
      nationality,
      destinationCountry,
      visa,
    });

    return res.json({
      success: true,
      visa,
      queryId: doc._id,
    });
  } catch (err) {
    console.error("Error in getVisaInfoOnly:", err);
    return res.status(500).json({
      error:
        err.message ||
        "Failed to fetch visa information. Please try again later.",
    });
  }
};

// Packing list only
export const getPackingList = async (req, res) => {
  try {
    const { destination, startDate, endDate, tripType, preferences, userId } = req.body;

    if (!destination || !startDate || !endDate || !userId) {
      return res.status(400).json({
        error:
          "Missing required fields: destination, startDate, and endDate are required",
      });
    }

    const packingList = await packingListAgent({
      destination,
      startDate,
      endDate,
      tripType: tripType || "Leisure",
      preferences: preferences || "",
    });

    const doc = await PackingQuery.create({
      userId,
      destination,
      startDate,
      endDate,
      tripType: tripType || "Leisure",
      preferences: preferences || "",
      packingList,
    });

    return res.json({ success: true, packingList, packingId: doc._id });
  } catch (err) {
    console.error("Error in getPackingList:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId is required to fetch search history" });
    }

    const [
      quickTrips,
      budgetTrips,
      comprehensiveTrips,
      dailyBudgetTrips,
      visaQueries,
      packingQueries,
      flightSearches,
      weatherLogs,
      cityReviews,
    ] = await Promise.all([
      QuickTrip.find({ userId }).sort({ createdAt: -1 }).lean(),

      // Budget Optimiser only
      Trip.find({ userId, type: "BUDGET_OPTIMISER" })
        .sort({ createdAt: -1 })
        .lean(),

      // Comprehensive Full Plan only
      Trip.find({ userId, type: "COMPREHENSIVE" })
        .sort({ createdAt: -1 })
        .lean(),

      // Daily Budget only
      Trip.find({ userId, type: "DAILY_BUDGET" })
        .sort({ createdAt: -1 })
        .lean(),

      VisaQuery.find({ userId }).sort({ createdAt: -1 }).lean(),
      PackingQuery.find({ userId }).sort({ createdAt: -1 }).lean(),
      FlightSearch.find({ userId }).sort({ createdAt: -1 }).lean(),
      WeatherLog.find({ userId }).sort({ createdAt: -1 }).lean(),
      CityReview.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    return res.json({
      success: true,
      history: {
        quickTrips,
        budgetTrips,
        comprehensiveTrips,
        dailyBudgetTrips,
        visaQueries,
        packingQueries,
        flightSearches,
        weatherLogs,
        cityReviews,
      },
    });
  } catch (err) {
    console.error("Error in getSearchHistory:", err);
    return res.status(500).json({ error: err.message });
  }
};
