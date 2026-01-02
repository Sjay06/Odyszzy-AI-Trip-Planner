// backend/src/agents/DynamicBudgetAgent.js
import costEstimator from "../utils/costEstimator.js";
import { callGeminiJSON } from "../utils/geminiClient.js";

/**
 * Dynamic Budget Simulation Agent (Gemini)
 * Returns ONLY an optimized plan that follows:
 *
 * {
 *   destination,
 *   days,
 *   dailyBudgetLimit,
 *   hotels: optimizedHotels,
 *   activities: optimizedActivities,
 *   transport: optimizedTransportKm,
 *   totals: { hotels, activities, transport, total, dailyAverage },
 *   status: "within-budget" | "over-budget",
 *   recommendations: [string]
 * }
 */
export default async function dynamicBudgetAgent(
  destination,
  days,
  dailyBudgetLimit,
  baseItinerary
) {
  if (!destination || !days || !dailyBudgetLimit) {
    throw new Error(
      "Missing required parameters: destination, days, and dailyBudgetLimit are required"
    );
  }

  if (dailyBudgetLimit <= 0) {
    throw new Error("Daily budget limit must be greater than 0");
  }

  const totalBudget = dailyBudgetLimit * days;

  // 1) Get an optimized itinerary from Gemini
  const optimizedItinerary = await optimizeItineraryForBudget(
    destination,
    days,
    dailyBudgetLimit,
    totalBudget,
    baseItinerary
  );

  // 2) Compute costs for the optimized itinerary
  const totals = calculateOptimizedTotals(optimizedItinerary, days);

  // 3) Compare with user daily budget and build status + recommendations
  const { status, recommendations } = buildStatusAndRecommendations(
    totals,
    dailyBudgetLimit,
    totalBudget,
    days,
    destination
  );

  // 4) Return EXACT requested structure
  return {
    destination,
    days,
    dailyBudgetLimit,
    hotels: optimizedItinerary.hotels || [],
    activities: optimizedItinerary.activities || [],
    transport: optimizedItinerary.transportKm || 0,
    totals, // { hotels, activities, transport, total, dailyAverage }
    status,
    recommendations
  };
}

/**
 * Use Gemini to create a cheaper itinerary.
 */
async function optimizeItineraryForBudget(
  destination,
  days,
  dailyLimit,
  totalBudget,
  baseItinerary
) {
  const systemInstruction =
    "You are a travel budget optimization expert. " +
    "Always return STRICTLY valid JSON and never include explanations outside JSON.";

  const prompt = `
TASK: Optimize the given itinerary to fit within the user's daily budget limit
while still providing an enjoyable trip.

DESTINATION: ${destination}
TRIP DURATION: ${days} days
DAILY BUDGET LIMIT: ₹${dailyLimit}
TOTAL BUDGET: ₹${totalBudget}

BASE ITINERARY (JSON):
${JSON.stringify(baseItinerary, null, 2)}

REQUIREMENTS:
1. Prefer budget or mid-range hotels that are cheaper than expensive ones.
2. Prefer free or low-cost activities where possible.
3. Reduce transportKm where obvious (cluster nearby attractions, avoid long hops).
4. Try to keep total cost ≤ TOTAL BUDGET and daily average ≤ DAILY BUDGET LIMIT.
5. If that is impossible, still return the best cheaper plan.
6. Do NOT write prose; return JSON only.

Return JSON ONLY with this exact structure:

{
  "hotels": [
    {
      "name": "Hotel name",
      "pricePerNight": 0,
      "nights": 0,
      "type": "budget | mid-range | luxury",
      "area": "optional area/neighborhood",
      "category": "optional category/tag",
      "reason": "Why this hotel was chosen"
    }
  ],
  "activities": [
    {
      "name": "Activity name",
      "price": 0,
      "day": 1,
      "category": "sightseeing | cultural | nature | adventure | food | shopping",
      "reason": "Why this activity was chosen"
    }
  ],
  "transportKm": 0,
  "optimizationNotes": "Brief explanation of changes made"
}
`;

  try {
    const result = await callGeminiJSON(prompt, systemInstruction);

    if (!result || typeof result !== "object") {
      throw new Error("Invalid response from optimizeItineraryForBudget (Gemini)");
    }

    return {
      hotels: Array.isArray(result.hotels) ? result.hotels : [],
      activities: Array.isArray(result.activities) ? result.activities : [],
      transportKm: typeof result.transportKm === "number" ? result.transportKm : 0,
      optimizationNotes: result.optimizationNotes || ""
    };
  } catch (error) {
    console.error("Error optimizing itinerary (Gemini):", error.message);
    throw new Error(
      `Failed to optimize itinerary for budget: ${error.message}`
    );
  }
}

/**
 * Calculate totals for the optimized itinerary.
 */
function calculateOptimizedTotals(itinerary, days) {
  const hotelsArr = Array.isArray(itinerary.hotels) ? itinerary.hotels : [];
  const activitiesArr = Array.isArray(itinerary.activities)
    ? itinerary.activities
    : [];

  // Hotel total = sum(pricePerNight * nights) over all hotels
  const hotels = hotelsArr.reduce((sum, h) => {
    const price = typeof h.pricePerNight === "number" ? h.pricePerNight : 0;
    const nights = typeof h.nights === "number" ? h.nights : 0;
    return sum + price * nights;
  }, 0);

  // Activities total = sum(price) over all activities
  const activities = activitiesArr.reduce((sum, a) => {
    const price = typeof a.price === "number" ? a.price : 0;
    return sum + price;
  }, 0);

  // Transport: either use explicit transportCost if you add it,
  // or keep using costEstimator as a single cost (not multiplied again)
  const transport =
    typeof itinerary.transportCost === "number"
      ? itinerary.transportCost
      : costEstimator.estimateTransportCost(itinerary.transportKm || 0);

  const total = hotels + activities + transport;
  const dailyAverage = total / Math.max(days, 1);

  return {
    hotels,
    activities,
    transport,
    total,
    dailyAverage
  };
}

/**
 * Decide status and generate recommendations based on budget gap.
 */
function buildStatusAndRecommendations(
  totals,
  dailyLimit,
  totalBudget,
  days,
  destination
) {
  const { total, dailyAverage, hotels, activities, transport } = totals;

  const withinDaily = dailyAverage <= dailyLimit;
  const withinTotal = total <= totalBudget;

  const status = withinDaily && withinTotal ? "within-budget" : "over-budget";

  const recommendations = [];

  if (status === "within-budget") {
    recommendations.push(
      "Your plan fits within your daily budget. Keep a small 5–10% buffer for unexpected expenses."
    );
    return { status, recommendations };
  }

  // Over budget: give concrete suggestions
  const requiredDaily = Math.ceil(total / days);

  recommendations.push(
    `Current daily average is ₹${dailyAverage.toFixed(
      0
    )}. Increase your daily budget to about ₹${requiredDaily} OR reduce costs.`
  );

  if (hotels >= activities) {
    recommendations.push(
      "Switch some stays to hostels or budget hotels, or reduce nights in premium properties."
    );
  }

  if (activities > hotels) {
    recommendations.push(
      `Replace expensive activities with free sights in ${destination}, such as public viewpoints, beaches, or markets.`
    );
  }

  if (transport > 0) {
    recommendations.push(
      "Cluster nearby attractions on the same day and rely more on public transport to cut transport costs."
    );
  }

  return { status, recommendations };
}
