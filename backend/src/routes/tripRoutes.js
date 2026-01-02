// backend/src/routes/tripRoutes.js
import express from "express";
import {
  planTrip,
  planWithBudget,
  comprehensivePlan,
  travelOnMyBudget,
  getFlightOptions,
  getVisaInfo,
  getPackingList,
  getRealFlightOptions
} from "../controllers/tripController.js";


import { getWeather } from "../controllers/weatherController.js";
import { getSearchHistory } from "../controllers/tripController.js";


const router = express.Router();

// Legacy endpoints for backward compatibility
router.post("/plan", planTrip);
router.post("/budget", planWithBudget);

// New comprehensive endpoint using Agentic AI Framework
router.post("/comprehensive", comprehensivePlan);

// Travel on My Budget - Dynamic Budget Simulation Agent
router.post("/travel-on-my-budget", travelOnMyBudget);

// NEW: Flights-only endpoint for AI-generated flight options
router.post("/flights", getFlightOptions);

router.post("/visa", getVisaInfo);

router.post("/packing-list", getPackingList);

router.post("/real-flights", getRealFlightOptions);

router.get("/weather", getWeather);

router.get("/search-history", getSearchHistory);

export default router;
